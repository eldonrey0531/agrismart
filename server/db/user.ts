import { connectToDatabase } from '../db';
import { UserModel } from '../models/user';
import { IUserDocument, IUserInput, IUserUpdate, IUserResponse } from '../models/user.types';

export async function getUser() {
  await connectToDatabase();
  return {
    UserModel,
    connectToDatabase,
  };
}

export async function findUserByEmail(email: string): Promise<IUserDocument | null> {
  await connectToDatabase();
  const user = await UserModel.findOne({ email }).select('+password');
  return user;
}

export async function createUser(userData: IUserInput): Promise<IUserResponse> {
  await connectToDatabase();
  const user = await UserModel.create(userData);
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function updateUser(
  userId: string,
  update: IUserUpdate
): Promise<IUserResponse | null> {
  await connectToDatabase();
  const user = await UserModel.findByIdAndUpdate(userId, update, { new: true });
  
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function deleteUser(userId: string): Promise<boolean> {
  await connectToDatabase();
  const result = await UserModel.findByIdAndDelete(userId);
  return result !== null;
}

export async function validateUserCredentials(
  email: string,
  password: string
): Promise<IUserResponse | null> {
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toUserResponse(user: IUserDocument): IUserResponse {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}