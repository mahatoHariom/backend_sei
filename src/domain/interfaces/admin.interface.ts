import { Carousel, Contact, Subject, User } from '@prisma/client'

export interface IAdminRepository {
  createCarousel(data: { imageUrl: string }): Promise<Carousel>

  updateCarousel(data: { id: string; imageUrl: string }): Promise<Carousel>

  deleteCarousel({ id }: { id: string }): Promise<void>
  getCarousels(): Promise<Carousel[]>
  getEnrolledUsers(
    page: number,
    limit: number,
    search?: string
  ): Promise<{
    enrollments: Array<{
      user: {
        id: string
        fullName: string
        email: string
      }
      subject: Array<{
        name: string
      }>
      createdAt: Date
    }>
    total: number
    page: number
    limit: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }>

  getAllUsers(
    page: number,
    limit: number,
    search?: string
  ): Promise<{
    users: User[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }>
  getAllContact(
    page: number,
    limit: number,
    search?: string
  ): Promise<{
    contacts: Contact[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }>

  createSubject({
    name,
    description,
    difficulty,
    duration,
    imageUrl,
    courseType,
    tags,
    badge,
    students
  }: {
    name: string
    description?: string
    difficulty?: string
    duration?: string
    imageUrl?: string
    courseType?: string
    tags?: string[]
    badge?: string
    students?: number
  }): Promise<void>

  deleteSubject({ subjectId }: { subjectId: string }): Promise<void>

  deleteUser({ userId }: { userId: string }): Promise<void>

  editContact({
    contactId,
    name,
    email,
    message,
    phone
  }: {
    contactId: string
    name: string
    email: string
    message: string
    phone: string
  }): Promise<void>

  deleteContact({ contactId }: { contactId: string }): Promise<void>

  editSubject({
    subjectId,
    name,
    description,
    difficulty,
    duration,
    imageUrl,
    courseType,
    tags,
    badge,
    students
  }: {
    subjectId: string
    name?: string
    description?: string
    difficulty?: string
    duration?: string
    imageUrl?: string
    courseType?: string
    tags?: string[]
    badge?: string
    students?: number
  }): Promise<void>
}
