import { PdfFile, Prisma, User, UserDetail } from '@prisma/client'

export interface IPdfRepository {
  create(data: Prisma.PdfFileCreateInput): Promise<PdfFile>
  findById(id: string): Promise<PdfFile | null>
  findMany(query: {
    skip?: number
    take?: number
    orderBy?: Prisma.PdfFileOrderByWithRelationInput
  }): Promise<PdfFile[]>
  incrementDownloadCount(id: string): Promise<void>
  delete(id: string): Promise<PdfFile>
  count(filters: Prisma.PdfFileWhereInput): Promise<number>
}
