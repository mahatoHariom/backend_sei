import { FastifyInstance } from 'fastify'
import { TYPES } from '@/types'
import { PracticeController } from '@/app/controllers/practise-controller'
// import { PracticeController } from '@/app/controllers/practice-controller'

export default async function practiceRoutes(fastify: FastifyInstance) {
  const practiceController = fastify.container.get<PracticeController>(TYPES.PracticeController)

  fastify.post(
    '/practice',
    {
      schema: {
        body: {
          type: 'object',
          required: ['subjectId', 'difficulty'],
          properties: {
            subjectId: { type: 'string' },
            difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] }
          }
        }
      },
      onRequest: [fastify.authenticate]
    },
    practiceController.startPractice.bind(practiceController)
  )

  fastify.post(
    '/practice/:practiceId/questions/:questionId',
    {
      schema: {
        params: {
          type: 'object',
          required: ['practiceId', 'questionId'],
          properties: {
            practiceId: { type: 'string' },
            questionId: { type: 'string' }
          }
        },
        body: {
          type: 'object',
          required: ['answerId'],
          properties: {
            answerId: { type: 'string' }
          }
        }
      },
      onRequest: [fastify.authenticate]
    },
    practiceController.submitAnswer.bind(practiceController)
  )

  fastify.get(
    '/practice/history',
    {
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', minimum: 1 },
            limit: { type: 'number', minimum: 1 }
          }
        }
      },
      onRequest: [fastify.authenticate]
    },
    practiceController.getUserPractices.bind(practiceController)
  )
}
