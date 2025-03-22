import 'reflect-metadata'
import fastify, { FastifyInstance } from 'fastify'
import { errorHandler } from './app/middlewares/errorHandler'
import { container } from './infrastructure/container'
import { loadEnvironment } from './infrastructure/environment'
import { registerPlugins } from './infrastructure/plugins'
import { registerMiddlewares } from './infrastructure/middlewares'
import { registerRoutes } from './infrastructure/routes'
import multer from 'fastify-multer'
import formBody from '@fastify/formbody'
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'

import path from 'path'
import CheckAdminRole from './app/middlewares/check-admin'

/**
 * Creates and configures the Fastify application
 */

const createApp = async (): Promise<FastifyInstance> => {
  // Load environment variables

  loadEnvironment()
  // Initialize Fastify with logger
  const app = fastify({
    logger: true,
    ajv: {
      customOptions: {
        removeAdditional: 'all',
        coerceTypes: true,
        useDefaults: true
      }
    }
  })

  try {
    // Register all plugins
    await registerPlugins(app)

    // Register all middlewares
    await registerMiddlewares(app)

    // Decorate app with DI container
    app.decorate('container', container)

    app.register(fastifyStatic, {
      root: path.join(__dirname, '../uploads'),
      prefix: '/uploads', // URL prefix for accessing files
      decorateReply: true,
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', 'https://seiinstitute.com')
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      }
    })

    await app.register(formBody)
    app.register(multipart, {
      limits: {
        fieldNameSize: 100,
        fieldSize: 1000000,
        fields: 10,
        fileSize: 30 * 1024 * 1024,
        files: 1
      }
    })
    await registerRoutes(app)

    // Set global error handler
    app.setErrorHandler(errorHandler)

    return app
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

export default createApp
