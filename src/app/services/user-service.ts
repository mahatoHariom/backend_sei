import { injectable, inject } from 'inversify'

import { TYPES } from '@/types'

import { CreateUserDetailInput } from '@/domain/schemas/user-schema'
import { PrismaUserRepository } from '@/domain/repositories/user-repository'
import { User } from '@prisma/client'

@injectable()
export class UserServices {
  constructor(@inject(TYPES.IUserRepository) private userRepository: PrismaUserRepository) {}

  async completeProfile(data: CreateUserDetailInput, userId: string): Promise<User> {
    return await this.userRepository.completeProfile(data, userId)
  }

  async changePassword(userId: string, newPassword: string): Promise<User> {
    return this.userRepository.changePassword(userId, newPassword)
  }

  async updateUserProfile(
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
    }
  ): Promise<User> {
    return await this.userRepository.updateUserProfile(userId, data)
  }

  async updateProfilePic(userId: string, profilePicUrl: string): Promise<User> {
    return await this.userRepository.updateProfilePic(userId, profilePicUrl)
  }
}
