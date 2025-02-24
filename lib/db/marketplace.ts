import { prisma } from './client'
import type { ListingCreate, ListingUpdate, ListingSearchParams } from '@/types/marketplace'
import { ListingStatus, Prisma } from '@prisma/client'

export async function createListing(data: ListingCreate & { sellerId: string }) {
  return prisma.listing.create({
    data: {
      title: data.title,
      description: data.description,
      price: new Prisma.Decimal(data.price),
      images: [], // Image URLs will be added after upload
      categoryId: data.categoryId,
      location: data.location,
      sellerId: data.sellerId,
    },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
          isVerifiedSeller: true,
        },
      },
      category: true,
      _count: {
        select: {
          wishlistItems: true,
        },
      },
    },
  })
}

export async function updateListing(data: ListingUpdate) {
  const updateData: Prisma.ListingUpdateInput = {}
  
  if (data.title) updateData.title = data.title
  if (data.description) updateData.description = data.description
  if (data.price) updateData.price = new Prisma.Decimal(data.price)
  if (data.categoryId) updateData.category = { connect: { id: data.categoryId } }
  if (data.location) updateData.location = data.location
  if (data.status) updateData.status = data.status

  return prisma.listing.update({
    where: { id: data.id },
    data: updateData,
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
          isVerifiedSeller: true,
        },
      },
      category: true,
      _count: {
        select: {
          wishlistItems: true,
        },
      },
    },
  })
}

export async function searchListings(params: ListingSearchParams) {
  const {
    query,
    categoryId,
    minPrice,
    maxPrice,
    location,
    status = ListingStatus.ACTIVE,
    sellerId,
    page = 1,
    limit = 10,
    sortBy = 'created_desc',
  } = params

  const where: Prisma.ListingWhereInput = { status }
  
  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ]
  }
  
  if (categoryId) where.categoryId = categoryId
  if (location) where.location = { contains: location, mode: 'insensitive' }
  if (sellerId) where.sellerId = sellerId
  
  if (minPrice || maxPrice) {
    where.price = {
      ...(minPrice && { gte: new Prisma.Decimal(minPrice) }),
      ...(maxPrice && { lte: new Prisma.Decimal(maxPrice) }),
    }
  }

  const orderBy = {
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
    created_desc: { createdAt: 'desc' },
    relevance: query ? { _relevance: { fields: ['title'], search: query } } : { createdAt: 'desc' },
  }[sortBy]

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            isVerifiedSeller: true,
          },
        },
        category: true,
        _count: {
          select: {
            wishlistItems: true,
          },
        },
      },
    }),
    prisma.listing.count({ where }),
  ])

  return {
    items,
    total,
    page,
    limit,
    hasMore: total > page * limit,
  }
}

export async function toggleWishlist(userId: string, listingId: string) {
  const existing = await prisma.wishlistItem.findUnique({
    where: {
      userId_listingId: {
        userId,
        listingId,
      },
    },
  })

  if (existing) {
    await prisma.wishlistItem.delete({
      where: { id: existing.id },
    })
    return false // Removed from wishlist
  }

  await prisma.wishlistItem.create({
    data: {
      userId,
      listingId,
    },
  })
  return true // Added to wishlist
}

export async function createPurchase(buyerId: string, listingId: string) {
  // Start a transaction to ensure listing status and purchase are updated atomically
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      select: { price: true, status: true },
    })

    if (!listing || listing.status !== ListingStatus.ACTIVE) {
      throw new Error('Listing not available for purchase')
    }

    const [purchase] = await Promise.all([
      tx.purchase.create({
        data: {
          buyerId,
          listingId,
          amount: listing.price,
        },
        include: {
          listing: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  isVerifiedSeller: true,
                },
              },
              category: true,
              _count: {
                select: {
                  wishlistItems: true,
                },
              },
            },
          },
          buyer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      tx.listing.update({
        where: { id: listingId },
        data: { status: ListingStatus.SOLD },
      }),
    ])

    return purchase
  })
}