import express from 'express'
import redis from '../../helpers/redis'
import {
    configModel,
    aikeyModel,
    notificationModel,
    personaModel
} from '../../models'
import {
    generateCode,
    httpBody,
    getClientIP,
    distanceTime,
    generateUUID
} from '../../utils'
import { HttpBody } from '../../utils/httpBody'
import { sendMail } from '../../helpers/mailer'
import emailTemplate from '../../helpers/mailer/emailTemplate'
import { sendSms } from '../../helpers/sms'
import { ExpressRequest } from '../../type'

const router = express.Router()

// Get configuration information
router.get('/config', async (req, res, next) => {
    const shop_introduce = await configModel.getConfigValue('shop_introduce')
    const user_introduce = await configModel.getConfigValue('user_introduce')
    const invite_introduce = await configModel.getConfigValue('invite_introduce')
    const website_title = await configModel.getConfigValue('website_title')
    const website_description = await configModel.getConfigValue('website_description')
    const website_keywords = await configModel.getConfigValue('website_keywords')
    const website_logo = await configModel.getConfigValue('website_logo')
    const website_footer = await configModel.getConfigValue('website_footer')
    const notification = await notificationModel.getNotification(
        { page: 0, page_size: 1000 },
        { status: 1 }
    )
    const notifications = notification.rows.sort((a: any, b: any) => {
        return a.sort - b.sort
    })

    const models = await aikeyModel.getAiKeyModels({})

    const random_personas = await personaModel.getRandomPersonas()
    res.json(
        httpBody(0, {
            shop_introduce,
            user_introduce,
            notifications: notifications,
            website_title,
            website_description,
            website_keywords,
            website_logo,
            website_footer,
            invite_introduce,
            random_personas,
            ...models
        })
    )
})

