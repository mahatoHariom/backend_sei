import { Carousel, Contact, Prisma, Subject, User } from '@prisma/client'
import { injectable } from 'inversify'
import { PrismaService } from '@/app/services/prisma-service'
import { ISubjectRepository } from '../interfaces/subject.interface'
import { IAdminRepository } from '../interfaces/admin.interface'
import { EnrollmentWithSubjects } from '@/types/enrollment'

@injectable()
export class PrismaAdminRepository implements IAdminRepository {
  private readonly prisma = PrismaService.getClient()

  async createCarousel(data: { imageUrl: string }): Promise<Carousel> {
    return this.prisma.carousel.create({
      data
    })
  }

  async updateCarousel(data: { id: string; imageUrl: string }): Promise<Carousel> {
    const { id, imageUrl } = data
    return this.prisma.carousel.update({
      where: { id },
      data: { imageUrl }
    })
  }

  async deleteCarousel({ id }: { id: string }): Promise<void> {
    await this.prisma.carousel.delete({
      where: { id }
    })
  }

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
    const skip = (page - 1) * limit

    const whereClause = search
      ? {
          id: { contains: search, mode: 'insensitive' as Prisma.QueryMode }
        }
      : {}

    const [carousels, total] = await Promise.all([
      this.prisma.carousel.findMany({
        where: whereClause,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.carousel.count({
        where: whereClause
      })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      carousels,
      total,
      page,
      limit,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages
    }
  }

  async getEnrolledUsers(
    page: number = 1,
    limit: number = 10,
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
  }> {
    const skip = (page - 1) * limit

    // Fetch users with their subjects
    const usersWithSubjects = await this.prisma.user.findMany({
      where: {
        AND: [
          { subjects: { some: {} } }, // Users with at least one subject
          search
            ? {
                OR: [
                  { fullName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                  { subjects: { some: { subject: { name: { contains: search, mode: 'insensitive' } } } } }
                ]
              }
            : {}
        ]
      },
      select: {
        fullName: true,
        email: true,
        id: true,
        subjects: {
          select: {
            subject: {
              select: {
                name: true
              }
            },
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data
    const enrollments = usersWithSubjects.map((user) => ({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email
      },
      subject: user.subjects.map((sub) => ({
        name: sub.subject.name
      })),
      createdAt: user.subjects[0]?.createdAt || new Date()
    }))

    // Calculate pagination details
    const total = await this.prisma.user.count({
      where: {
        subjects: { some: {} }
      }
    })

    const totalPages = Math.ceil(total / limit)

    return {
      enrollments,
      total,
      page,
      limit,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages
    }
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
    const skip = (page - 1) * limit

    const whereClause: Prisma.UserWhereInput = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phoneNumber: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {}

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.user.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      users,
      total,
      page,
      limit,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages
    }
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
    const skip = (page - 1) * limit

    const whereClause: Prisma.ContactWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {}

    const [contacts, total] = await Promise.all([
      this.prisma.contact.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.contact.count({ where: whereClause })
    ])

    const totalPages = Math.ceil(total / limit)

    return {
      contacts,
      total,
      page,
      limit,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages
    }
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
    await this.prisma.contact.update({
      where: {
        id: contactId
      },
      data: {
        name,
        email,
        message,
        phone
      }
    })
  }

  async deleteContact({ contactId }: { contactId: string }): Promise<void> {
    await this.prisma.contact.delete({
      where: {
        id: contactId
      }
    })
  }

  async createSubject({ name, description }: { name: string; description?: string }): Promise<void> {
    await this.prisma.subject.create({
      data: {
        name,
        description
      }
    })
  }

  async deleteSubject({ subjectId }: { subjectId: string }): Promise<void> {
    await this.prisma.subject.delete({
      where: {
        id: subjectId
      }
    })
  }

  async deleteUser({ userId }: { userId: string }): Promise<void> {
    await this.prisma.user.delete({
      where: {
        id: userId
      }
    })
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
    await this.prisma.subject.update({
      where: {
        id: subjectId
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description })
      }
    })
  }

  async getAllUsersForExport(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  async importUsers(users: any[]): Promise<void> {
    // Create a transaction to handle bulk operations
    await this.prisma.$transaction(async (prisma) => {
      for (const userData of users) {
        // Check if user exists (by email)
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email }
        })

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              ...userData,
              role: existingUser.role, // Preserve role
              password: existingUser.password, // Preserve password
              updatedAt: new Date()
            }
          })
        } else {
          // Create new user with a temp password (to be reset)
          const tempPassword = await this.generateRandomPassword()

          await prisma.user.create({
            data: {
              ...userData,
              role: 'USER', // Default role
              password: tempPassword,
              isVerified: false
            }
          })
        }
      }
    })
  }

  // Helper method to generate random password for new imported users
  private async generateRandomPassword(): Promise<string> {
    // In a real implementation, this would involve hashing
    return Math.random().toString(36).slice(-10)
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
    // Get total counts
    const [totalUsers, totalSubjects, totalContacts] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subject.count(),
      this.prisma.contact.count()
    ])

    // Count enrollments (users with subjects)
    const totalEnrollments = await this.prisma.userSubject.count()

    // Get recent users
    const recentUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    })

    // Get user count by role
    const usersByRole = await this.prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    // Format user role data
    const formattedUsersByRole = usersByRole.map((item) => ({
      role: item.role,
      count: item._count.role
    }))

    // Get monthly signups for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentSignups = await this.prisma.user.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true
      }
    })

    // Aggregate signups by month
    const signupsByMonth = new Map<string, number>()

    // Initialize with last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`
      signupsByMonth.set(monthYear, 0)
    }

    // Count signups by month
    recentSignups.forEach((user) => {
      const date = new Date(user.createdAt)
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`

      if (signupsByMonth.has(monthYear)) {
        signupsByMonth.set(monthYear, signupsByMonth.get(monthYear)! + 1)
      }
    })

    // Convert to array and reverse to get chronological order
    const monthlySignups = Array.from(signupsByMonth.entries())
      .map(([month, count]) => ({ month, count }))
      .reverse()

    return {
      totalUsers,
      totalEnrollments,
      totalSubjects,
      totalContacts,
      recentUsers,
      usersByRole: formattedUsersByRole,
      monthlySignups
    }
  }
}
