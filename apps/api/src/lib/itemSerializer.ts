import type { PublicItem } from '@threadly/shared'
import type { Item, User } from '@prisma/client'

type ItemWithSeller = Item & { seller: Pick<User, 'id' | 'name'> }

export function toPublicItem(item: ItemWithSeller): PublicItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    condition: item.condition,
    category: item.category,
    imageUrl: item.imageUrl,
    sold: item.sold,
    createdAt: item.createdAt.toISOString(),
    seller: { id: item.seller.id, name: item.seller.name },
  }
}
