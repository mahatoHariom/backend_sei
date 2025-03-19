import { Prisma, User } from '@prisma/client'
import { injectable } from 'inversify'
import { IAuthRepository } from '../interfaces/auth-interface'

import { PrismaService } from '@/app/services/prisma-service'
import { IContactRepository } from '../interfaces/contact-interface'

@injectable()
export class PrismaContactRepository implements IContactRepository {
  private readonly prisma = PrismaService.getClient()

  async create(data: Prisma.ContactCreateInput): Promise<void> {
    await this.prisma.contact.create({ data })
  }
}
