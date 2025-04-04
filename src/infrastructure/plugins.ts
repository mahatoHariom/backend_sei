import { FastifyInstance } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCookie from '@fastify/cookie'

import helmet from '@fastify/helmet'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import rateLimit from '@fastify/rate-limit'

import { swaggerUiOptions } from './config/swagger'
// import { swaggerUiOptions } from '../config/swagger'

export async function registerPlugins(app: FastifyInstance) {
  // Security plugins
  // await app.register(cors, {
  //   credentials: true,
  //   origin: ['https://seiinstitute.com', 'http://localhost:3000/', 'http://localhost:3000']
  //   // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  //   // allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
  // })

  await app.register(helmet)

  await app.register(rateLimit, {
    max: 100000,
    timeWindow: '1 minute'
  })

  // Authentication plugins
  await app.register(fastifyCookie, {
    secret: process.env.JWT_SECRET,
    hook: false,
    parseOptions: {}
  })

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET as string
  })

  // Documentation plugins
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Fastify API',
        description: 'PostgreSQL, Prisma, Fastify, and Swagger REST API',
        version: '1.0.0'
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      servers: [
        {
          url: 'http://api.seiinstitute.com'
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  })

  await app.register(swaggerUi, swaggerUiOptions)
}
