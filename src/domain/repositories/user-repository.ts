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

  async completeProfile(data: CreateUserDetailInput, userId: string): Promise<UserWithDetails> {
    let profilePicId: string | null = null

    if (data.profilePic) {
      const profilePic = await this.prisma.profilePic.create({
        data: {
          url: data.profilePic.url,
          publicId: data.profilePic.public_id
        }
      })
      profilePicId = profilePic.id
    }

    // Remove profilePic from data before spreading
    const { profilePic, ...userDetailData } = data

    await this.prisma.userDetail.upsert({
      where: { userId },
      create: {
        ...userDetailData,
        userId,
        profilePicId
      },
      update: {
        ...userDetailData,
        profilePicId
      }
    })

    return this.prisma.user.update({
      where: { id: userId },
      include: { userDetail: true },
      data: { isVerified: true }
    })
  }

  async updateUserProfile(userId: string, data: { fullName?: string; email?: string }): Promise<User> {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        email: data.email
      },
      include: { userDetail: true }
    })
  }

  async updateProfilePic(userId: string, profilePicData: { url: string; publicId: string }): Promise<UserDetail> {
    // Fetch the user's detail
    const userDetail = await this.prisma.userDetail.findUnique({
      where: { userId },
      include: { profilePic: true } // Include the profilePic relationship
    })

    if (!userDetail) {
      throw new Error('User detail not found')
    }

    if (userDetail.profilePic) {
      // Update the existing profile picture
      await this.prisma.profilePic.update({
        where: { id: userDetail.profilePic.id },
        data: {
          url: profilePicData.url,
          publicId: profilePicData.publicId
        }
      })
    } else {
      // Create a new profile picture
      const newProfilePic = await this.prisma.profilePic.create({
        data: {
          url: profilePicData.url,
          publicId: profilePicData.publicId
        }
      })

      // Update the UserDetail with the new profilePic ID
      await this.prisma.userDetail.update({
        where: { userId },
        data: {
          profilePicId: newProfilePic.id
        }
      })
    }

    // Return the updated UserDetail with the profile picture
    const updatedUserDetail = await this.prisma.userDetail.findUnique({
      where: { userId },
      include: { profilePic: true }
    })

    if (!updatedUserDetail) {
      throw new Error('User detail not found after update')
    }

    return updatedUserDetail
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
