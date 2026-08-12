import type {
  CreateItemInput,
  ItemListQuery,
  ItemListResponse,
  UpdateItemInput,
} from '@threadly/shared'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { toPublicItem } from '../lib/itemSerializer'

const VISIBLE: Prisma.ItemWhereInput = { sold: false, hidden: false }

function buildWhere(query: ItemListQuery): Prisma.ItemWhereInput {
  const where: Prisma.ItemWhereInput = { ...VISIBLE }
  const search = query.search?.trim()

  if (search) {
    where.OR = [{ name: { contains: search } }, { description: { contains: search } }]
  }
  if (query.category) {
    where.category = query.category
  }
  if (query.condition) {
    where.condition = query.condition
  }

  const priceFilter: Prisma.FloatFilter = {}
  if (query.minPrice !== undefined) priceFilter.gte = query.minPrice
  if (query.maxPrice !== undefined) priceFilter.lte = query.maxPrice
  if (Object.keys(priceFilter).length > 0) {
    where.price = priceFilter
  }

  return where
}

function buildOrderBy(sort: ItemListQuery['sort']): Prisma.ItemOrderByWithRelationInput {
  switch (sort) {
    case 'price_asc':
      return { price: 'asc' }
    case 'price_desc':
      return { price: 'desc' }
    default:
      return { createdAt: 'desc' }
  }
}

export async function listItems(query: ItemListQuery): Promise<ItemListResponse> {
  const where = buildWhere(query)
  const orderBy = buildOrderBy(query.sort)

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { seller: { select: { id: true, name: true } } },
    }),
    prisma.item.count({ where }),
  ])

  return {
    items: items.map(toPublicItem),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  }
}

export async function getItemById(id: string) {
  return prisma.item.findFirst({
    where: { id, ...VISIBLE },
    include: { seller: { select: { id: true, name: true } } },
  })
}

export async function getItemWithSeller(id: string) {
  return prisma.item.findUnique({
    where: { id },
    include: { seller: { select: { id: true, name: true } } },
  })
}

export async function createItem(input: CreateItemInput, sellerId: string) {
  return prisma.item.create({
    data: { ...input, sellerId },
    include: { seller: { select: { id: true, name: true } } },
  })
}

export async function updateItem(id: string, input: UpdateItemInput) {
  return prisma.item.update({
    where: { id },
    data: input,
    include: { seller: { select: { id: true, name: true } } },
  })
}

export async function markItemSold(id: string) {
  return prisma.item.update({
    where: { id },
    data: { sold: true },
    include: { seller: { select: { id: true, name: true } } },
  })
}

export async function deleteItem(id: string) {
  return prisma.item.delete({ where: { id } })
}
