export interface Item {
  id: string
  name: string
  description: string
  price: number
  condition: string
  category: string
  imageUrl: string | null
  sold: boolean
  seller: { id: string; name: string }
}
