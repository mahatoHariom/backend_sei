// import { FastifySwaggerUiOptions } from '@fastify/swagger-ui'

import { FastifySwaggerUiOptions } from '@fastify/swagger-ui'

// export const swaggerOptions = {
//   openapi: {
//     info: {
//       title: 'Fastify API',
//       description: 'PostgreSQL, Prisma, Fastify, and Swagger REST API',
//       version: '1.0.0'
//     },
//     externalDocs: {
//       url: 'https://swagger.io',
//       description: 'Find more info here'
//     },
//     servers: [{ url: 'http://localhost:9000' }],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT'
//         }
//       }
//     },
//     security: [{ bearerAuth: [] }]
//   }
// }

// export const swaggerUiOptions: FastifySwaggerUiOptions = {
//   routePrefix: '/docs',
//   initOAuth: {},
//   uiConfig: {
//     docExpansion: 'full',
//     deepLinking: false
//   },
//   uiHooks: {
//     onRequest: function (request, reply, next) {
//       next()
//     },
//     preHandler: function (request, reply, next) {
//       next()
//     }
//   },
//   staticCSP: true,
//   transformStaticCSP: (header: string) => header
// }

// src/config/swagger.config.ts

export const swaggerOptions = {
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
    servers: [{ url: 'https://api.seiinstitute.com' }],
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
}

export const swaggerUiOptions: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  initOAuth: {},
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next()
    },
    preHandler: function (request, reply, next) {
      next()
    }
  },
  staticCSP: true,
  transformStaticCSP: (header: string) => header
}
