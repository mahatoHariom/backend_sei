// user-schemas.ts
import { Type } from '@sinclair/typebox'

export const profilePicSchema = Type.Object({
  id: Type.String(),
  publicId: Type.String(),
  url: Type.String({ format: 'uri' }),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})

export const updateProfilePicSchema = Type.Object({
  url: Type.String({ format: 'uri' }),
  public_id: Type.String()
})

export const userDetailSchema = Type.Object({
  phoneNumber: Type.Optional(Type.String()),
  address: Type.Optional(Type.String()),
  motherName: Type.Optional(Type.String()),
  fatherName: Type.Optional(Type.String()),
  parentContact: Type.Optional(Type.String()),
  schoolCollegeName: Type.Optional(Type.String()),
  profilePicId: Type.Optional(Type.String()),
  profilePic: Type.Optional(profilePicSchema)
})

export const changePasswordInputSchema = Type.Object({
  password: Type.String(),
  confirmPassword: Type.String()
})

export const getEnrolledCourseSchema = Type.Object({
  userId: Type.String()
})

export const enrollSubjectBody = Type.Object({
  subjectId: Type.String(),
  userId: Type.String()
})
export const userDetailResponseSchema = Type.Intersect([
  userDetailSchema,
  Type.Object({
    id: Type.String(),
    userId: Type.String()
  })
])
export const userBaseSchema = Type.Object({
  fullName: Type.String(),
  email: Type.String(),
  isVerified: Type.Boolean(),
  role: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})

export const userResponseSchema = Type.Intersect([
  userBaseSchema,
  Type.Object({
    id: Type.String(),
    userDetail: Type.Optional(userDetailResponseSchema)
  })
])

// Export the schemas as types
export type GetEnrolledCourseInput = typeof getEnrolledCourseSchema
export type ChangePasswordInput = typeof changePasswordInputSchema
export type CreateUserDetailInput = typeof userDetailSchema
export type EnrollSubjectInput = typeof enrollSubjectBody
export type UserDetailResponse = typeof userDetailResponseSchema
