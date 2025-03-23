import { User } from '@prisma/client'
import { CreateUserDetailInput } from '../schemas/user-schema'

export interface IUserRepository {
  completeProfile(data: CreateUserDetailInput, userId: string): Promise<User>
  changePassword(userId: string, newPassword: string): Promise<User>
  updateProfilePic(userId: string, profilePicUrl: string): Promise<User>
  updateUserProfile(
    userId: string,
    data: {
      fullName?: string
      email?: string
      phoneNumber?: string
      address?: string
      motherName?: string
      fatherName?: string
      parentContact?: string
      schoolCollegeName?: string
      subjectIds?: string[]
    }
  ): Promise<User>
}
