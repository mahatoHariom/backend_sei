import { FastifyInstance } from 'fastify'
import authRoutes from './http/routes/auth-route'
import userRoutes from './http/routes/users-routes'
import contactRoutes from './http/routes/contact-route'
import subjectRoutes from './http/routes/subject-route'
import adminRoutes from './http/routes/admin-route'
// import pdfRoutes from './http/routes/pdf-route'
import practiceRoutes from './http/routes/practise-route'
import pdfRoutes from './http/routes/pdf-route'

export async function registerRoutes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: '/api/v1/auth' })
  app.register(userRoutes, { prefix: '/api/v1/user' })
  app.register(contactRoutes, { prefix: '/api/v1/user' })
  app.register(subjectRoutes, { prefix: '/api/v1' })
  app.register(adminRoutes, { prefix: '/api/v1' })
  app.register(pdfRoutes, { prefix: '/api/v1' })
  app.register(practiceRoutes, { prefix: '/api/v1' })
  app.get('/health', async () => ({ status: 'ok' }))
}
