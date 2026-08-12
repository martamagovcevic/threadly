import { z } from 'zod'
import type { PublicItem } from './items'

export const CheckoutSchema = z.object({ itemId: z.string().min(1, 'Item is required') })
export type CheckoutInput = z.infer<typeof CheckoutSchema>

export interface PublicOrder {
  id: string
  pricePaid: number
  createdAt: string
  item: PublicItem
}

export interface OrderListResponse {
  orders: PublicOrder[]
}
