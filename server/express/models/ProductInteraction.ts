import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ProductInteractionDocument extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  type: 'like' | 'bookmark';
  createdAt: Date;
  updatedAt: Date;
}

interface ProductInteractionModel extends Model<ProductInteractionDocument> {
  getInteractionsForProduct(productId: string): Promise<ProductInteractionDocument[]>;
  getInteractionsForUser(userId: string): Promise<ProductInteractionDocument[]>;
}

const productInteractionSchema = new Schema<ProductInteractionDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'bookmark'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique interactions per user-product-type combination
productInteractionSchema.index(
  { user: 1, product: 1, type: 1 },
  { unique: true }
);

// Add additional indexes for common queries
productInteractionSchema.index({ user: 1, type: 1 });
productInteractionSchema.index({ product: 1, type: 1 });

// Static methods
productInteractionSchema.statics.getInteractionsForProduct = function(
  productId: string
): Promise<ProductInteractionDocument[]> {
  return this.find({ product: productId }).populate('user', 'name email').exec();
};

productInteractionSchema.statics.getInteractionsForUser = function(
  userId: string
): Promise<ProductInteractionDocument[]> {
  return this.find({ user: userId }).populate('product', 'title price').exec();
};

// Middleware to handle cascading deletes
productInteractionSchema.pre('deleteOne', { document: true, query: false }, function() {
  // Remove all related interactions when a document is removed
  const productId = this._id;
  return mongoose.model('ProductInteraction').deleteMany({
    $or: [{ user: productId }, { product: productId }],
  });
});

export const ProductInteraction = mongoose.model<
  ProductInteractionDocument,
  ProductInteractionModel
>('ProductInteraction', productInteractionSchema);

export default ProductInteraction;