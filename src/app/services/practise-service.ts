import { injectable, inject } from 'inversify'
import { TYPES } from '@/types'
// import { IPracticeRepository } from '@/domain/interfaces/practice.interface'
import { AIService } from './ai-service'
import { Difficulty, Practice, PracticeQuestion } from '@prisma/client'
import { IPracticeRepository } from '@/domain/interfaces/practise.interface'
import { SubjectService } from './subject-service'

@injectable()
export class PracticeService {
  constructor(
    @inject(TYPES.IPracticeRepository) private practiceRepo: IPracticeRepository,
    @inject(TYPES.AIService) private aiService: AIService,
    @inject(TYPES.SubjectService) private subjectService: SubjectService
  ) {}

  async createPractice(userId: string, subjectId: string, difficulty: Difficulty): Promise<Practice> {
    const subject = await this.subjectService.getSubjectById(subjectId)

    console.log('Subject:fund', subject)

    const questions = await this.aiService.generateMCQs({
      subject: subject?.name || 'Unknown',
      difficulty,
      count: 20
    })

    return this.practiceRepo.create({
      userId,
      subjectId,
      difficulty,
      totalQuestions: questions.length,
      questions: {
        create: questions.map((q) => ({
          question: q.question,
          options: q.options,
          explanation: q.explanation
        }))
      }
    })
  }

  async submitAnswer(
    practiceId: string,
    questionId: string,
    answerId: string
  ): Promise<{
    isCorrect: boolean
    explanation: string
  }> {
    const question = await this.practiceRepo.findQuestionById(questionId)
    if (!question) {
      throw new Error('Question not found')
    }

    const options = question.options as any[]
    const correctOption = options.find((o) => o.isCorrect)
    const isCorrect = correctOption.id === answerId

    await this.practiceRepo.updateQuestion(practiceId, questionId, isCorrect)

    return {
      isCorrect,
      explanation: question.explanation
    }
  }

  async getUserPractices(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit
    const [practices, total] = await Promise.all([
      this.practiceRepo.findUserPractices(userId, { skip, take: limit }),
      this.practiceRepo.countUserPractices(userId)
    ])

    return {
      practices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }
}
