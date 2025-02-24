import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'
import { isEmail } from '@/lib/utils/validation'

// Constants
const SALT_ROUNDS = 12
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const PHONE_PATTERN = /^\+[1-9]\d{1,14}$/ // International format: +{country}{number}

export interface IUser extends Document {
  name: string
  email: string
  password?: string
  mobileNumber: string
  profilePicture?: {
    fileId: string
    url: string
    thumbnailUrl?: string
  }
  role: 'ADMIN' | 'USER' | 'SELLER'
  accountLevel: 'BASIC' | 'SELLER' | 'PREMIUM'
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
  emailVerified: boolean
  emailVerificationToken?: string
  emailVerificationExpires?: Date
  twoFactorEnabled: boolean
  twoFactorSecret?: string
  twoFactorBackupCodes?: string[]
  lastLogin?: Date
  loginAttempts: number
  lockUntil?: Date
  settings: {
    notifications: boolean
    marketing: boolean
    theme: 'light' | 'dark' | 'system'
    language: string
  }
  metadata: {
    registrationIp?: string
    lastLoginIp?: string
    userAgent?: string
  }
  createdAt: Date
  updatedAt: Date

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>
  isLocked(): boolean
  incrementLoginAttempts(): Promise<void>
}

const userSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: isEmail,
      message: 'Invalid email format'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // Don't return password by default
    validate: {
      validator: (value: string) => PASSWORD_PATTERN.test(value),
      message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'
    }
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: (value: string) => PHONE_PATTERN.test(value),
      message: 'Invalid phone number format. Use international format: +{country}{number}'
    }
  },
  profilePicture: {
    fileId: String,
    url: String,
    thumbnailUrl: String
  },
  role: {
    type: String,
    enum: ['ADMIN', 'USER', 'SELLER'],
    default: 'USER'
  },
  accountLevel: {
    type: String,
    enum: ['BASIC', 'SELLER', 'PREMIUM'],
    default: 'BASIC'
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'],
    default: 'PENDING'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  twoFactorBackupCodes: [{
    type: String,
    select: false
  }],
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  settings: {
    notifications: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
    theme: { 
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    language: { type: String, default: 'en' }
  },
  metadata: {
    registrationIp: String,
    lastLoginIp: String,
    userAgent: String
  }
}, {
  timestamps: true
})

// Indexes
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ mobileNumber: 1 }, { unique: true })
userSchema.index({ status: 1 })
userSchema.index({ 'metadata.registrationIp': 1 })
userSchema.index({ lockUntil: 1 }, { sparse: true })
userSchema.index({ emailVerificationToken: 1 }, { sparse: true })

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()

  try {
    this.password = await bcrypt.hash(this.password!, SALT_ROUNDS)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Methods
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password!)
  } catch (error) {
    return false
  }
}

userSchema.methods.isLocked = function(): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date())
}

userSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  // If previous lock has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    })
  }

  // Otherwise increment
  const updates: any = { $inc: { loginAttempts: 1 } }

  // Lock the account if we've reached max attempts
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = {
      lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hour lock
    }
  }

  return this.updateOne(updates)
}

// Create and export model
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

// Export type
export type { IUser as MongoUser }