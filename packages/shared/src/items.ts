import { z } from 'zod'
import { CategorySchema, ConditionSchema } from './enums'
import type { Category, Condition } from './enums'

export const ItemListQuerySchema = z.object({
  search: z.string().trim().max(200, 'Search must be 200 characters or fewer').optional(),
  category: CategorySchema.optional(),
  condition: ConditionSchema.optional(),
  minPrice: z.coerce.number().min(0, 'minPrice must be 0 or greater').optional(),
  maxPrice: z.coerce.number().min(0, 'maxPrice must be 0 or greater').optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  page: z.coerce.number().int().min(1, 'page must be at least 1').default(1),
  pageSize: z.coerce.number().int().min(1, 'pageSize must be at least 1').max(50).default(12),
})

export type ItemListQuery = z.infer<typeof ItemListQuerySchema>

export interface ItemSeller {
  id: string
  name: string
}

export interface PublicItem {
  id: string
  name: string
  description: string
  price: number
  condition: Condition
  category: Category
  imageUrl: string | null
  sold: boolean
  createdAt: string
  seller: ItemSeller
}

export interface ItemListResponse {
  items: PublicItem[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}
