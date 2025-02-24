import { Types } from 'mongoose';

export interface BaseDocument {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface Location {
  type: 'Point';
  coordinates: [number, number];
  address: string;
}

export interface TestUser extends BaseDocument {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user' | 'seller';
  status: 'active' | 'inactive' | 'suspended';
  verified?: boolean;
  avatar?: string;
}

export interface TestProduct extends BaseDocument {
  title: string;
  description: string;
  price: number;
  category: string;
  seller: Types.ObjectId;
  status: 'active' | 'inactive' | 'deleted';
  location: Location;
  images: string[];
}

export interface TestOrder extends BaseDocument {
  buyer: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  shippingAddress: ShippingAddress;
}

export interface CreateUserInput extends Partial<Omit<TestUser, keyof BaseDocument>> {
  email?: string;
  password?: string;
  name?: string;
  role?: 'admin' | 'user' | 'seller';
  status?: 'active' | 'inactive' | 'suspended';
  verified?: boolean;
}

export interface CreateProductInput extends Partial<Omit<TestProduct, keyof BaseDocument>> {
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  seller?: Types.ObjectId;
  status?: 'active' | 'inactive' | 'deleted';
  location?: Location;
  images?: string[];
}

export interface CreateOrderInput extends Partial<Omit<TestOrder, keyof BaseDocument>> {
  buyer?: Types.ObjectId;
  product?: Types.ObjectId;
  quantity?: number;
  totalPrice?: number;
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed';
  shippingAddress?: ShippingAddress;
}

export interface TestCollection<T> {
  documents: T[];
  cleanup: () => Promise<void>;
}

// Helper type for document conversion
export type DocumentToTest<T extends BaseDocument> = Omit<T, keyof BaseDocument> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

// Type guard functions
export function isTestUser(value: any): value is TestUser {
  return value && 
    typeof value === 'object' && 
    '_id' in value &&
    'email' in value &&
    'role' in value;
}

export function isTestProduct(value: any): value is TestProduct {
  return value && 
    typeof value === 'object' && 
    '_id' in value &&
    'title' in value &&
    'price' in value;
}

export function isTestOrder(value: any): value is TestOrder {
  return value && 
    typeof value === 'object' && 
    '_id' in value &&
    'buyer' in value &&
    'product' in value;
}

export function isObjectId(value: any): value is Types.ObjectId {
  return value instanceof Types.ObjectId;
}