import { Type } from '@sinclair/typebox'

// Base schema for creating a contact
export const contactSchema = Type.Object({
  name: Type.String(),
  email: Type.String({ format: 'email' }),
  phone: Type.String(), // Added the phone field
  message: Type.String()
})

// Response schema for a contact
export const contactResponseSchema = Type.Intersect([
  contactSchema,
  Type.Object({
    id: Type.String(), // ID added for response
    userId: Type.String(), // User ID associated with the contact
    createdAt: Type.String({ format: 'date-time' }) // Creation timestamp
  })
])

export const createContactSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  email: Type.String({ format: 'email' }),
  phone: Type.String({ minLength: 10, maxLength: 15 }),
  message: Type.String({ minLength: 1 })
})

export const createContactResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  email: Type.String(),
  phone: Type.String(),
  message: Type.String(),
  createdAt: Type.String({ format: 'date-time' })
})

// Types for input and response
export type CreateContactInput = typeof contactSchema
export type ContactResponse = typeof contactResponseSchema
