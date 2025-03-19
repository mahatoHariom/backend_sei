import { PrismaContactRepository } from '@/domain/repositories/prtisma-contact-repository'
import { CreateContactInput } from '@/domain/schemas/contact-schema'
import { TYPES } from '@/types'
import { inject, injectable } from 'inversify'

@injectable()
export class ContactService {
  constructor(@inject(TYPES.IContactRepository) private contactRepository: PrismaContactRepository) {}
  async createContact(data: CreateContactInput, userId: string): Promise<void> {
    const { name, email, phone, message } = data
    return this.contactRepository.create({
      name,
      email,
      phone,
      message,
      user: {
        connect: {
          id: userId
        }
      }
    })
  }
}
