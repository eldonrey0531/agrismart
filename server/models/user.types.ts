import { Document, Types } from 'mongoose';

export interface IUserDocument extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserInput {
  email: string;
  password: string;
  name?: string | null;
}

export interface IUserResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserUpdate {
  name?: string | null;
  email?: string;
}