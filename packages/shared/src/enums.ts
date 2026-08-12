import { z } from 'zod'

export const RoleSchema = z.enum(['USER', 'ADMIN'])
export type Role = z.infer<typeof RoleSchema>

export const ConditionSchema = z.enum(['NEW', 'GOOD', 'FAIR'])
export type Condition = z.infer<typeof ConditionSchema>

export const CategorySchema = z.enum([
  'DENIM',
  'OUTERWEAR',
  'DRESSES',
  'KNITWEAR',
  'SHOES',
  'ACCESSORIES',
  'OTHER',
])
export type Category = z.infer<typeof CategorySchema>
