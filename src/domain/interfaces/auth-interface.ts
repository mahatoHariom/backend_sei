import { Prisma, User, UserDetail } from '@prisma/client'

export interface UserWithDetails extends User {
  userDetail?: UserDetail | null
}
export interface IAuthRepository {
  create(data: Prisma.UserCreateInput): Promise<User>
  findByEmail(email: string): Promise<UserWithDetails | null>
  findById(id: string): Promise<User | null>
  getUserDetails(id: string): Promise<UserDetail | null>
}
