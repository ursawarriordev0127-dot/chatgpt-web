import express from 'express'
import { filterObjectNull, generateNowflakeId, httpBody, pagingData } from '../../utils'
import { aikeyModel } from '../../models'
import keyUsage from '../../helpers/keyUsage'
import { checkAiKeyQueue } from '../../helpers/queue'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { HttpProxyAgent } from 'http-proxy-agent'
const router = express.Router()

// Get proxy agent from environment variables
function getProxyAgent(): HttpsProxyAgent<string> | HttpProxyAgent<string> | undefined {
  const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy
  if (httpsProxy) {
    try {
      const url = new URL(httpsProxy)
      console.log(`[Proxy] Using proxy: ${url.protocol}//${url.hostname}:${url.port}`)
      if (url.protocol === 'https:') {
        return new HttpsProxyAgent<string>(httpsProxy)
      } else {
        return new HttpProxyAgent<string>(httpsProxy)
      }
    } catch (error) {
      console.error('[Proxy Error] Invalid proxy URL:', httpsProxy, error)
      return undefined
    }
  }
  return undefined
}

router.get('/aikey', async function (req, res, next) {
    const { page, page_size } = pagingData({
        page: req.query.page,
        page_size: req.query.page_size
    })
    const tokens = await aikeyModel.getAikeys({ page, page_size })
    res.json(httpBody(0, tokens))
})

router.delete('/aikey/:id', async function (req, res, next) {
    const { id } = req.params
    if (!id) {
        res.json(httpBody(-1, '缺少必要参数'))
        return
    }
    const delRes = await aikeyModel.delAikey(id)
    res.json(httpBody(0, delRes))
})

router.post('/aikey', async function (req, res, next) {
    const { key, host, remarks, models, type, check = 1, status } = req.body
    if (!key || !host || !models) {
        res.json(httpBody(-1, '缺少必要参数'))
        return
    }
    const id = generateNowflakeId(1)()
    const addRes = await aikeyModel.addAikey({
        id,
        key, host, remarks, status, models, type,
		check
    })
    res.json(httpBody(0, addRes))
})

router.put('/aikey', async function (req, res, next) {
    const { id, key, host, remarks, models, type, status, check } = req.body
    if (!id || !key || !host || !models) {
        res.json(httpBody(-1, '缺少必要参数'))
        return
    }
    const editRes = await aikeyModel.editAikey(id, {
        key, host, remarks, status, models, type,
		check
    })
    res.json(httpBody(0, editRes))
})

router.post('/aikey/check', async function (req, res, next) {
    // 这块等待优化
    const { key, host, all, type } = req.body
    if(all){
        const tokens = await aikeyModel.getAikeys({page: 0, page_size: 1000}, {
            status: 1,
			check: 1,
        })
        const list = tokens.rows
        list.forEach((item)=>{
            checkAiKeyQueue.addTask({
                ...item.toJSON()
            })
        })
        res.json(httpBody(0, '提交成功'))
        return
    }
    if (!key || !host) {
        res.json(httpBody(-1, '缺少必要参数'))
        return
    }
    const rese = await keyUsage({host, key, type})
    res.json(httpBody(0, rese))
})

router.post('/aikey/fetch-models', async function (req, res, next) {
    const { key, host } = req.body
    if (!key || !host) {
        res.json(httpBody(-1, 'Missing required parameters: key and host'))
        return
    }

    try {
        const fetch = (await import('node-fetch')).default
        const modelsUrl = `${host}/v1/models`
        const response = await fetch(modelsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json'
            }
        })

        if (response.status !== 200) {
            const errorData = await response.json().catch(() => ({}))
            res.json(httpBody(-1, errorData.error?.message || `Failed to fetch models: ${response.statusText}`))
            return
        }

        const data = await response.json()
        const models = data.data || []
        
        // Filter and format models - only include chat models and common models
        const chatModels = models
            .filter((model: any) => {
                const id = model.id || ''
                // Include GPT models, o1, o3 models, and other chat models
                return id.includes('gpt') || 
                       id.includes('o1') || 
                       id.includes('o3') ||
                       id.includes('davinci') ||
                       id.includes('text-') ||
                       id.includes('code-')
            })
            .map((model: any) => ({
                label: model.id,
                value: model.id,
                created: model.created,
                owned_by: model.owned_by
            }))
            .sort((a: any, b: any) => {
                // Sort by model name
                return a.value.localeCompare(b.value)
            })

        res.json(httpBody(0, chatModels))
    } catch (error: any) {
        console.error('[Fetch Models Error]', error)
        res.json(httpBody(-1, error.message || 'Failed to fetch models'))
    }
})

export default router

