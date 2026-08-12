import type { NextFunction, Request, Response } from 'express'
import type { z } from 'zod'

function validationError(res: Response, message: string, details: unknown) {
  res.status(400).json({
    error: { code: 'VALIDATION_ERROR', message, details },
  })
}

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      validationError(res, 'Invalid request body', result.error.flatten())
      return
    }

    req.body = result.data
    next()
  }
}

export function validateQuery<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      validationError(res, 'Invalid query parameters', result.error.flatten())
      return
    }

    res.locals.validatedQuery = result.data
    next()
  }
}
