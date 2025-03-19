import { Practice, PracticeQuestion, Difficulty } from '@prisma/client'

export interface IPracticeRepository {
  create(data: any): Promise<Practice>
  findById(id: string): Promise<Practice | null>
  findQuestionById(id: string): Promise<PracticeQuestion | null>
  updateQuestion(practiceId: string, questionId: string, isCorrect: boolean): Promise<PracticeQuestion>
  findUserPractices(userId: string, query: { skip?: number; take?: number }): Promise<Practice[]>
  countUserPractices(userId: string): Promise<number>
}
