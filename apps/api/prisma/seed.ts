import { PrismaClient, type Category, type Condition } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient()

interface SeedItem {
  name: string
  description: string
  price: number
  condition: Condition
  category: Category
}

const seedItems: SeedItem[] = [
  {
    name: 'Vintage Levi’s 501',
    description: 'Classic 90s denim, broken in just right. True to size 30x32.',
    price: 45,
    condition: 'GOOD',
    category: 'DENIM',
  },
  {
    name: '90s Leather Jacket',
    description: 'Genuine leather biker jacket with original zips.',
    price: 120,
    condition: 'GOOD',
    category: 'OUTERWEAR',
  },
  {
    name: 'Floral Tea Dress',
    description: 'Sweet 70s print, knee length, back zip.',
    price: 28,
    condition: 'NEW',
    category: 'DRESSES',
  },
  {
    name: 'Hand-knit Wool Sweater',
    description: 'Chunky mustard knit, some pilling but full of character.',
    price: 35,
    condition: 'FAIR',
    category: 'KNITWEAR',
  },
  {
    name: 'Doc Martens 1460',
    description: 'Black smooth leather boots, size 39. Worn in but plenty of life.',
    price: 65,
    condition: 'GOOD',
    category: 'SHOES',
  },
  {
    name: 'Band Tee (Vintage 1991)',
    description: 'Soft-washed concert tee, faded print.',
    price: 22,
    condition: 'FAIR',
    category: 'OTHER',
  },
  {
    name: 'Silk Scarf',
    description: 'Statement scarf with painterly print.',
    price: 18,
    condition: 'NEW',
    category: 'ACCESSORIES',
  },
  {
    name: 'Corduroy Overshirt',
    description: 'Brown wide-wale cords, boxy 70s fit.',
    price: 40,
    condition: 'GOOD',
    category: 'OUTERWEAR',
  },
]

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@threadly.dev' },
    update: {},
    create: {
      email: 'admin@threadly.dev',
      name: 'Threadly Admin',
      password: await hashPassword('admin12345'),
      role: 'ADMIN',
    },
  })

  const seller = await prisma.user.upsert({
    where: { email: 'seller@threadly.dev' },
    update: {},
    create: {
      email: 'seller@threadly.dev',
      name: 'Marta',
      password: await hashPassword('password123'),
    },
  })

  const existing = await prisma.item.count()
  if (existing === 0) {
    await prisma.item.createMany({
      data: seedItems.map((item) => ({ ...item, sellerId: seller.id })),
    })
  }

  const itemCount = await prisma.item.count()
  console.log(`Seed complete: admin=${admin.email}, seller=${seller.email}, items=${itemCount}`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
