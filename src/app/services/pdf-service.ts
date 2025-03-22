import { injectable, inject } from 'inversify'
import { TYPES } from '@/types'
import { unlink } from 'fs/promises'
// import path from 'path'
// import { ApiError } from '@/infrastructure/config/ApiError'
import { Messages, StatusCode } from '@/domain/constants/messages'
import archiver from 'archiver'
import { createReadStream } from 'fs'
import { PrismaPdfRepository } from '@/domain/repositories/pdf-repository'
import ApiError from '@/infrastructure/config/ApiError'
import { IPdfRepository } from '@/domain/interfaces/pdf-interface'

@injectable()
export class PdfService {
  constructor(@inject(TYPES.IPdfRepository) private pdfRepository: IPdfRepository) {}

  async uploadPdf(
    file: {
      fieldname: string
      originalname: string
      encoding: string
      mimetype: string
      destination: string
      filename: string
      path: string
      size: number
    },
    userId: string,
    title: string,
    description?: string
  ): Promise<any> {
    return this.pdfRepository.create({
      title,
      description,
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      uploadedBy: {
        connect: { id: userId }
      }
    })
  }

  async getAllPdfs(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit

    const filters = search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}

    const pdfs = await this.pdfRepository.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      ...filters
    })

    const total = await this.pdfRepository.count(filters)

    return {
      pdfs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasPreviousPage: page > 1,
        hasNextPage: page * limit < total
      }
    }
  }

  async downloadPdf(id: string) {
    const pdf = await this.pdfRepository.findById(id)
    if (!pdf) {
      throw new ApiError(Messages.FILE_NOT_FOUND, StatusCode.NotFound)
    }

    await this.pdfRepository.incrementDownloadCount(id)
    return pdf
  }

  async bulkDownload(fileIds: string[]) {
    const archive = archiver('zip')

    for (const id of fileIds) {
      const pdf = await this.pdfRepository.findById(id)
      if (!pdf) continue

      archive.append(createReadStream(pdf.path), { name: pdf.filename })
      await this.pdfRepository.incrementDownloadCount(id)
    }

    await archive.finalize()
    return archive
  }

  async deletePdf(id: string, userId: string) {
    const pdf = await this.pdfRepository.findById(id)

    if (!pdf) {
      throw new ApiError(Messages.FILE_NOT_FOUND, StatusCode.NotFound)
    }

    if (pdf.userId !== userId) {
      throw new ApiError(Messages.USER_NOT_AUTHENTICATED, StatusCode.Forbidden)
    }

    try {
      await unlink(pdf.path)
      await this.pdfRepository.delete(id)
    } catch (error) {
      throw new ApiError(Messages.FILE_DELETE_ERROR, StatusCode.InternalServerError)
    }
  }
}
