import type { ErrorRequestHandler, RequestHandler } from 'express'

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  })
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err?.name === 'MulterError') {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large (max 5MB)'
        : `Upload failed: ${err.message}`
    res.status(400).json({ error: { code: 'UPLOAD_ERROR', message } })
    return
  }

  const status = typeof err.status === 'number' ? err.status : 500

  if (status >= 500) {
    console.error(err)
  }

  res.status(status).json({
    error: {
      code: status === 500 ? 'INTERNAL_SERVER_ERROR' : (err.code ?? 'ERROR'),
      message: status === 500 ? 'Internal server error' : err.message,
    },
  })
}
