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
    const { userId, subjectId } = request.body

    const subject = await this.subjectService.getSubjectById(subjectId)
    if (!subject) {
      return reply.status(400).send({ message: 'Subject not found' })
    }

    const user = await this.authRepository.findById(userId)
    if (!user) {
      return reply.status(400).send({ message: 'User not found' })
    }

    const existingEnrollment = await this.subjectService.checkEnrollment(userId, subjectId)
    if (existingEnrollment) {
      return reply.status(400).send({ message: 'User already enrolled in this subject' })
    }

    await this.subjectService.enrollUserInSubject(userId, subjectId)

    return reply.status(200).send()
  }

  async changePassword(request: FastifyRequest<{ Body: ChangePasswordInput }>, reply: FastifyReply) {
    const { password, confirmPassword } = request.body

    if (password !== confirmPassword) {
      throw new ApiError(Messages.PASSWORD_NOT_MATCHED, StatusCode.Forbidden)
    }

    await this.userServices.changePassword(request.user?.id, password)

    return reply.status(200).send()
  }

  async getUserCourses(
    request: FastifyRequest<{
      Params: { userId: string }
      Querystring: { page?: number; limit?: number; search?: string }
    }>,
    reply: FastifyReply
  ) {
    const { userId } = request.params
    const { page = 1, limit = 10, search } = request.query

    const {
      subjects,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
      hasPreviousPage,
      hasNextPage
    } = await this.subjectService.getUserSubjects(userId, page, limit, search)

    return reply.status(200).send({
      courses: subjects,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
      hasPreviousPage,
      hasNextPage
    })
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
      }
    }>,
    reply: FastifyReply
  ) {
    const { fullName, email, phoneNumber, address, motherName, fatherName, parentContact, schoolCollegeName } =
      request.body

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
      schoolCollegeName
    })

    return reply.status(200).send(updatedUser)
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
    const { userId, subjectId } = request.body

    const subject = await this.subjectService.getSubjectById(subjectId)
    if (!subject) {
      return reply.status(400).send({ message: 'Subject not found' })
    }

    const user = await this.authRepository.findById(userId)
    if (!user) {
      return reply.status(400).send({ message: 'User not found' })
    }

    const existingEnrollment = await this.subjectService.checkEnrollment(userId, subjectId)
    if (!existingEnrollment) {
      return reply.status(400).send({ message: 'User is not enrolled in this subject' })
    }

    await this.subjectService.unenrollUserFromSubject(userId, subjectId)

    return reply.status(200).send()
  }
}
