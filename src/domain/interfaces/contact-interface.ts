import { Prisma } from '@prisma/client'

export interface IContactRepository {
  create(data: Prisma.ContactCreateInput): Promise<void>
}
