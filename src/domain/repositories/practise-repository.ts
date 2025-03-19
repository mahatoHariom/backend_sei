import { injectable } from 'inversify'
// import { PrismaService } from '@/app/services/prisma-service'

import { Practice, PracticeQuestion } from '@prisma/client'
import { IPracticeRepository } from '../interfaces/practise.interface'
import { PrismaService } from '@/app/services/prisma-service'

@injectable()
export class PrismaPracticeRepository implements IPracticeRepository {
  private readonly prisma = PrismaService.getClient()

  async create(data: any): Promise<Practice> {
    console.log('Saving practice to DB:', data) // Debug
    return this.prisma.practice.create({
      data,
      include: { questions: true, subject: true }
    })
  }

  async findById(id: string): Promise<Practice | null> {
    return this.prisma.practice.findUnique({
      where: { id },
      include: {
        questions: true,
        subject: true
      }
    })
  }

  async findQuestionById(id: string): Promise<PracticeQuestion | null> {
    return this.prisma.practiceQuestion.findUnique({
      where: { id }
    })
  }

  async updateQuestion(practiceId: string, questionId: string, isCorrect: boolean): Promise<PracticeQuestion> {
    return this.prisma.practiceQuestion.update({
      where: { id: questionId },
      data: { isCorrect }
    })
  }

  async findUserPractices(userId: string, query: { skip?: number; take?: number }): Promise<Practice[]> {
    return this.prisma.practice.findMany({
      where: { userId },
      include: {
        subject: true,
        questions: {
          select: {
            id: true,
            isCorrect: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...query
    })
  }

  async countUserPractices(userId: string): Promise<number> {
    return this.prisma.practice.count({
      where: { userId }
    })
  }
}
