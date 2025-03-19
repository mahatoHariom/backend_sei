import { injectable, inject } from 'inversify'

import { TYPES } from '@/types'

import { CreateUserDetailInput } from '@/domain/schemas/user-schema'
import { PrismaUserRepository } from '@/domain/repositories/user-repository'
import { User, UserDetail } from '@prisma/client'

@injectable()
export class UserServices {
  constructor(@inject(TYPES.IUserRepository) private userRepository: PrismaUserRepository) {}

  async completeProfile(data: CreateUserDetailInput, userId: string): Promise<User> {
    return await this.userRepository.completeProfile(data, userId)
  }
  async changePassword(userId: string, newPassword: string): Promise<User> {
    return this.userRepository.changePassword(userId, newPassword)
  }

  async updateUserProfile(userId: string, data: { fullName?: string; email?: string }): Promise<User> {
    return await this.userRepository.updateUserProfile(userId, data)
  }

  async updateProfilePic(userId: string, profilePicData: { url: string; publicId: string }): Promise<UserDetail> {
    return await this.userRepository.updateProfilePic(userId, profilePicData)
  }

  async updateUserDetails(userId: string, data: Partial<CreateUserDetailInput>): Promise<UserDetail> {
    return await this.userRepository.updateUserDetails(userId, data)
  }
}
