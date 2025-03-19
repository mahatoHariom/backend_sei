import { FastifyReply, FastifyRequest } from 'fastify'
import { injectable, inject } from 'inversify'
import { TYPES } from '@/types'
import { PdfService } from '../services/pdf-service'
import path from 'path'
import { createReadStream, promises as fsPromises } from 'fs'

interface UploadPdfBody {
  title: string
  description?: string
}

@injectable()
export class PdfController {
  constructor(@inject(TYPES.PdfService) private pdfService: PdfService) {}

  async uploadPdfs(request: FastifyRequest, reply: FastifyReply) {
    try {
      console.log(request.files, request.body, 'Uploading PDFs')

      console.log(typeof request.files, 'request.files')

      if (!request.files || !(request.files instanceof Array) || !request.files.length) {
        return reply.status(400).send({ error: 'No PDF files uploaded' })
      }

      const { title, description } = request.body as { title: string; description?: string }

      const files = request.files
      const uploadedPdfs = await Promise.all(
        files.map((file) => this.pdfService.uploadPdf(file, request.user.id, title, description))
      )

      return reply.status(201).send(uploadedPdfs)
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Failed to upload PDFs' })
    }
  }

  async getAllPdfs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const {
        page = 1,
        limit = 10,
        search
      } = request.query as {
        page?: number
        limit?: number
        search?: string
      }

      // Call the service to get PDFs and pagination data
      const result = await this.pdfService.getAllPdfs(page, limit, search)

      // Ensure that you're returning both PDFs and pagination data
      return reply.send({
        data: result.pdfs, // Return the PDF list under 'data'
        pagination: result.pagination // Return pagination info
      })
    } catch (error) {
      request.log.error(error)
      return reply.status(500).send({ error: 'Failed to fetch PDFs' })
    }
  }

  async downloadPdf(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const pdf = await this.pdfService.downloadPdf(id)

    const filePath = path.resolve(pdf.path)

    // Check if file exists and get its size
    const stats = await fsPromises.stat(filePath)

    // Create read stream
    const stream = createReadStream(filePath)

    reply.header('Content-Type', 'application/pdf')
    reply.header('Content-Disposition', `attachment; filename="${pdf.filename}"`)
    reply.header('Content-Length', stats.size)

    return reply.send(stream)
  }

  async bulkDownload(request: FastifyRequest, reply: FastifyReply) {
    const { fileIds } = request.body as { fileIds: string[] }
    const archive = await this.pdfService.bulkDownload(fileIds)

    reply.header('Content-Type', 'application/zip')
    reply.header('Content-Disposition', 'attachment; filename=pdfs.zip')

    return reply.send(archive)
  }

  async deletePdf(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string }
    const userId = (request as any).user.id

    await this.pdfService.deletePdf(id, userId)
    return reply.status(200).send({ message: 'PDF deleted successfully' })
  }
}
