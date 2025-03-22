import { injectable } from 'inversify'
import { PrismaService } from '@/app/services/prisma-service'
import { IUserRepository } from '../interfaces/users-interface'
import { CreateUserDetailInput } from '../schemas/user-schema'
import { Prisma, User, UserDetail } from '@prisma/client'
import { hash } from 'bcryptjs'
import { UserWithDetails } from '../interfaces/auth-interface'

@injectable()
export class PrismaUserRepository implements IUserRepository {
  private readonly prisma = PrismaService.getClient()

  async changePassword(userId: string, newPassword: string): Promise<User> {
    const hashedPassword = await hash(newPassword, 12)
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })
  }

  async completeProfile(data: CreateUserDetailInput, userId: string): Promise<User> {
    const { profilePic, ...profileData } = data
    let profilePicUrl = undefined

    // If a profile pic is provided, save the URL
    if (profilePic) {
      profilePicUrl = profilePic.url
    }

    // Update user with all profile data
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...profileData,
        profilePicUrl,
        isVerified: true
      }
    })
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
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        motherName: data.motherName,
        fatherName: data.fatherName,
        parentContact: data.parentContact,
        schoolCollegeName: data.schoolCollegeName
      }
    })
  }

  async updateProfilePic(userId: string, profilePicUrl: string): Promise<User> {
    // Directly update the User model with the profile pic URL
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        profilePicUrl
      }
    })
  }

  async updateUserDetails(userId: string, data: Partial<CreateUserDetailInput>): Promise<UserDetail> {
    const updateData: Prisma.UserDetailUpdateInput = {
      address: data.address,
      fatherName: data.fatherName,
      motherName: data.motherName,
      phoneNumber: data.phoneNumber,
      parentContact: data.parentContact,
      schoolCollegeName: data.schoolCollegeName
    }

    return await this.prisma.userDetail.update({
      where: { userId },
      data: updateData
    })
  }
}
