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
      subjectIds?: string[]
    }
  ): Promise<User> {
    // Extract subjectIds for separate processing
    const { subjectIds, ...userData } = data

    // Start a transaction to handle user update and subject enrollments together
    return await this.prisma.$transaction(async (tx) => {
      // First update the user profile data
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: userData
      })

      // If subjectIds are provided, update user's subject enrollments
      if (subjectIds) {
        // First, get all current subject enrollments
        const currentEnrollments = await tx.userSubject.findMany({
          where: { userId },
          select: { subjectId: true }
        })

        const currentSubjectIds = currentEnrollments.map((e) => e.subjectId)

        // Find subjects to remove (in current but not in new list)
        const subjectsToRemove = currentSubjectIds.filter((id) => !subjectIds.includes(id))

        // Find subjects to add (in new list but not in current)
        const subjectsToAdd = subjectIds.filter((id) => !currentSubjectIds.includes(id))

        // Remove enrollments no longer in the list
        if (subjectsToRemove.length > 0) {
          await tx.userSubject.deleteMany({
            where: {
              userId,
              subjectId: { in: subjectsToRemove }
            }
          })
        }

        // Add new enrollments
        if (subjectsToAdd.length > 0) {
          await Promise.all(
            subjectsToAdd.map((subjectId) =>
              tx.userSubject.create({
                data: { userId, subjectId }
              })
            )
          )
        }
      }

      return updatedUser
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
