import { FastifyInstance } from 'fastify'
import { TYPES } from '@/types'
import { PdfController } from '@/app/controllers/pdf-controller'
import { createPdfSchema, pdfResponseSchema } from '@/domain/schemas/pdf-schema'
import { upload } from '@/infrastructure/config/multer'
// import { PdfController } from '@/app/controllers/pdf-controller'
// import { upload } from '../config/multer-config'
// import { createPdfSchema, pdfResponseSchema } from '@/domain/schemas/pdf-schemas'

export default async function pdfRoutes(fastify: FastifyInstance) {
  const pdfController = fastify.container.get<PdfController>(TYPES.PdfController)

  // Admin routes
  fastify.post(
    '/admin/pdfs',
    {
      schema: {
        tags: ['Admin'],
        consumes: ['multipart/form-data'],
        // body: createPdfSchema,
        response: {
          201: pdfResponseSchema
        }
      },
      preHandler: upload.array('pdfs'),
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    pdfController.uploadPdfs.bind(pdfController)
  )

  // Get all PDFs with pagination
  fastify.get(
    '/pdfs',
    {
      schema: {
        tags: ['PDFs'],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 10 }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: { type: 'array', items: pdfResponseSchema },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  total: { type: 'number' }
                }
              }
            }
          }
        }
      },
      onRequest: [fastify.authenticate]
    },
    pdfController.getAllPdfs.bind(pdfController)
  )

  // Download single PDF
  fastify.get(
    '/pdfs/:id/download',
    {
      schema: {
        tags: ['PDFs'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      },
      onRequest: [fastify.authenticate]
    },
    pdfController.downloadPdf.bind(pdfController)
  )

  // Bulk download PDFs
  fastify.post(
    '/pdfs/bulk-download',
    {
      schema: {
        tags: ['PDFs'],
        body: {
          type: 'object',
          properties: {
            fileIds: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      onRequest: [fastify.authenticate]
    },
    pdfController.bulkDownload.bind(pdfController)
  )

  // Delete PDF (admin only)
  fastify.delete(
    '/admin/pdfs/:id',
    {
      schema: {
        tags: ['Admin'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      },
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    pdfController.deletePdf.bind(pdfController)
  )
}
