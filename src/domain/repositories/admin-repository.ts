import { Carousel, Contact, Prisma, Subject, User } from '@prisma/client'
import { injectable } from 'inversify'
import { PrismaService } from '@/app/services/prisma-service'
import { ISubjectRepository } from '../interfaces/subject.interface'
import { IAdminRepository } from '../interfaces/admin.interface'
import { EnrollmentWithSubjects } from '@/types/enrollment'

@injectable()
export class PrismaAdminRepository implements IAdminRepository {
  private readonly prisma = PrismaService.getClient()

  async createCarousel({ publicId, url }: { publicId: string; url: string }): Promise<void> {
    await this.prisma.carousel.create({
      data: { publicId, url }
    })
  }

  async updateCarousel({ id, publicId, url }: { id: string; publicId: string; url: string }): Promise<void> {
    await this.prisma.carousel.update({
      where: { id },
      data: { publicId, url }
    })
  }

  async deleteCarousel({ id }: { id: string }): Promise<void> {
    await this.prisma.carousel.delete({
      where: { id }
    })
  }

  async getCarousels(): Promise<Carousel[]> {
    return this.prisma.carousel.findMany({
      orderBy: { createdAt: 'desc' }
    })
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
            { email: { contains: search, mode: 'insensitive' } }
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

  async createSubject({
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
  }): Promise<void> {
    await this.prisma.subject.create({
      data: {
        name,
        description,
        difficulty,
        duration,
        imageUrl,
        courseType,
        tags,
        badge,
        students
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
  }): Promise<void> {
    await this.prisma.subject.update({
      where: {
        id: subjectId
      },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(difficulty !== undefined && { difficulty }),
        ...(duration !== undefined && { duration }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(courseType !== undefined && { courseType }),
        ...(tags !== undefined && { tags }),
        ...(badge !== undefined && { badge }),
        ...(students !== undefined && { students })
      }
    })
  }
}
