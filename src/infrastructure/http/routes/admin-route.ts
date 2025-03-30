import { FastifyInstance } from 'fastify'
import { TYPES } from '@/types'
import { AdminController } from '@/app/controllers/admin-controller'
import {
  createSubjectSchema,
  deleteCarouselParamsSchema,
  deleteContactParamsSchema,
  deleteSubjectParamsSchema,
  deleteUserParamsSchema,
  editContactSchema,
  editSubjectSchema,
  getAllContactsResponseSchema,
  getAllUsersResponseSchema,
  getEnrolledUsersResponseSchema
} from '@/domain/schemas/admin-schemas'
import { carouselImageUpload, pdfUpload } from '@/infrastructure/config/multer'

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
        consumes: ['multipart/form-data'],
        response: {
          201: { type: 'null' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin],
      preHandler: carouselImageUpload.single('carouselImage')
    },
    adminController.createCarousel.bind(adminController)
  )

  // Update carousel
  fastify.put<{ Params: { id: string } }>(
    '/admin/carousels/:id',
    {
      schema: {
        tags: ['Admin'],
        consumes: ['multipart/form-data'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          },
          required: ['id']
        },
        response: {
          200: { type: 'null' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin],
      preHandler: carouselImageUpload.single('carouselImage')
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
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            search: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              carousels: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    imageUrl: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                  }
                }
              },
              total: { type: 'number' },
              page: { type: 'number' },
              limit: { type: 'number' },
              totalPages: { type: 'number' },
              hasPreviousPage: { type: 'boolean' },
              hasNextPage: { type: 'boolean' }
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
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            search: { type: 'string' }
          }
        },
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
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 },
            search: { type: 'string' }
          }
        },
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

  // Export users as CSV
  fastify.get(
    '/admin/users/export-csv',
    {
      schema: {
        tags: ['Admin'],
        response: {
          200: { type: 'string' }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.exportUsersAsCSV.bind(adminController)
  )

  // Import users from CSV
  fastify.post(
    '/admin/users/import-csv',
    {
      schema: {
        tags: ['Admin'],
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin],
      preHandler: pdfUpload.single('csv')
    },
    adminController.importUsersFromCSV.bind(adminController)
  )

  // Get admin dashboard statistics
  fastify.get(
    '/admin/dashboard/stats',
    {
      schema: {
        tags: ['Admin'],
        response: {
          200: {
            type: 'object',
            properties: {
              totalUsers: { type: 'number' },
              totalEnrollments: { type: 'number', description: 'Total number of subject enrollments' },
              totalSubjects: { type: 'number' },
              totalContacts: { type: 'number' },
              recentUsers: {
                type: 'array',
                items: {
                  type: 'object'
                }
              },
              usersByRole: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    role: { type: 'string' },
                    count: { type: 'number' }
                  }
                }
              },
              monthlySignups: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    month: { type: 'string' },
                    count: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    adminController.getDashboardStats.bind(adminController)
  )
}
