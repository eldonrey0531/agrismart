import { Listing, Category, Purchase, WishlistItem, ListingStatus, PurchaseStatus } from '@prisma/client'

export type ListingCreate = {
  title: string
  description: string
  price: number
  images: File[]
  categoryId: string
  location?: string
}

export type ListingUpdate = Partial<ListingCreate> & {
  id: string
  status?: ListingStatus
}

export type ListingWithDetails = Listing & {
  seller: {
    id: string
    name: string | null
    image: string | null
    isVerifiedSeller: boolean
  }
  category: Category
  _count: {
    wishlistItems: number
  }
}

export type ListingSearchParams = {
  query?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  status?: ListingStatus
  sellerId?: string
  page?: number
  limit?: number
  sortBy?: 'price_asc' | 'price_desc' | 'created_desc' | 'relevance'
}

export type ListingSearchResult = {
  items: ListingWithDetails[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export type CategoryWithChildren = Category & {
  children: Category[]
  _count: {
    listings: number
  }
}

export type PurchaseCreate = {
  listingId: string
}

export type PurchaseWithDetails = Purchase & {
  listing: ListingWithDetails
  buyer: {
    id: string
    name: string | null
    image: string | null
  }
}

export type WishlistItemWithListing = WishlistItem & {
  listing: ListingWithDetails
}

export type SellerDashboardStats = {
  totalListings: number
  activeSales: number
  completedSales: number
  totalEarnings: number
  recentPurchases: PurchaseWithDetails[]
}