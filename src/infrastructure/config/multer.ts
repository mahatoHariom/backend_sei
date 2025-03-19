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
    console.log(file, 'file')
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  }
})

export const upload = multer({
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
