import { NextFunction, Response } from 'express'
import redis from '../helpers/redis'
import { httpBody } from '../utils'
import { ExpressRequest } from '../type'

const verifyPath = [
  'post:/api/login',
  'get:/api/send_sms',
  'get:/api/pay/notify',
  'post:/api/pay/notify',
  'get:/api/config',
  'get:/api/persona',
  'get:/api/images'
  //   'post:/api/upload'
]

// Verify
async function verify(req: ExpressRequest, res: Response, next: NextFunction) {
  const { token } = req.headers
  const { path, method } = req
  const filter = verifyPath.filter(
    (router) => router.toUpperCase() === `${method}:${path}`.toUpperCase()
  )

  const isToken = (!token || token === 'undefined' || token === 'null') ? false : true

  if ((filter.length || path.indexOf('/api') === -1) && !isToken) {
    await next()
    return
  }

  const redisTokenKey = `token:${token}`
  let tokenInfo: any = (await redis.select(1).get(redisTokenKey)) || null

  if (tokenInfo) {
    // Currently frontend user login
    try {
      tokenInfo = JSON.parse(tokenInfo)
    } catch (e) {
      redis.select(1).del(redisTokenKey)
      res.status(401).json(httpBody(4001, 'User token expired, please login again!'))
      return
    }
  } else {
    res.status(401).json(httpBody(4001, 'Please login to your account and try again!'))
    return
  }

  // Add another layer to check if accessing backend interface
  if (path.indexOf('/api/admin') !== -1 && tokenInfo?.role !== 'administrator') {
    res.status(403).json(httpBody(-1, 'Access denied, please contact the website administrator!'))
    return
  }

  req.user_id = tokenInfo?.id
  next()
}
export default verify
