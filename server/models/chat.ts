import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChatRoom extends Document {
  createdAt: Date
  updatedAt: Date
}

export interface IChatParticipant extends Document {
  userId: mongoose.Types.ObjectId
  chatRoomId: mongoose.Types.ObjectId
  joinedAt: Date
  leftAt?: Date
  isBlocked: boolean
}

export interface IChatMessage extends Document {
  content: string
  senderId: mongoose.Types.ObjectId
  chatRoomId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
  readAt?: Date
  attachments: string[]
  isEncrypted: boolean
}

const chatRoomSchema = new Schema<IChatRoom>({
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
})

const chatParticipantSchema = new Schema<IChatParticipant>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  chatRoomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: Date,
  isBlocked: { type: Boolean, default: false }
})

const chatMessageSchema = new Schema<IChatMessage>({
  content: { type: String, required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  chatRoomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  readAt: Date,
  attachments: [String],
  isEncrypted: { type: Boolean, default: true }
}, {
  timestamps: true,
})

// Indexes
chatParticipantSchema.index({ userId: 1, chatRoomId: 1 }, { unique: true })
chatParticipantSchema.index({ chatRoomId: 1 })
chatParticipantSchema.index({ userId: 1 })

chatMessageSchema.index({ chatRoomId: 1, createdAt: -1 })
chatMessageSchema.index({ senderId: 1 })
chatMessageSchema.index({ chatRoomId: 1, readAt: 1 })

// Virtual populate helpers
chatRoomSchema.virtual('participants', {
  ref: 'ChatParticipant',
  localField: '_id',
  foreignField: 'chatRoomId'
})

chatRoomSchema.virtual('messages', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'chatRoomId'
})

chatParticipantSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
})

chatMessageSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
})

// Handle updating timestamps
chatRoomSchema.pre('save', function() {
  this.updatedAt = new Date()
})

chatMessageSchema.pre('save', function() {
  this.updatedAt = new Date()
})

// Create and export models
export const ChatRoom: Model<IChatRoom> = mongoose.models.ChatRoom || mongoose.model<IChatRoom>('ChatRoom', chatRoomSchema)
export const ChatParticipant: Model<IChatParticipant> = mongoose.models.ChatParticipant || mongoose.model<IChatParticipant>('ChatParticipant', chatParticipantSchema)
export const ChatMessage: Model<IChatMessage> = mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema)