import { FastifyInstance } from 'fastify'
import { TYPES } from '@/types'
import { AdminController } from '@/app/controllers/admin-controller'
import {
  createCarouselSchema,
  createSubjectSchema,
  deleteCarouselParamsSchema,
  deleteContactParamsSchema,
  deleteSubjectParamsSchema,
  deleteUserParamsSchema,
  editContactSchema,
  editSubjectSchema,
  getAllContactsResponseSchema,
  getAllUsersResponseSchema,
  getEnrolledUsersResponseSchema,
  updateCarouselSchema
} from '@/domain/schemas/admin-schemas'

export default async function adminRoutes(fastify: FastifyInstance) {
  const adminController = fastify.container.get<AdminController>(TYPES.AdminController)

  fastify.get(
    '/admin/enrolled-users',
    {
      schema: {
        tags: ['Admin'],
        response: {
          200: getEnrolledUsersResponseSchema
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.getEnrolledUsers.bind(adminController)
  )

  fastify.post(
    '/admin/carousels',
    {
      schema: {
        tags: ['Admin'],
        body: createCarouselSchema,
        response: {
          201: { type: 'null' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.createCarousel.bind(adminController)
  )

  // Update carousel
  fastify.put(
    '/admin/carousels',
    {
      schema: {
        tags: ['Admin'],
        body: updateCarouselSchema,
        response: {
          200: { type: 'null' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.updateCarousel.bind(adminController)
  )

  // Delete carousel
  fastify.delete(
    '/admin/carousels/:id',
    {
      schema: {
        tags: ['Admin'],
        params: deleteCarouselParamsSchema,
        response: {
          200: { type: 'null' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.deleteCarousel.bind(adminController)
  )

  // Get all carousels
  fastify.get(
    '/admin/carousels',
    {
      schema: {
        tags: ['Admin'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                publicId: { type: 'string' },
                url: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      },
      onRequest: []
    },
    adminController.getCarousels.bind(adminController)
  )
  fastify.get(
    '/admin/users',
    {
      schema: {
        tags: ['Admin'],
        response: {
          200: getAllUsersResponseSchema
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.getAllUsers.bind(adminController)
  )

  fastify.get(
    '/admin/contacts',
    {
      schema: {
        tags: ['Admin'],
        response: {
          200: getAllContactsResponseSchema
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.getAllContact.bind(adminController)
  )

  fastify.put(
    '/admin/contacts/:contactId',
    {
      schema: {
        tags: ['Admin'],
        params: deleteContactParamsSchema,
        body: editContactSchema,
        response: {
          200: { type: 'null' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.editContact.bind(adminController)
  )

  fastify.delete(
    '/admin/contacts/:contactId',
    {
      schema: {
        tags: ['Admin'],
        params: deleteContactParamsSchema,
        response: {
          200: { type: 'null' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.deleteContact.bind(adminController)
  )

  fastify.post(
    '/admin/subjects',
    {
      schema: {
        tags: ['Admin'],
        body: createSubjectSchema,
        response: {
          201: { type: 'null' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.createSubject.bind(adminController)
  )

  fastify.put(
    '/admin/subjects/:subjectId',
    {
      schema: {
        tags: ['Admin'],
        params: deleteSubjectParamsSchema,
        body: editSubjectSchema,
        response: {
          200: { type: 'null' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.editSubject.bind(adminController)
  )

  fastify.delete(
    '/admin/subjects/:subjectId',
    {
      schema: {
        tags: ['Admin'],
        params: deleteSubjectParamsSchema,
        response: {
          200: { type: 'null' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.deleteSubject.bind(adminController)
  )

  fastify.delete(
    '/admin/users/:userId',
    {
      schema: {
        tags: ['Admin'],
        params: deleteUserParamsSchema,
        response: {
          200: { type: 'null' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.deleteUser.bind(adminController)
  )
}
