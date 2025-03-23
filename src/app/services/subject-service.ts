import { inject, injectable } from 'inversify'
import { TYPES } from '@/types'
import { ISubjectRepository, SubjectCreateInput, SubjectUpdateInput } from '@/domain/interfaces/subject.interface'
import { Subject } from '@prisma/client'

@injectable()
export class SubjectService {
  constructor(@inject(TYPES.ISubjectRepository) private subjectRepository: ISubjectRepository) {}
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
    return this.subjectRepository.getAllSubjects(page, limit, search)
  }

  async createSubject(data: SubjectCreateInput): Promise<Subject> {
    return this.subjectRepository.createSubject(data)
  }

  async updateSubject(id: string, data: SubjectUpdateInput): Promise<Subject> {
    return this.subjectRepository.updateSubject(id, data)
  }

  async enrollUserInSubject(userId: string, subjectId: string) {
    await this.subjectRepository.createUserSubjectEnrollment(userId, subjectId)
  }

  async checkEnrollment(userId: string, subjectId: string) {
    // Check if there's an existing enrollment for this user and subject
    return this.subjectRepository.findUserSubjectEnrollment(userId, subjectId)
  }

  async unenrollUserFromSubject(userId: string, subjectId: string) {
    await this.subjectRepository.deleteUserSubjectEnrollment(userId, subjectId)
  }
  async getSubjectById(subjectId: string) {
    return this.subjectRepository.getSubjectById(subjectId)
  }

  async getUserSubjects(userId: string, page: number, limit: number, search?: string) {
    return this.subjectRepository.getUserSubjects(userId, page, limit, search)
  }
}
