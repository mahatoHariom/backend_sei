import { Prisma, Subject } from '@prisma/client'
import { injectable } from 'inversify'
import { PrismaService } from '@/app/services/prisma-service'
import { ISubjectRepository, SubjectCreateInput, SubjectUpdateInput } from '../interfaces/subject.interface'

@injectable()
export class PrismaSubjectRepository implements ISubjectRepository {
  private readonly prisma = PrismaService.getClient()
  async getAllSubjects(
    page?: number,
    limit?: number,
    search?: string
  ): Promise<{
    subjects: Subject[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }> {
    const currentPage = page || 1
    const currentLimit = limit || 10
    const skip = (currentPage - 1) * currentLimit

    const whereClause = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as Prisma.QueryMode
          }
        }
      : {}

    const [subjects, total] = await Promise.all([
      this.prisma.subject.findMany({
        where: whereClause,
        skip,
        take: Number(currentLimit),
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          description: true,
          name: true,
          users: {
            select: { userId: true }
          }
        }
      }),
      this.prisma.subject.count({
        where: whereClause
      })
    ])

    const totalPages = Math.ceil(total / currentLimit)

    return {
      subjects,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages
    }
  }

  async getUserSubjects(userId: string, page?: number, limit?: number, search?: string) {
    try {
      const currentPage = page || 1
      const currentLimit = limit || 10

      const skip = (currentPage - 1) * currentLimit

      const whereClause: Prisma.SubjectWhereInput = {
        users: {
          some: { userId }
        },
        ...(search
          ? {
              name: {
                contains: search,
                mode: 'insensitive' as Prisma.QueryMode
              }
            }
          : {})
      }

      const [subjects, total] = await Promise.all([
        this.prisma.subject.findMany({
          where: whereClause,
          skip,
          take: Number(currentLimit),
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        this.prisma.subject.count({
          where: whereClause
        })
      ])

      const totalPages = Math.ceil(total / currentLimit)

      return {
        subjects,
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages,
        hasPreviousPage: currentPage > 1,
        hasNextPage: currentPage < totalPages
      }
    } catch (error) {
      console.error('Error in getUserSubjects:', error)
      // Return empty results to prevent 500 error
      return {
        subjects: [],
        total: 0,
        page: page || 1,
        limit: limit || 10,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false
      }
    }
  }

  async createUserSubjectEnrollment(userId: string, subjectId: string): Promise<void> {
    await this.prisma.userSubject.create({
      data: { userId, subjectId }
    })
  }

  async findUserSubjectEnrollment(userId: string, subjectId: string) {
    return this.prisma.userSubject.findFirst({
      where: { userId, subjectId }
    })
  }

  async deleteUserSubjectEnrollment(userId: string, subjectId: string): Promise<void> {
    // First find the enrollment
    const enrollment = await this.prisma.userSubject.findFirst({
      where: {
        userId: userId,
        subjectId: subjectId
      }
    })

    if (!enrollment) {
      throw new Error('Enrollment not found')
    }

    await this.prisma.userSubject.delete({
      where: {
        id: enrollment.id
      }
    })
  }

  async getSubjectById(subjectId: string) {
    return this.prisma.subject.findUnique({
      where: { id: subjectId }
    })
  }

  async createSubject(data: SubjectCreateInput): Promise<Subject> {
    return this.prisma.subject.create({
      data: {
        name: data.name,
        description: data.description
      }
    })
  }

  async updateSubject(id: string, data: SubjectUpdateInput): Promise<Subject> {
    return this.prisma.subject.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description })
      }
    })
  }
}
