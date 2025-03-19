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
import { UserDetail } from '@prisma/client'

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
        userDetails?: Partial<CreateUserDetailInput>
      }
    }>,
    reply: FastifyReply
  ) {
    const { fullName, email, userDetails } = request.body
    const userId = request.user?.id

    if (!userId) {
      throw new ApiError(Messages.INVALID_CREDENTIAL, StatusCode.Unauthorized)
    }

    // Update user base info
    const updatedUser = await this.userServices.updateUserProfile(userId, { fullName, email })

    // Update user details if provided
    if (userDetails) {
      await this.userServices.updateUserDetails(userId, userDetails)
    }

    const user = await this.authRepository.findById(userId)
    console.log(user, 'user')

    return reply.status(200).send(user)
  }

  async updateProfilePic(
    request: FastifyRequest<{
      Body: {
        url: string
        public_id: string
      }
    }>,
    reply: FastifyReply
  ) {
    const userId = request.user?.id
    const { url, public_id } = request.body

    if (!userId) {
      throw new ApiError(Messages.INVALID_CREDENTIAL, StatusCode.Unauthorized)
    }

    const updatedUserDetail = await this.userServices.updateProfilePic(userId, {
      url,
      publicId: public_id
    })

    return reply.status(200).send(updatedUserDetail)
  }

  async getUserDetails(request: FastifyRequest, reply: FastifyReply) {
    const isUser = await this.authRepository.findById(request.user.id)
    if (!isUser) {
      throw new ApiError(Messages.USER_NOT_FOUND, StatusCode.Unauthorized)
    }
    const details = await this.authRepository.getUserDetails(request.user.id)

    return reply.status(200).send(details)
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
