import { Static, Type } from '@sinclair/typebox'

// Schema for creating an enrollment
export const enrollmentCreateSchema = Type.Object({
  userId: Type.String({ minLength: 1 }), // ID of the user enrolling
  subjectId: Type.String({ minLength: 1 }) // ID of the subject to enroll
})

// Response schema for an enrollment
export const enrollmentResponseSchema = Type.Object({
  message: Type.String(), // Message indicating the status of the enrollment
  enrollment: Type.Intersect([
    enrollmentCreateSchema,
    Type.Object({
      id: Type.String(), // Unique ID for the enrollment
      enrollmentDate: Type.String({ format: 'date-time' }) // Timestamp of when the enrollment was created
    })
  ])
})

// TypeScript types generated from the schemas
export type EnrollmentCreateInput = Static<typeof enrollmentCreateSchema>
export type EnrollmentResponse = Static<typeof enrollmentResponseSchema>
