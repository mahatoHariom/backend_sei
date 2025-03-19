import { Type } from '@sinclair/typebox'

export const userSchema = Type.Object({
  id: Type.String(),
  fullName: Type.String(),
  email: Type.String({ format: 'email' }),
  isVerified: Type.Boolean(),
  role: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
})

export const enrollmentSchema = Type.Object({
  user: Type.Object({
    id: Type.String(),
    fullName: Type.String(),
    email: Type.String({ format: 'email' })
  }),
  subject: Type.Array(
    Type.Object({
      name: Type.String()
    })
  ),
  createdAt: Type.String({ format: 'date-time' })
})

export const getEnrolledUsersResponseSchema = Type.Object({
  enrollments: Type.Array(enrollmentSchema),
  total: Type.Number(),
  page: Type.Number(),
  limit: Type.Number(),
  totalPages: Type.Number(),
  hasPreviousPage: Type.Boolean(),
  hasNextPage: Type.Boolean()
})

export const getAllUsersResponseSchema = Type.Object({
  users: Type.Array(userSchema),
  total: Type.Number(),
  page: Type.Number(),
  limit: Type.Number(),
  totalPages: Type.Number(),
  hasPreviousPage: Type.Boolean(),
  hasNextPage: Type.Boolean()
})
// export const getAllUsersResponseSchema = Type.Array(userSchema)

// Contact Schema
export const contactSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String({ format: 'email' }),
  phone: Type.String(),
  message: Type.String(),
  userId: Type.String(),
  createdAt: Type.String({ format: 'date-time' })
})

// export const getAllContactsResponseSchema = Type.Array(contactSchema)

export const getAllContactsResponseSchema = Type.Object({
  contacts: Type.Array(contactSchema),
  total: Type.Number(),
  page: Type.Number(),
  limit: Type.Number(),
  totalPages: Type.Number(),
  hasPreviousPage: Type.Boolean(),
  hasNextPage: Type.Boolean()
})

export const createCarouselSchema = Type.Object({
  publicId: Type.String(),
  url: Type.String()
})

export const updateCarouselSchema = Type.Object({
  id: Type.String(),
  publicId: Type.String(),
  url: Type.String()
})

export const deleteCarouselParamsSchema = Type.Object({
  id: Type.String()
})

export const editContactSchema = Type.Object({
  name: Type.String(),
  email: Type.String({ format: 'email' }),
  phone: Type.String(),
  message: Type.String()
})

export const deleteContactParamsSchema = Type.Object({
  contactId: Type.String()
})

// Subject Schema
export const createSubjectSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.String()),
  difficulty: Type.Optional(Type.String()),
  duration: Type.Optional(Type.String()),
  imageUrl: Type.Optional(Type.String()),
  courseType: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
  badge: Type.Optional(Type.String()),
  students: Type.Optional(Type.Number())
})

export const editSubjectSchema = Type.Object({
  name: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  difficulty: Type.Optional(Type.String()),
  duration: Type.Optional(Type.String()),
  imageUrl: Type.Optional(Type.String()),
  courseType: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
  badge: Type.Optional(Type.String()),
  students: Type.Optional(Type.Number())
})

export const deleteSubjectParamsSchema = Type.Object({
  subjectId: Type.String()
})

// Delete User Params Schema
export const deleteUserParamsSchema = Type.Object({
  userId: Type.String()
})
