import { injectable, inject } from 'inversify'
import { compare, hash } from 'bcryptjs'
import ApiError from '@/infrastructure/config/ApiError'
import { TYPES } from '@/types'
import { PrismaAuthRepository } from '@/domain/repositories/auth-repository'
import { User } from '@prisma/client'
import { Messages, StatusCode } from '@/domain/constants/messages'
import { validateAccessToken } from '@/domain/utils/jwt'

interface AuthenticateRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  fullName: string
  phoneNumber: string
  schoolCollegeName: string
  subjectIds: string[]
  password: string
  confirmPassword: string
}

@injectable()
export class AuthService {
  constructor(@inject(TYPES.IAuthRepository) private authRepository: PrismaAuthRepository) {}

  async authenticate({ email, password }: AuthenticateRequest): Promise<User | null> {
    const user = await this.authRepository.findByEmail(email)
    if (!user) {
      throw new ApiError(Messages.USER_NOT_FOUND, StatusCode.Unauthorized)
    }

    const doesPasswordMatch = await compare(password, user?.password as string)

    if (!doesPasswordMatch) {
      throw new ApiError(Messages.PASSWORD_NOT_MATCHED, StatusCode.Forbidden)
    }

    return user
  }

  async register({
    email,
    fullName,
    phoneNumber,
    schoolCollegeName,
    subjectIds,
    password,
    confirmPassword
  }: RegisterRequest) {
    if (password !== confirmPassword) {
      throw new ApiError(Messages.PASSWORD_NOT_MATCHED, StatusCode.Forbidden)
    }
    const hashedPassword = await hash(password, 12)
    const user = await this.authRepository.create({
      email,
      fullName,
      password: hashedPassword,
      phoneNumber,
      schoolCollegeName
    })

    // Enroll user in selected subjects
    if (subjectIds && subjectIds.length > 0) {
      await Promise.all(
        subjectIds.map(async (subjectId) => {
          try {
            await this.authRepository.createUserSubjectEnrollment(user.id, subjectId)
          } catch (error) {
            console.error(`Failed to enroll user in subject ${subjectId}:`, error)
            // We'll continue with the registration even if subject enrollment fails
          }
        })
      )
    }

    return user
  }
  async getProfileData(userId: string): Promise<User | null> {
    const user = await this.authRepository.findById(userId)
    return user
  }
  async verifyRefreshToken(token: string) {
    console.log(token, 'tdssd')
    const value = await validateAccessToken(token)
    console.log(value, 'vvaaa')
    return value
  }
}
