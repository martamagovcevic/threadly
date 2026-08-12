import type { ErrorRequestHandler, RequestHandler } from 'express'

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
  })
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
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
