import { FastifyReply, FastifyRequest } from 'fastify'
import { inject, injectable } from 'inversify'
import { TYPES } from '@/types'
import { SubjectService } from '../services/subject-service'
import { Subject } from '@prisma/client'

@injectable()
export class SubjectController {
  constructor(@inject(TYPES.SubjectService) private subjectService: SubjectService) {}

  async getAllSubjects(request: FastifyRequest, reply: FastifyReply): Promise<Subject[]> {
    const subjects = await this.subjectService.getAllSubjects()
    return reply.status(200).send(subjects)
  }
}
