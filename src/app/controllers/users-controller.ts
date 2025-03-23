import { TYPES } from '@/types'
import { inject, injectable } from 'inversify'
import { FastifyReply, FastifyRequest } from 'fastify'
import { ChangePasswordInput, CreateUserDetailInput, EnrollSubjectInput } from '@/domain/schemas/user-schema'
import ApiError from '@/infrastructure/config/ApiError'
import { PrismaAuthRepository } from '@/domain/repositories/auth-repository'
import { UserServices } from '../services/user-service'
import { Messages, StatusCode } from '@/domain/constants/messages'
import { generateJsonWebToken, generateRefreshToken } from '@/domain/utils/jwt'
import { SubjectService } from '../services/subject-service'
// import { UserDetail } from '@prisma/client'

@injectable()
export class UserControllers {
  constructor(
    @inject(TYPES.IAuthRepository) private authRepository: PrismaAuthRepository,
    @inject(TYPES.UserServices) private userServices: UserServices,
    @inject(TYPES.SubjectService) private subjectService: SubjectService
  ) {}

  async completeProfile(request: FastifyRequest<{ Body: CreateUserDetailInput }>, reply: FastifyReply) {
    const data = request.body
    const user = await this.authRepository.findById(request.user?.id)

    if (!user) {
      throw new ApiError(Messages.INVALID_CREDENTIAL, StatusCode.Unauthorized)
    }

    const updatedUser = await this.userServices.completeProfile(data, user.id)
    const refreshToken = await generateRefreshToken(updatedUser)
    const accessToken = await generateJsonWebToken(updatedUser)

    reply.setCookie(
      'user',
      JSON.stringify({
        updatedUser
      }),
      {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      }
    )

    return reply.status(200).send({
      accessToken,
      refreshToken,
      updatedUser
    })
  }

  async enrollInSubject(request: FastifyRequest<{ Body: EnrollSubjectInput }>, reply: FastifyReply) {
    try {
      const { userId, subjectId } = request.body
      console.log('DEPRECATED - enrollInSubject: Use edit-profile with subjectIds array instead')

      // Check if user exists using the auth repository
      const user = await this.authRepository.findById(userId)
      if (!user) {
        return reply.status(404).send({ message: 'User not found' })
      }

      // Get current user subjects
      const userSubjectsResult = await this.subjectService.getUserSubjects(userId, 1, 1000)
      const existingSubjectIds = userSubjectsResult.subjects.map((subject: { id: string }) => subject.id)

      // Add new subject if not already enrolled
      if (!existingSubjectIds.includes(subjectId)) {
        const newSubjectIds = [...existingSubjectIds, subjectId]

        // Update user with new subject IDs using the updateUserProfile method
        await this.userServices.updateUserProfile(userId, { subjectIds: newSubjectIds })
      }

      return reply.status(201).send()
    } catch (error) {
      console.error('Error in enrollInSubject:', error)
      return reply.status(500).send({ error: 'An error occurred while enrolling in subject' })
    }
  }

  async changePassword(request: FastifyRequest<{ Body: ChangePasswordInput }>, reply: FastifyReply) {
    const { password, confirmPassword } = request.body

    if (password !== confirmPassword) {
      throw new ApiError(Messages.PASSWORD_NOT_MATCHED, StatusCode.Forbidden)
    }

    await this.userServices.changePassword(request.user?.id, password)

    return reply.status(200).send()
  }

  async getUserSubjects(
    request: FastifyRequest<{
      Params: { userId: string }
      Querystring: { page?: number; limit?: number; search?: string }
    }>,
    reply: FastifyReply
  ) {
    const { userId } = request.params
    const { page = 1, limit = 10, search = '' } = request.query

    console.log(`Fetching subjects for user ${userId} with page=${page}, limit=${limit}, search=${search}`)

    const result = await this.subjectService.getUserSubjects(userId, page, limit, search)

    console.log(
      'User subjects result from service:',
      JSON.stringify(
        {
          subjectsCount: result.subjects.length,
          firstSubject: result.subjects[0],
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
          }
        },
        null,
        2
      )
    )

    const response = {
      subjects: result.subjects,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasPreviousPage: result.hasPreviousPage,
      hasNextPage: result.hasNextPage
    }

    console.log('Sending subjects response with key "subjects"')
    return reply.status(200).send(response)
  }

  async editProfile(
    request: FastifyRequest<{
      Body: {
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
    }>,
    reply: FastifyReply
  ) {
    try {
      const {
        fullName,
        email,
        phoneNumber,
        address,
        motherName,
        fatherName,
        parentContact,
        schoolCollegeName,
        subjectIds
      } = request.body

      console.log('Edit profile request body:', request.body)
      if (subjectIds) {
        console.log('Updating subject IDs:', subjectIds)
      }

      const userId = request.user?.id

      if (!userId) {
        throw new ApiError(Messages.INVALID_CREDENTIAL, StatusCode.Unauthorized)
      }

      // Update user with all fields
      const updatedUser = await this.userServices.updateUserProfile(userId, {
        fullName,
        email,
        phoneNumber,
        address,
        motherName,
        fatherName,
        parentContact,
        schoolCollegeName,
        subjectIds
      })

      return reply.status(200).send(updatedUser)
    } catch (error) {
      console.error('Error in editProfile:', error)
      throw error
    }
  }

  async updateProfilePic(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id

    if (!userId) {
      throw new ApiError(Messages.INVALID_CREDENTIAL, StatusCode.Unauthorized)
    }

    if (!request.file) {
      throw new ApiError('No file uploaded', StatusCode.BadRequest)
    }

    const file = request.file as any
    const profilePicUrl = `/uploads/${file.filename}`

    const updatedUser = await this.userServices.updateProfilePic(userId, profilePicUrl)

    return reply.status(200).send(updatedUser)
  }

  async getUserDetails(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.id
    if (!userId) {
      throw new ApiError(Messages.USER_NOT_FOUND, StatusCode.Unauthorized)
    }

    const user = await this.authRepository.findById(userId)
    if (!user) {
      throw new ApiError(Messages.USER_NOT_FOUND, StatusCode.Unauthorized)
    }

    return reply.status(200).send(user)
  }

  async unenrollFromSubject(request: FastifyRequest<{ Body: EnrollSubjectInput }>, reply: FastifyReply) {
    try {
      const { userId, subjectId } = request.body
      console.log('DEPRECATED - unenrollFromSubject: Use edit-profile with subjectIds array instead')

      // Check if user exists using the auth repository
      const user = await this.authRepository.findById(userId)
      if (!user) {
        return reply.status(404).send({ message: 'User not found' })
      }

      // Get current user subjects
      const userSubjectsResult = await this.subjectService.getUserSubjects(userId, 1, 1000)
      const existingSubjectIds = userSubjectsResult.subjects.map((subject: { id: string }) => subject.id)

      // Remove subject ID
      const newSubjectIds = existingSubjectIds.filter((id: string) => id !== subjectId)

      // Update user with new subject IDs using the updateUserProfile method
      await this.userServices.updateUserProfile(userId, { subjectIds: newSubjectIds })

      return reply.status(200).send()
    } catch (error) {
      console.error('Error in unenrollFromSubject:', error)
      return reply.status(500).send({ error: 'An error occurred while unenrolling from subject' })
    }
  }
}
