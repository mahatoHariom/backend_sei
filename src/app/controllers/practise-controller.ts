import { FastifyRequest, FastifyReply } from 'fastify'
import { injectable, inject } from 'inversify'
import { TYPES } from '@/types'

import { Difficulty } from '@prisma/client'
import { PracticeService } from '../services/practise-service'
// import { PracticeService } from '../services/prisma-service'

@injectable()
export class PracticeController {
  constructor(@inject(TYPES.PracticeService) private practiceService: PracticeService) {}

  async startPractice(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log('Received request:', request.body) // Debugging request data

      const { subjectId, difficulty } = request.body as { subjectId: string; difficulty: Difficulty }
      console.log('Starting practice for:', { subjectId, difficulty, userId: request.user.id })

      const practice = await this.practiceService.createPractice(request.user.id, subjectId, difficulty)

      console.log('Practice created successfully:', practice)
      return reply.status(201).send(practice)
    } catch (error) {
      console.error('Error in startPractice:', error)
      request.log.error(error)
      console.log(error, 'this error')
      return reply.status(500).send({ error: 'Failed to create practice session' })
    }
  }

  async submitAnswer(
    request: FastifyRequest<{
      Params: { practiceId: string; questionId: string }
      Body: { answerId: string }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { practiceId, questionId } = request.params
      const { answerId } = request.body
      const result = await this.practiceService.submitAnswer(practiceId, questionId, answerId)
      return reply.send(result)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Failed to submit answer' })
    }
  }

  async getUserPractices(
    request: FastifyRequest<{
      Querystring: { page?: number; limit?: number }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10 } = request.query
      const practices = await this.practiceService.getUserPractices(request.user.id, page, limit)
      return reply.send(practices)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Failed to fetch user practices' })
    }
  }
}
