import multer from 'fastify-multer'
import path from 'path'
import fs from 'fs'
import { FastifyRequest } from 'fastify'

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads')

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})

// For PDF uploads
export const pdfUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed'))
      return
    }
    cb(null, true)
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// For image uploads (profile pics)
export const imageUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'))
      return
    }
    cb(null, true)
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for images
  }
})

// For carousel image uploads
export const carouselImageUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Only image files are allowed'))
      return
    }
    cb(null, true)
  },
  limits: {
    fileSize: 8 * 1024 * 1024 // 8MB limit for carousel images (larger as they're banner images)
  }
})

// Default export as alias for backward compatibility
export const upload = pdfUpload
