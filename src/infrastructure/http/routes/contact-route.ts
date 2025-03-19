import { FastifyInstance } from 'fastify'
import { TYPES } from '@/types'
import { ContactController } from '@/app/controllers/contact-controller'
import { createContactSchema, createContactResponseSchema } from '@/domain/schemas/contact-schema'

export default async function contactRoutes(fastify: FastifyInstance) {
  const contactController = fastify.container.get<ContactController>(TYPES.ContactController)

  fastify.post(
    '/contact/:userId',
    {
      schema: {
        tags: ['Contact'],
        body: createContactSchema,
        response: {
          201: { type: 'null' }
        }
      },
      onRequest: fastify.authenticate
    },
    contactController.createContact.bind(contactController) // Bind the controller method
  )
}
