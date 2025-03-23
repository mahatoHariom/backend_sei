import { Type } from '@sinclair/typebox'
import { userBaseSchema } from './user-schema'

// Base schema for a subject
export const subjectSchema = Type.Object({
  id: Type.String(),
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.Optional(Type.Union([Type.String({ format: 'date-time' }), Type.Null()])),
  users: Type.Array(
    Type.Object({
      userId: Type.String()
    })
  )
})

// Input schema for creating or updating a subject
export const subjectInputSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  description: Type.Optional(Type.Union([Type.String(), Type.Null()]))
})

// Response schema for a single subject
export const subjectResponseSchema = subjectSchema

// Response schema for multiple subjects
export const subjectsResponseSchema = Type.Array(subjectSchema)

export type SubjectResponse = typeof subjectResponseSchema
export type SubjectInput = typeof subjectInputSchema
