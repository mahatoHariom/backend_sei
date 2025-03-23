import { FastifyInstance } from 'fastify'
import { TYPES } from '@/types'
import { SubjectController } from '@/app/controllers/subject-controller'
import { subjectsResponseSchema } from '@/domain/schemas/subject-schema'
import { enrollSubjectBody, EnrollSubjectInput } from '@/domain/schemas/user-schema'
import { UserControllers } from '@/app/controllers/users-controller'

export default async function subjectRoutes(fastify: FastifyInstance) {
  const subjectController = fastify.container.get<SubjectController>(TYPES.SubjectController)

  const userControllers = fastify.container.get<UserControllers>(TYPES.UserControllers)
  fastify.get(
    '/subjects',
    {
      schema: {
        tags: ['Subject'],
        response: {
          200: {
            type: 'object',
            properties: {
              subjects: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: ['string', 'null'] },
                    createdAt: { type: 'string' },
                    updatedAt: { type: ['string', 'null'] },
                    users: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          userId: { type: 'string' }
                        }
                      }
                    }
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
      }
    },
    subjectController.getAllSubjects.bind(subjectController)
  ),
    fastify.post(
      '/subject/enroll',
      {
        schema: {
          tags: ['Subject'],
          body: enrollSubjectBody,
          response: {
            201: { type: 'null' }
          }
        },
        onRequest: fastify.authenticate
      },
      userControllers.enrollInSubject.bind(userControllers)
    )
}
