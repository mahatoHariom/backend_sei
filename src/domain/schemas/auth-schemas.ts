import { Type, Static } from '@sinclair/typebox'
import { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'

// Schema for user creation
export const createUserSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
  fullName: Type.String(),
  phoneNumber: Type.String(),
  schoolCollegeName: Type.String(),
  subjectIds: Type.Array(Type.String()),
  confirmPassword: Type.String({ minLength: 6 })
})

// Schema for user response
export const createUserResponseSchema = Type.Object({
  id: Type.String(),
  email: Type.String(),
  fullName: Type.String(),
  phoneNumber: Type.Optional(Type.String()),
  schoolCollegeName: Type.Optional(Type.String()),
  isVerified: Type.Boolean(),
  role: Type.Enum(UserRole),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})

// Schema for login request
export const loginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 })
})

// Schema for login response
export const loginResponseSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String()
})

export const refreshTokenSchema = Type.Object({
  refreshToken: Type.String()
})

export const refreshTokenResponseSchema = Type.Object({
  // refreshToken: Type.String(),
  accessToken: Type.String()
})
// Types inferred from schemas
export type CreateUserInput = Static<typeof createUserSchema>
export type CreateUserResponse = Static<typeof createUserResponseSchema>
export type LoginUserInput = Static<typeof loginSchema>
export type LoginResponse = Static<typeof loginResponseSchema>
