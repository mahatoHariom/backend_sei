import { TYPES } from '@/types'
import { inject, injectable } from 'inversify'
import { FastifyReply, FastifyRequest } from 'fastify'
import ApiError from '@/infrastructure/config/ApiError'
import { Messages, StatusCode } from '@/domain/constants/messages'
import { ContactService } from '../services/contact-service'
import { CreateContactInput } from '@/domain/schemas/contact-schema'
import { PrismaAuthRepository } from '@/domain/repositories/auth-repository'

@injectable()
export class ContactController {
  constructor(
    @inject(TYPES.ContactService) private contactService: ContactService,
    @inject(TYPES.IAuthRepository) private authRepository: PrismaAuthRepository
  ) {}

  async createContact(
    request: FastifyRequest<{ Body: CreateContactInput; Params: { userId: string } }>,
    reply: FastifyReply
  ) {
    const data = request.body
    const userId = request.params.userId

    const user = await this.authRepository.findById(request.params?.userId)

    if (!user) {
      throw new ApiError(Messages.INVALID_CREDENTIAL, StatusCode.Unauthorized)
    }

    await this.contactService.createContact(data, userId)
    return reply.status(201).send()
  }
}
