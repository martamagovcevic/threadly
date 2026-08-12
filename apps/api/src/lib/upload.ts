import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import multer from 'multer'
import { env } from '../config/env'

export const PUBLIC_UPLOAD_PATH = '/uploads'
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const UPLOAD_DIR = path.resolve(process.cwd(), env.UPLOAD_DIR)

fs.mkdirSync(UPLOAD_DIR, { recursive: true })

function mimeToExtension(mime: string): string {
  switch (mime) {
    case 'image/jpeg':
      return '.jpg'
    case 'image/png':
      return '.png'
    case 'image/webp':
      return '.webp'
    default:
      return ''
  }
}

export class UploadError extends Error {
  status: number = 400

  constructor(
    message: string,
    public code: string,
  ) {
    super(message)
    this.name = 'UploadError'
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = mimeToExtension(file.mimetype)
    cb(null, `${randomUUID()}${ext}`)
  },
})

export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new UploadError('Only JPG, PNG, or WebP images are allowed', 'INVALID_IMAGE_TYPE'))
      return
    }
    cb(null, true)
  },
})
