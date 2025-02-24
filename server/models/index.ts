import { User } from './user'
import type { IUser } from './user'

import { Listing, Category, Purchase, WishlistItem } from './marketplace'
import type { IListing, ICategory, IPurchase, IWishlistItem } from './marketplace'

import { ChatRoom, ChatParticipant, ChatMessage } from './chat'
import type { IChatRoom, IChatParticipant, IChatMessage } from './chat'

// Re-export all models and their types
export { User, Listing, Category, Purchase, WishlistItem, ChatRoom, ChatParticipant, ChatMessage }
export type { 
  IUser, 
  IListing, 
  ICategory, 
  IPurchase, 
  IWishlistItem,
  IChatRoom,
  IChatParticipant,
  IChatMessage
}

// Export types for external use
export type Models = {
  User: typeof User
  Listing: typeof Listing
  Category: typeof Category
  Purchase: typeof Purchase
  WishlistItem: typeof WishlistItem
  ChatRoom: typeof ChatRoom
  ChatParticipant: typeof ChatParticipant
  ChatMessage: typeof ChatMessage
}

// Export interfaces for external use
export type ModelInterfaces = {
  User: IUser
  Listing: IListing
  Category: ICategory
  Purchase: IPurchase
  WishlistItem: IWishlistItem
  ChatRoom: IChatRoom
  ChatParticipant: IChatParticipant
  ChatMessage: IChatMessage
}

// Initialize all models
export const models: Models = {
  User,
  Listing,
  Category,
  Purchase,
  WishlistItem,
  ChatRoom,
  ChatParticipant,
  ChatMessage
}

// Export a function to get model by name
export function getModel<K extends keyof Models>(name: K): Models[K] {
  return models[name]
}

// Export a type-safe function to get an interface by model name
export function getModelInterface<K extends keyof ModelInterfaces>(name: K): ModelInterfaces[K] {
  throw new Error('This is a type helper function and should not be called at runtime')
}

// Export utility types
export type ModelName = keyof Models
export type ModelDocument<T extends ModelName> = InstanceType<Models[T]>