import { models } from '@/server/models'
import type { IUser, IListing, ICategory, IPurchase, IChatRoom, IChatMessage } from '@/server/models'
import { handleDBOperation, paginateQuery, toObjectId, cleanQuery, PaginationParams } from './utils'
import mongoose from 'mongoose'

export class DatabaseService {
  // User Operations
  static async createUser(data: Partial<IUser>): Promise<IUser> {
    return handleDBOperation(async () => {
      const user = new models.User(data)
      return user.save()
    })
  }

  static async findUserById(id: string): Promise<IUser | null> {
    return handleDBOperation(async () => {
      return models.User.findById(toObjectId(id))
    })
  }

  static async findUserByEmail(email: string): Promise<IUser | null> {
    return handleDBOperation(async () => {
      return models.User.findOne({ email })
    })
  }

  static async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return handleDBOperation(async () => {
      return models.User.findByIdAndUpdate(
        toObjectId(id),
        { $set: cleanQuery(data) },
        { new: true }
      )
    })
  }

  // Marketplace Operations
  static async createListing(data: Partial<IListing>): Promise<IListing> {
    return handleDBOperation(async () => {
      const listing = new models.Listing(data)
      return listing.save()
    })
  }

  static async findListings(params: PaginationParams & {
    query?: string
    categoryId?: string
    sellerId?: string
    minPrice?: number
    maxPrice?: number
    status?: string
  }) {
    return handleDBOperation(async () => {
      const { query, categoryId, sellerId, minPrice, maxPrice, status, ...paginationParams } = params
      
      const filter: any = {}
      if (query) {
        filter.$text = { $search: query }
      }
      if (categoryId) {
        filter.categoryId = toObjectId(categoryId)
      }
      if (sellerId) {
        filter.sellerId = toObjectId(sellerId)
      }
      if (minPrice || maxPrice) {
        filter.price = {}
        if (minPrice) filter.price.$gte = minPrice
        if (maxPrice) filter.price.$lte = maxPrice
      }
      if (status) {
        filter.status = status
      }

      const listingQuery = models.Listing.find(filter)
        .populate('seller', 'name image isVerifiedSeller')
        .populate('category')

      return paginateQuery(listingQuery, paginationParams)
    })
  }

  // Chat Operations
  static async createChatRoom(participantIds: string[]): Promise<IChatRoom> {
    return handleDBOperation(async () => {
      const session = await mongoose.startSession()
      try {
        let result
        await session.withTransaction(async () => {
          // Create chat room
          const chatRoom = await models.ChatRoom.create([{}], { session })
          
          // Add participants
          await models.ChatParticipant.insertMany(
            participantIds.map(userId => ({
              userId: toObjectId(userId),
              chatRoomId: chatRoom[0]._id
            })),
            { session }
          )

          result = chatRoom[0]
        })
        return result!
      } finally {
        session.endSession()
      }
    })
  }

  static async sendMessage(data: {
    chatRoomId: string
    senderId: string
    content: string
    attachments?: string[]
  }): Promise<IChatMessage> {
    return handleDBOperation(async () => {
      const message = new models.ChatMessage({
        chatRoomId: toObjectId(data.chatRoomId),
        senderId: toObjectId(data.senderId),
        content: data.content,
        attachments: data.attachments || []
      })
      return message.save()
    })
  }

  static async getChatMessages(chatRoomId: string, params: PaginationParams) {
    return handleDBOperation(async () => {
      const query = models.ChatMessage.find({ chatRoomId: toObjectId(chatRoomId) })
        .populate('sender', 'name image')
        .sort({ createdAt: -1 })

      return paginateQuery(query, params)
    })
  }

  // Category Operations
  static async getCategories(): Promise<ICategory[]> {
    return handleDBOperation(async () => {
      return models.Category.find({ parentId: null }).populate('children')
    })
  }

  // Purchase Operations
  static async createPurchase(data: {
    buyerId: string
    listingId: string
    amount: number
  }): Promise<IPurchase> {
    return handleDBOperation(async () => {
      const session = await mongoose.startSession()
      try {
        let result
        await session.withTransaction(async () => {
          // Create purchase
          const purchase = await models.Purchase.create([{
            buyerId: toObjectId(data.buyerId),
            listingId: toObjectId(data.listingId),
            amount: data.amount
          }], { session })

          // Update listing status
          await models.Listing.findByIdAndUpdate(
            data.listingId,
            { status: 'SOLD' },
            { session }
          )

          result = purchase[0]
        })
        return result!
      } finally {
        session.endSession()
      }
    })
  }
}