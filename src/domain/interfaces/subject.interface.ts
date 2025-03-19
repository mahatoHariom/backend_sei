import { Subject } from '@prisma/client'

export interface SubjectCreateInput {
  name: string
  description?: string
  difficulty?: string
  duration?: string
  imageUrl?: string
  courseType?: string
  tags?: string[]
  badge?: string
  students?: number
}

export interface SubjectUpdateInput {
  name?: string
  description?: string
  difficulty?: string
  duration?: string
  imageUrl?: string
  courseType?: string
  tags?: string[]
  badge?: string
  students?: number
}

export interface ISubjectRepository {
  getAllSubjects(): Promise<Subject[]>

  // createSubject(data: SubjectCreateInput): Promise<Subject>

  // updateSubject(id: string, data: SubjectUpdateInput): Promise<Subject>

  createUserSubjectEnrollment(userId: string, subjectId: string): Promise<void>

  findUserSubjectEnrollment(userId: string, subjectId: string): Promise<any>

  deleteUserSubjectEnrollment(userId: string, subjectId: string): Promise<void>

  getSubjectById(subjectId: string): Promise<Subject | null>

  getUserSubjects(
    userId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<{
    subjects: Subject[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }>
}
