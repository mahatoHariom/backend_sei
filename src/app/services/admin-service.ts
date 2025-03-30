import { inject, injectable } from 'inversify'
import { TYPES } from '@/types'
import { ISubjectRepository } from '@/domain/interfaces/subject.interface'
import { Carousel, Contact, Subject, User } from '@prisma/client'
import { IAdminRepository } from '@/domain/interfaces/admin.interface'

@injectable()
export class AdminService {
  constructor(@inject(TYPES.IAdminRepository) private adminRepository: IAdminRepository) {}

  // Create a carousel
  async createCarousel(data: { imageUrl: string }): Promise<Carousel> {
    return this.adminRepository.createCarousel(data)
  }

  // Update a carousel
  async updateCarousel(data: { id: string; imageUrl: string }): Promise<Carousel> {
    return this.adminRepository.updateCarousel(data)
  }

  // Delete a carousel
  async deleteCarousel(id: string): Promise<void> {
    return this.adminRepository.deleteCarousel({ id })
  }

  // Get all carousels
  async getCarousels(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    carousels: Carousel[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }> {
    return this.adminRepository.getCarousels(page, limit, search)
  }

  async getEnrolledUsers(page: number = 1, limit: number = 10, search?: string) {
    return this.adminRepository.getEnrolledUsers(page, limit, search)
  }
  async getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    users: User[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }> {
    return this.adminRepository.getAllUsers(page, limit, search)
  }
  async getAllContact(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    contacts: Contact[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }> {
    return this.adminRepository.getAllContact(page, limit, search)
  }

  async editContact({
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
  }): Promise<void> {
    return this.adminRepository.editContact({
      contactId,
      name,
      email,
      message,
      phone
    })
  }

  async deleteContact({ contactId }: { contactId: string }): Promise<void> {
    return this.adminRepository.deleteContact({ contactId })
  }

  async createSubject({ name, description }: { name: string; description?: string }): Promise<void> {
    return this.adminRepository.createSubject({
      name,
      description
    })
  }

  async deleteUser({ userId }: { userId: string }): Promise<void> {
    return this.adminRepository.deleteUser({
      userId
    })
  }
  async deleteSubject({ subjectId }: { subjectId: string }): Promise<void> {
    return this.adminRepository.deleteSubject({ subjectId })
  }

  async editSubject({
    subjectId,
    name,
    description
  }: {
    subjectId: string
    name?: string
    description?: string
  }): Promise<void> {
    return this.adminRepository.editSubject({
      subjectId,
      name,
      description
    })
  }

  async exportUsersAsCSV(): Promise<string> {
    const users = await this.adminRepository.getAllUsersForExport()

    // Create CSV header
    const headers = [
      'id',
      'fullName',
      'email',
      'role',
      'phoneNumber',
      'address',
      'motherName',
      'fatherName',
      'parentContact',
      'schoolCollegeName',
      'subjects',
      'createdAt',
      'updatedAt'
    ].join(',')

    // Transform user data to CSV rows
    const rows = users.map((user) => {
      // Get subjects from enrollments if available
      const subjects = user.enrollments
        ? user.enrollments
            .map((enrollment) => enrollment.subject?.name || '')
            .filter(Boolean)
            .join('; ')
        : ''

      const values = [
        user.id,
        user.fullName || '',
        user.email,
        user.role,
        user.phoneNumber || '',
        user.address || '',
        user.motherName || '',
        user.fatherName || '',
        user.parentContact || '',
        user.schoolCollegeName || '',
        subjects,
        user.createdAt.toISOString(),
        user.updatedAt.toISOString()
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`) // Escape quotes

      return values.join(',')
    })

    // Combine header and rows
    return [headers, ...rows].join('\n')
  }

  async importUsersFromCSV(csvBuffer: Buffer): Promise<void> {
    const csvString = csvBuffer.toString('utf-8')
    const lines = csvString.split('\n')

    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row')
    }

    // Parse header to identify columns
    const headers = lines[0].split(',').map((header) => header.trim().replace(/^"(.*)"$/, '$1'))

    // Define expected headers
    const expectedHeaders = [
      'fullName',
      'email',
      'phoneNumber',
      'address',
      'motherName',
      'fatherName',
      'parentContact',
      'schoolCollegeName'
    ]

    // Verify essential headers exist (email at minimum is required)
    if (!headers.includes('email')) {
      throw new Error('CSV file must contain an email column')
    }

    // Parse data rows
    const users = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue // Skip empty lines

      const values = this.parseCSVLine(lines[i])
      if (values.length !== headers.length) {
        console.warn(`Skipping row ${i + 1}: Column count mismatch`)
        continue
      }

      const user: Record<string, any> = {
        isVerified: true
      }

      // Map values to headers
      headers.forEach((header, index) => {
        // Only include fields that are expected or add any custom handling
        if (expectedHeaders.includes(header)) {
          // Trim and clean the value
          const value = values[index].replace(/^"(.*)"$/, '$1').trim()
          user[header] = value || undefined
        }
      })

      users.push(user)
    }

    await this.adminRepository.importUsers(users)
  }

  // Helper method to correctly parse CSV lines with quoted fields
  private parseCSVLine(line: string): string[] {
    const result = []
    let inQuotes = false
    let currentValue = ''

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          // Handle escaped quotes (double quotes)
          currentValue += '"'
          i++ // Skip the next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(currentValue)
        currentValue = ''
      } else {
        currentValue += char
      }
    }

    // Don't forget the last field
    result.push(currentValue)

    return result
  }

  async getDashboardStats(): Promise<{
    totalUsers: number
    totalEnrollments: number
    totalSubjects: number
    totalContacts: number
    recentUsers: User[]
    usersByRole: Array<{ role: string; count: number }>
    monthlySignups: Array<{ month: string; count: number }>
  }> {
    return this.adminRepository.getDashboardStats()
  }
}
