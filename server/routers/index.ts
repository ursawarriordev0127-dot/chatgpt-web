import { Express } from 'express'
import apis from './apis'
import adminRouters from './admin'

export default (app: Express) => {
  // Frontend user APIs
  app.use('/api', [...apis])
  // Admin backend APIs
  app.use('/api/admin', [...adminRouters])

  return app
}
