import { FastifyInstance } from 'fastify'
import { TYPES } from '@/types'
import { PdfController } from '@/app/controllers/pdf-controller'
import { pdfUpload } from '@/infrastructure/config/multer'

export default async function pdfRoutes(fastify: FastifyInstance) {
  const pdfController: PdfController = fastify.container.get(TYPES.PdfController)

  // Debug route to verify router setup
  fastify.get('/pdf-routes-debug', async () => {
    return {
      message: 'PDF routes are configured correctly',
      timestamp: new Date().toISOString()
    }
  })

  // IMPORTANT: Routes with ID parameters must come before more general routes
  // PDF download route - this needs to be BEFORE `/pdfs/user`
  fastify.get(
    '/pdfs/:id/download',
    {
      onRequest: [fastify.authenticate]
    },
    pdfController.downloadPdf.bind(pdfController)
  )

  // User routes - require authentication
  fastify.get(
    '/pdfs/user',
    {
      onRequest: [fastify.authenticate]
    },
    pdfController.getUserPdfs.bind(pdfController)
  )

  // Admin routes - require admin role
  fastify.post(
    '/admin/pdfs',
    {
      onRequest: [fastify.authenticate, fastify.checkAdmin],
      preHandler: pdfUpload.single('pdf')
    },
    pdfController.uploadPdf.bind(pdfController)
  )

  fastify.get(
    '/admin/pdfs',
    {
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    pdfController.getPdfs.bind(pdfController)
  )

  fastify.delete(
    '/admin/pdfs/:id',
    {
      onRequest: [fastify.authenticate, fastify.checkAdmin]
    },
    pdfController.deletePdf.bind(pdfController)
  )
}
