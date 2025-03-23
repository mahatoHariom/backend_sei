import { FastifyReply, FastifyRequest } from 'fastify'
import { inject, injectable } from 'inversify'
import { TYPES } from '@/types'
import { SubjectService } from '../services/subject-service'
import { Subject } from '@prisma/client'

@injectable()
export class SubjectController {
  constructor(@inject(TYPES.SubjectService) private subjectService: SubjectService) {}

  async getAllSubjects(
    request: FastifyRequest<{
      Querystring: { page?: number; limit?: number; search?: string }
    }>,
    reply: FastifyReply
  ) {
    const { page, limit, search } = request.query
    const result = await this.subjectService.getAllSubjects(page, limit, search)
    return reply.status(200).send(result)
  }
}
