import { Schema, model, Document, Model } from "mongoose";
import { Order as IOrder, OrderStatus, OrderItem } from "./types/marketplace";

// Interface for Order Document (instance methods)
export interface OrderDocument extends Omit<IOrder, 'id'>, Document {
  calculateTotal(): number;
  canBeUpdatedBy(userId: string): boolean;
  updateStatus(status: OrderStatus): Promise<void>;
}

// Interface for Order Model (static methods)
export interface OrderModel extends Model<OrderDocument> {
  findByBuyer(buyerId: string): Promise<OrderDocument[]>;
  findBySeller(sellerId: string): Promise<OrderDocument[]>;
}

// Order Schema
const orderSchema = new Schema<OrderDocument, OrderModel>({
  buyer: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      amount: {
        type: Number,
        required: true,
        min: [0, "Price cannot be negative"],
      },
      currency: {
        type: String,
        required: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3,
      },
    },
  }],
  status: {
    type: String,
    enum: {
      values: ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"] as OrderStatus[],
      message: "Invalid order status",
    },
    default: "pending",
  },
  totalAmount: {
    amount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
  },
  shippingAddress: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: String,
    country: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

// Indexes
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "paymentStatus": 1 });

// Instance method to calculate total
orderSchema.methods.calculateTotal = function(): number {
  return this.items.reduce((total: number, item: OrderItem) => {
    return total + (item.price.amount * item.quantity);
  }, 0);
};

// Instance method to check update permissions
orderSchema.methods.canBeUpdatedBy = function(userId: string): boolean {
  return this.buyer.toString() === userId || 
         this.seller.toString() === userId;
};

// Instance method to update status
orderSchema.methods.updateStatus = async function(
  status: OrderStatus
): Promise<void> {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered", "cancelled"],
    delivered: ["refunded"],
    cancelled: [],
    refunded: [],
  };

  const currentStatus = this.status as OrderStatus;
  if (!validTransitions[currentStatus].includes(status)) {
    throw new Error(`Cannot transition from ${this.status} to ${status}`);
  }

  this.status = status;
  await this.save();
};

// Static method to find by buyer
orderSchema.statics.findByBuyer = async function(
  buyerId: string
): Promise<OrderDocument[]> {
  return this.find({ buyer: buyerId })
    .sort({ createdAt: -1 })
    .populate("items.product");
};

// Static method to find by seller
orderSchema.statics.findBySeller = async function(
  sellerId: string
): Promise<OrderDocument[]> {
  return this.find({ seller: sellerId })
    .sort({ createdAt: -1 })
    .populate("items.product");
};

// Pre-save middleware to validate and set total amount
orderSchema.pre("save", async function(next) {
  if (this.isModified("items")) {
    const total = this.calculateTotal();
    this.totalAmount.amount = total;
    
    // Ensure all items use the same currency
    const currencies = new Set(this.items.map(item => item.price.currency));
    if (currencies.size > 1) {
      throw new Error("All items must use the same currency");
    }
    this.totalAmount.currency = this.items[0].price.currency;
  }
  next();
});

export const Order = model<OrderDocument, OrderModel>("Order", orderSchema);
export type { IOrder };
export default Order;