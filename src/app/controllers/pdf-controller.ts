import { FastifyReply, FastifyRequest } from 'fastify'
import { inject, injectable } from 'inversify'
import { TYPES } from '@/types'
import { PdfService } from '../services/pdf-service'
import ApiError from '@/infrastructure/config/ApiError'
import { StatusCode } from '@/domain/constants/messages'
import { User } from '@prisma/client'
import path from 'path'
import { UserRole } from '@prisma/client'
import fs from 'fs'

@injectable()
export class PdfController {
  constructor(@inject(TYPES.PdfService) private pdfService: PdfService) {}

  async uploadPdf(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Check if file was uploaded
      if (!request.file) {
        throw new ApiError('No PDF file uploaded', StatusCode.BadRequest)
      }

      const file = request.file as any
      const { title, description } = request.body as any
      const user = request.user as User

      // Construct the PDF path
      const pdfPath = `/uploads/${file.filename}`

      // Create PDF record in database
      const pdf = await this.pdfService.createPdf({
        title: title || file.originalname,
        description: description || '',
        filename: file.originalname,
        path: pdfPath,
        mimetype: file.mimetype,
        size: file.size,
        userId: user.id
      })

      return reply.status(201).send({
        message: 'PDF uploaded successfully',
        pdf
      })
    } catch (error: any) {
      console.error('Error uploading PDF:', error)
      if (error instanceof ApiError) {
        return reply.status(error.statusCode).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Error uploading PDF' })
    }
  }

  async getPdfs(
    request: FastifyRequest<{
      Querystring: { page?: string | number; limit?: string | number; search?: string }
    }>,
    reply: FastifyReply
  ) {
    try {
      // Parse query parameters and provide defaults
      const page = request.query.page ? parseInt(String(request.query.page), 10) : 1
      const limit = request.query.limit ? parseInt(String(request.query.limit), 10) : 10
      const search = request.query.search || ''

      const user = request.user as User

      // Check if user is admin
      if (user.role !== UserRole.ADMIN) {
        throw new ApiError('Unauthorized', StatusCode.Unauthorized)
      }

      const result = await this.pdfService.getPdfs(page, limit, search)

      return reply.send(result)
    } catch (error: any) {
      console.error('Error fetching PDFs:', error)
      if (error instanceof ApiError) {
        return reply.status(error.statusCode).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Error fetching PDFs' })
    }
  }

  async getUserPdfs(
    request: FastifyRequest<{
      Querystring: { page?: string | number; limit?: string | number; search?: string }
    }>,
    reply: FastifyReply
  ) {
    try {
      // Parse query parameters and provide defaults
      const page = request.query.page ? parseInt(String(request.query.page), 10) : 1
      const limit = request.query.limit ? parseInt(String(request.query.limit), 10) : 10
      const search = request.query.search || ''

      const result = await this.pdfService.getUserPdfs(page, limit, search)

      return reply.send(result)
    } catch (error: any) {
      console.error('Error fetching user PDFs:', error)
      if (error instanceof ApiError) {
        return reply.status(error.statusCode).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Error fetching user PDFs' })
    }
  }

  async downloadPdf(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      console.log(`Download requested for PDF ID: ${id} by user: ${(request.user as any)?.email || 'unknown'}`)

      // Get PDF metadata
      const pdf = await this.pdfService.getPdf(id)
      if (!pdf) {
        console.error(`PDF not found with ID: ${id}`)
        throw new ApiError('PDF not found', StatusCode.NotFound)
      }

      // Increment download count (don't await - non-blocking)
      this.pdfService.incrementDownloadCount(id).catch((err) => {
        console.warn(`Failed to increment download count for PDF ID: ${id}`, err)
      })

      // Get file path - strip leading slash if needed
      const filePath = pdf.path.startsWith('/') ? pdf.path.substring(1) : pdf.path
      const absolutePath = path.join(process.cwd(), filePath)

      // Verify file exists before sending
      if (!fs.existsSync(absolutePath)) {
        console.error(`File not found at path: ${absolutePath}`)
        throw new ApiError('PDF file not found on server', StatusCode.NotFound)
      }

      // Get file stats for size
      const stats = fs.statSync(absolutePath)

      console.log(`Streaming file: ${pdf.filename} (${stats.size} bytes) from ${absolutePath}`)

      // Set appropriate headers for streaming
      reply
        .header('Content-Disposition', `attachment; filename="${pdf.filename}"`)
        .header('Content-Type', 'application/pdf')
        .header('Content-Length', stats.size)
        .header('Cache-Control', 'no-cache')

      // Create read stream with error handling
      const stream = fs.createReadStream(absolutePath)

      // Handle stream errors
      stream.on('error', (err) => {
        console.error(`Stream error for PDF ID ${id}:`, err)
        // The error will be caught by Fastify
      })

      return reply.send(stream)
    } catch (error: any) {
      console.error('Error downloading PDF:', error)
      if (error instanceof ApiError) {
        return reply.status(error.statusCode).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Error downloading PDF' })
    }
  }

  async deletePdf(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params
      const user = request.user as User

      // Check if user is admin
      if (user.role !== UserRole.ADMIN) {
        throw new ApiError('Unauthorized', StatusCode.Unauthorized)
      }

      // Get PDF metadata
      const pdf = await this.pdfService.getPdf(id)
      if (!pdf) {
        throw new ApiError('PDF not found', StatusCode.NotFound)
      }

      // Delete PDF
      await this.pdfService.deletePdf(id)

      return reply.send({ message: 'PDF deleted successfully' })
    } catch (error: any) {
      console.error('Error deleting PDF:', error)
      if (error instanceof ApiError) {
        return reply.status(error.statusCode).send({ message: error.message })
      }
      return reply.status(500).send({ message: 'Error deleting PDF' })
    }
  }
}
