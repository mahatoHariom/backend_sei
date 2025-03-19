import { injectable } from 'inversify'
import { PrismaService } from '@/app/services/prisma-service'
import { PdfFile, Prisma } from '@prisma/client'
import { IPdfRepository } from '../interfaces/pdf-interface'

@injectable()
export class PrismaPdfRepository implements IPdfRepository {
  private readonly prisma = PrismaService.getClient()

  async create(data: Prisma.PdfFileCreateInput): Promise<PdfFile> {
    return this.prisma.pdfFile.create({ data })
  }

  async findById(id: string): Promise<PdfFile | null> {
    return this.prisma.pdfFile.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })
  }

  async findMany(query: {
    skip?: number
    take?: number
    orderBy?: Prisma.PdfFileOrderByWithRelationInput
  }): Promise<PdfFile[]> {
    return this.prisma.pdfFile.findMany({
      ...query,
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true
          }
        }
      }
    })
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.prisma.pdfFile.update({
      where: { id },
      data: { downloadCount: { increment: 1 } }
    })
  }
  async count(filters: Prisma.PdfFileWhereInput): Promise<number> {
    return this.prisma.pdfFile.count({ where: filters })
  }

  async delete(id: string): Promise<PdfFile> {
    return this.prisma.pdfFile.delete({ where: { id } })
  }
}
