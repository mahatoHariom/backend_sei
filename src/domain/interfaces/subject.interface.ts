import { Subject } from '@prisma/client'

export interface SubjectCreateInput {
  name: string
  description?: string
}

export interface SubjectUpdateInput {
  name?: string
  description?: string
}

export interface ISubjectRepository {
  getAllSubjects(
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
  }>

  createSubject(data: SubjectCreateInput): Promise<Subject>

  updateSubject(id: string, data: SubjectUpdateInput): Promise<Subject>

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
