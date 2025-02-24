import mongoose, { Schema, Document, Model } from 'mongoose'
import type { IUser } from './user'

export interface IListing extends Document {
  title: string
  description: string
  price: number
  images: string[]
  sellerId: mongoose.Types.ObjectId
  categoryId: mongoose.Types.ObjectId
  status: 'DRAFT' | 'ACTIVE' | 'SOLD' | 'SUSPENDED'
  location?: string
  createdAt: Date
  updatedAt: Date
}

export interface ICategory extends Document {
  name: string
  slug: string
  parentId?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface IPurchase extends Document {
  buyerId: mongoose.Types.ObjectId
  listingId: mongoose.Types.ObjectId
  status: 'PENDING' | 'PAID' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED'
  amount: number
  createdAt: Date
  updatedAt: Date
}

export interface IWishlistItem extends Document {
  userId: mongoose.Types.ObjectId
  listingId: mongoose.Types.ObjectId
  createdAt: Date
}

const listingSchema = new Schema<IListing>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [String],
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'ACTIVE', 'SOLD', 'SUSPENDED'],
    default: 'DRAFT'
  },
  location: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
})

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
})

const purchaseSchema = new Schema<IPurchase>({
  buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING'
  },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
})

const wishlistItemSchema = new Schema<IWishlistItem>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: false,
})

// Indexes
listingSchema.index({ sellerId: 1 })
listingSchema.index({ categoryId: 1 })
listingSchema.index({ status: 1 })
listingSchema.index({ title: 'text', description: 'text' })
listingSchema.index({ location: 1 })

categorySchema.index({ slug: 1 }, { unique: true })
categorySchema.index({ parentId: 1 })

purchaseSchema.index({ buyerId: 1 })
purchaseSchema.index({ listingId: 1 })
purchaseSchema.index({ status: 1 })

wishlistItemSchema.index({ userId: 1, listingId: 1 }, { unique: true })

// Handle updating timestamps
listingSchema.pre('save', function() {
  this.updatedAt = new Date()
})

categorySchema.pre('save', function() {
  this.updatedAt = new Date()
})

purchaseSchema.pre('save', function() {
  this.updatedAt = new Date()
})

// Virtual populate helpers
listingSchema.virtual('seller', {
  ref: 'User',
  localField: 'sellerId',
  foreignField: '_id',
  justOne: true
})

listingSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
})

// Create and export models
export const Listing: Model<IListing> = mongoose.models.Listing || mongoose.model<IListing>('Listing', listingSchema)
export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema)
export const Purchase: Model<IPurchase> = mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', purchaseSchema)
export const WishlistItem: Model<IWishlistItem> = mongoose.models.WishlistItem || mongoose.model<IWishlistItem>('WishlistItem', wishlistItemSchema)