// Send verification code
router.get('/send_sms', async (req, res, next) => {
    try {
        const source: string = Array.isArray(req.query.source)
            ? String(req.query.source[0])
            : String(req.query.source)

        if (!source || source === 'undefined' || source === 'null') {
            res.json(httpBody(-1, 'Please enter email or phone number'))
            return
        }

        const ip = getClientIP(req)
        console.log(`[VERIFY CODE] Request from IP: ${ip}, Source: ${source}`)

        // Development mode: Skip rate limiting or make it very lenient
        const isDevelopment = process.env.NODE_ENV !== 'production'
        
        // Generate code immediately
        const code = await generateCode()
        console.log(`[VERIFY CODE] Generated code: ${code} for ${source}`)

        // In development mode, skip all slow operations and return immediately
        if (isDevelopment) {
            console.log(`[DEV MODE] Rate limiting skipped for IP: ${ip}`)
            
            // Save code to Redis with timeout
            try {
                await Promise.race([
                    redis.select(0).setex(`code:${source}`, code, 600),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 3000))
                ])
                console.log(`[VERIFY CODE] Code saved to Redis for ${source}. Expires in 600 seconds.`)
            } catch (redisError) {
                console.error('[VERIFY CODE] Redis save error (non-critical in dev):', redisError)
                // Continue anyway in dev mode
            }
            
            // Return immediately with code (include code in response for development)
            console.log(`[DEV MODE] ==========================================`)
            console.log(`[DEV MODE] VERIFICATION CODE FOR ${source}: ${code}`)
            console.log(`[DEV MODE] ==========================================`)
            res.json({
                code: 0,
                data: { verification_code: code },
                message: `Verification code generated: ${code}`
            })
            return
        }
        
        // Production mode: Full flow with rate limiting
        const maxRequests = 6
        const limitAny = async (value: string, prefix = 'code', number = maxRequests) => {
            try {
                const KEY = `limit:${prefix}:${value}`
                const limitData = await Promise.race([
                    redis.select().get(KEY),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 2000))
                ]) as string | null
                const time = distanceTime() || 1
                if (limitData && Number(limitData) >= number) {
                    redis.select().expire(KEY, 60 * 60 * 24)
                    return httpBody(-1, 'Too many requests, please try again later!')
                }
                if (limitData && Number(limitData) < number) {
                    const value = Number(limitData) + 1
                    redis.select().setex(KEY, value, time)
                    return httpBody(0)
                }
                redis.select().setex(KEY, 1, time)
                return httpBody(0)
            } catch (error) {
                console.error('[VERIFY CODE] Rate limit error:', error)
                return httpBody(0) // Allow request if rate limit check fails
            }
        }

        const limit = await limitAny(ip)
        if (limit.code) {
            res.json(limit)
            return
        }

        let result: HttpBody | undefined

        const phoneRegex = /^1[3456789]\d{9}$/
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        
        const isPhone = phoneRegex.test(source)
        const isEmail = emailRegex.test(source)

        if (isPhone) {
            let smsConfig: { [key: string]: string } = {}
            try {
                // Add timeout to database query
                const smsConfigStr = await Promise.race([
                    configModel.getConfigValue('sms'),
                    new Promise<string>((resolve) => setTimeout(() => resolve(''), 2000))
                ]) as string || ''
                if (!smsConfigStr || smsConfigStr === '') {
                    // SMS not configured - development mode: log code and continue
                    if (isDevelopment) {
                        console.log(`[DEV MODE] Verification code for ${source}: ${code}`)
                        result = httpBody(0, 'Code generated (SMS not configured, check console)')
                    } else {
                        res.json(httpBody(-1, 'SMS service not configured. Please configure SMS in admin panel.'))
                        return
                    }
                } else {
                    smsConfig = JSON.parse(smsConfigStr)
                    const { sign, template, password, user } = smsConfig
                    if (!user || !password || !sign || !template) {
                        // SMS config incomplete - development mode: log code and continue
                        if (isDevelopment) {
                            console.log(`[DEV MODE] Verification code for ${source}: ${code}`)
                            result = httpBody(0, 'Code generated (SMS config incomplete, check console)')
                        } else {
                            res.json(httpBody(-1, 'SMS service configuration incomplete'))
                            return
                        }
                    } else {
                        const content = template.replace('{code}', code).replace('{time}', '10')
                        result = await sendSms({
                            user,
                            password,
                            content: `【${sign}】${content}`,
                            phone: source
                        })
                    }
                }
            } catch (error) {
                // SMS config parse error - development mode: log code and continue
                if (isDevelopment) {
                    console.log(`[DEV MODE] Verification code for ${source}: ${code}`)
                    console.log(`[DEV MODE] SMS config error:`, error)
                    result = httpBody(0, 'Code generated (SMS config error, check console)')
                } else {
                    res.json(httpBody(-1, 'SMS service configuration error'))
                    return
                }
            }
        } else if (isEmail) {
            let emailConfig: { [key: string]: string } = {}
            try {
                // Add timeout to database query
                const emailConfigStr = await Promise.race([
                    configModel.getConfigValue('email'),
                    new Promise<string>((resolve) => setTimeout(() => resolve(''), 2000))
                ]) as string || ''
                if (!emailConfigStr || emailConfigStr === '') {
                    // Email not configured - development mode: log code and continue
                    if (isDevelopment) {
                        console.log(`[DEV MODE] Verification code for ${source}: ${code}`)
                        result = httpBody(0, 'Code generated (Email not configured, check console)')
                    } else {
                        res.json(httpBody(-1, 'Email service not configured. Please configure Email in admin panel.'))
                        return
                    }
                } else {
                    emailConfig = JSON.parse(emailConfigStr)
                    const { host, port, user, pass, subject, from_title } = emailConfig
                    if (!host || !port || !user || !pass) {
                        // Email config incomplete - development mode: log code and continue
                        if (isDevelopment) {
                            console.log(`[DEV MODE] Verification code for ${source}: ${code}`)
                            result = httpBody(0, 'Code generated (Email config incomplete, check console)')
                        } else {
                            res.json(httpBody(-1, 'Email service configuration incomplete'))
                            return
                        }
                    } else {
                        result = await sendMail({
                            to: source,
                            body: emailTemplate.code(code, from_title),
                            subject,
                            fromTitle: from_title,
                            options: {
                                host,
                                port,
                                auth: {
                                    user,
                                    pass
                                }
                            }
                        })
                    }
                }
            } catch (error) {
                // Email config parse error - development mode: log code and continue
                if (isDevelopment) {
                    console.log(`[DEV MODE] Verification code for ${source}: ${code}`)
                    console.log(`[DEV MODE] Email config error:`, error)
                    result = httpBody(0, 'Code generated (Email config error, check console)')
                } else {
                    res.json(httpBody(-1, 'Email service configuration error'))
                    return
                }
            }
        } else {
            // Invalid format - but in dev mode, still generate code
            if (isDevelopment) {
                console.log(`[DEV MODE] Verification code for ${source}: ${code}`)
                console.log(`[DEV MODE] Warning: ${source} is not a valid phone or email format`)
                result = httpBody(0, 'Code generated (Invalid format, check console)')
            } else {
                res.json(httpBody(-1, 'Invalid phone number or email format'))
                return
            }
        }

        // Only return error if result has error code AND we're not in development mode
        if (result?.code && result.code !== 0) {
            res.json(result)
            return
        }

        // Save code to Redis (works in both dev and production)
        try {
            await redis.select(0).setex(`code:${source}`, code, 600)
            console.log(`[VERIFY CODE] Code saved to Redis for ${source}. Expires in 600 seconds.`)
        } catch (redisError) {
            console.error('[VERIFY CODE] Redis save error:', redisError)
            // In development, still return success even if Redis fails
            if (isDevelopment) {
                console.log(`[DEV MODE] Redis error, but code is: ${code}`)
            } else {
                res.json(httpBody(-1, 'Failed to save verification code. Please try again.'))
                return
            }
        }
        
        // In development, always return success and log the code
        if (isDevelopment) {
            console.log(`[DEV MODE] ==========================================`)
            console.log(`[DEV MODE] VERIFICATION CODE FOR ${source}: ${code}`)
            console.log(`[DEV MODE] ==========================================`)
            res.json(httpBody(0, `Code generated successfully. Check server console for code: ${code}`))
        } else {
            res.json(httpBody(0, 'Sent successfully'))
        }
    } catch (error) {
        console.error('[VERIFY CODE] Unexpected error:', error)
        res.json(httpBody(-1, 'Failed to generate verification code. Please try again.'))
    }
})

import upload from '../../helpers/upload'
import multer from 'multer'
const multerStorage = multer()
router.post('/upload', multerStorage.single('file'), async (req: ExpressRequest, res, next) => {
	const user_id = req?.user_id
    if (!user_id) {
        res.status(500).json(httpBody(-1, 'Please login again and retry'))
        return
    }

	const file = req.file
    if(!file){
        res.json(httpBody(401, [], 'Missing required file (file)'))
        return
    }
	const cloud_storage = await configModel.getConfigValue('cloud_storage')
	const json = cloud_storage ? JSON.parse(cloud_storage) : {}
    const data = await upload(file, {
        host: req.get('host'),
		...json
    }, { user_id })
	res.json(data)
})

export default router
