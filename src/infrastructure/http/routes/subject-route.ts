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
          200: subjectsResponseSchema
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
