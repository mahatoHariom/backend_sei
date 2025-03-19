// src/domain/schemas/pdf-schema.ts
export const createPdfSchema = {
  type: 'object',
  properties: {
    pdf: { type: 'string', format: 'binary' },
    title: { type: 'string', minLength: 1 },
    description: { type: 'string' }
  },
  required: ['pdf', 'title']
}

export const pdfResponseSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    filename: { type: 'string' },
    originalName: { type: 'string' },
    path: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
  }
}

export interface PdfDocument {
  id: string
  title: string
  description?: string
  filename: string
  originalName: string
  path: string
  createdAt: Date
  updatedAt: Date
}
