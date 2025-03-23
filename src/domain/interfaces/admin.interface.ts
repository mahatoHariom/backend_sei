import { Carousel, Contact, Subject, User } from '@prisma/client'

export interface IAdminRepository {
  createCarousel(data: { imageUrl: string }): Promise<Carousel>

  updateCarousel(data: { id: string; imageUrl: string }): Promise<Carousel>

  deleteCarousel({ id }: { id: string }): Promise<void>
  getCarousels(
    page?: number,
    limit?: number,
    search?: string
  ): Promise<{
    carousels: Carousel[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }>
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

  createSubject({ name, description }: { name: string; description?: string }): Promise<void>

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
    description
  }: {
    subjectId: string
    name?: string
    description?: string
  }): Promise<void>

  // Get all users for CSV export (no pagination)
  getAllUsersForExport(): Promise<User[]>

  // Import users from CSV
  importUsers(users: any[]): Promise<void>

  // Get dashboard statistics
  getDashboardStats(): Promise<{
    totalUsers: number
    totalEnrollments: number
    totalSubjects: number
    totalContacts: number
    recentUsers: User[]
    usersByRole: Array<{ role: string; count: number }>
    monthlySignups: Array<{ month: string; count: number }>
  }>
}
