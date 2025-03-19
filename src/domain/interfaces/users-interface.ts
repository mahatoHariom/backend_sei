import { User, UserDetail } from '@prisma/client'
import { CreateUserDetailInput } from '../schemas/user-schema'
import { UserWithDetails } from './auth-interface'

export interface IUserRepository {
  completeProfile(data: CreateUserDetailInput, userId: string): Promise<UserWithDetails>
  changePassword(userId: string, newPassword: string): Promise<User>
  updateProfilePic(userId: string, profilePicData: { url: string; publicId: string }): Promise<UserDetail>
}
