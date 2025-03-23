import { inject, injectable } from 'inversify'
import { TYPES } from '@/types'
import { PdfFile, Prisma } from '@prisma/client'
import { IPdfRepository } from '@/domain/interfaces/pdf-interface'
import fs from 'fs'
import path from 'path'

@injectable()
export class PdfService {
  constructor(@inject(TYPES.IPdfRepository) private pdfRepository: IPdfRepository) {}

  async createPdf(data: {
    title: string
    description?: string
    filename: string
    path: string
    mimetype: string
    size: number
    userId: string
  }): Promise<PdfFile> {
    const { userId, ...pdfData } = data

    return this.pdfRepository.create({
      ...pdfData,
      uploadedBy: {
        connect: { id: userId }
      }
    })
  }

  async getPdf(id: string): Promise<PdfFile | null> {
    return this.pdfRepository.findById(id)
  }

  async getPdfs(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    pdfs: PdfFile[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }> {
    // Ensure page and limit are integers
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit

    const skip = (parsedPage - 1) * parsedLimit
    const take = parsedLimit

    // Create filter conditions based on search term
    const where: Prisma.PdfFileWhereInput = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Find PDFs with pagination
    const pdfs = await this.pdfRepository.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Count total matching PDFs for pagination
    const total = await this.pdfRepository.count(where)
    const totalPages = Math.ceil(total / parsedLimit)

    return {
      pdfs,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
      hasPreviousPage: parsedPage > 1,
      hasNextPage: parsedPage < totalPages
    }
  }

  async getUserPdfs(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    pdfs: PdfFile[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }> {
    // Ensure page and limit are integers
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit

    const skip = (parsedPage - 1) * parsedLimit
    const take = parsedLimit

    // Create filter conditions based on search term
    const where: Prisma.PdfFileWhereInput = {}
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { filename: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Find PDFs with pagination
    const pdfs = await this.pdfRepository.findMany({
      skip,
      take,
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Count total matching PDFs for pagination
    const total = await this.pdfRepository.count(where)
    const totalPages = Math.ceil(total / parsedLimit)

    return {
      pdfs,
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
      hasPreviousPage: parsedPage > 1,
      hasNextPage: parsedPage < totalPages
    }
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await this.pdfRepository.incrementDownloadCount(id)
  }

  async deletePdf(id: string): Promise<void> {
    // First get the PDF to find the file path
    const pdf = await this.pdfRepository.findById(id)
    if (!pdf) {
      throw new Error('PDF file not found')
    }

    // Delete from filesystem
    try {
      const fullPath = path.join(process.cwd(), pdf.path)
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath)
      }
    } catch (error) {
      console.error('Failed to delete PDF file from filesystem:', error)
      // Continue with DB deletion even if file deletion fails
    }

    // Delete from database
    await this.pdfRepository.delete(id)
  }
}
