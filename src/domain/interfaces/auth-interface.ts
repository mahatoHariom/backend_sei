import { Prisma, User } from '@prisma/client'

export interface IAuthRepository {
  create(data: Prisma.UserCreateInput): Promise<User>
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  createUserSubjectEnrollment(userId: string, subjectId: string): Promise<void>
}
