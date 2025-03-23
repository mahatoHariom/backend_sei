import { PdfFile, Prisma } from '@prisma/client'

export interface IPdfRepository {
  create(data: Prisma.PdfFileCreateInput): Promise<PdfFile>
  findById(id: string): Promise<PdfFile | null>
  findMany(query: {
    skip?: number
    take?: number
    orderBy?: Prisma.PdfFileOrderByWithRelationInput
    where?: Prisma.PdfFileWhereInput
  }): Promise<PdfFile[]>
  incrementDownloadCount(id: string): Promise<void>
  delete(id: string): Promise<PdfFile>
  count(filters: Prisma.PdfFileWhereInput): Promise<number>
}
