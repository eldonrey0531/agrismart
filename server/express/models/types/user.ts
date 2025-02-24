export type Role = "user" | "seller" | "admin";
export type AccountStatus = "active" | "suspended" | "pending";

export interface VerificationStatus {
  status: "pending" | "approved" | "rejected";
  documentId: string;
  documentType: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface UserBase {
  id: string;
  name: string;
  email: string;
  mobile: string;
  avatar?: string;
  role: Role;
  isEmailVerified: boolean;
  status: AccountStatus;
  statusReason?: string;
  statusUpdatedAt?: Date;
  statusUpdatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
  deletionReason?: string;
  sellerVerification?: VerificationStatus;
  notificationPreferences?: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserUpdateData {
  name?: string;
  mobile?: string;
  avatar?: string;
  role?: Role;
  status?: AccountStatus;
  statusReason?: string;
  notificationPreferences?: Partial<NotificationPreferences>;
}

export interface SellerVerificationRequest {
  documentId: string;
  documentType: string;
}

export interface SellerVerificationResponse {
  adminId: string;
  reason?: string;
}

export type UserQuery = {
  role?: Role;
  status?: AccountStatus;
  isEmailVerified?: boolean;
  'sellerVerification.status'?: VerificationStatus['status'];
  search?: string;
  sortBy?: keyof UserBase;
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};