import { Schema, model, Document, Model } from "mongoose";

export interface ProductDocument extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  seller: Schema.Types.ObjectId;
  status: "active" | "inactive" | "deleted";
  location: {
    coordinates: [number, number];
    address: string;
  };
  images: string[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductModel extends Model<ProductDocument> {
  getSimilarProducts(productId: string): Promise<ProductDocument[]>;
  searchProducts(query: string): Promise<ProductDocument[]>;
}

const productSchema = new Schema<ProductDocument, ProductModel>(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [10, "Description must be at least 10 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      enum: ["electronics", "clothing", "food", "home", "other"],
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "deleted"],
      default: "active",
    },
    location: {
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (coordinates: number[]) =>
            coordinates.length === 2 &&
            coordinates[0] >= -180 &&
            coordinates[0] <= 180 &&
            coordinates[1] >= -90 &&
            coordinates[1] <= 90,
          message: "Invalid coordinates",
        },
      },
      address: {
        type: String,
        required: [true, "Address is required"],
      },
    },
    images: {
      type: [String],
      validate: {
        validator: (images: string[]) => images.length > 0,
        message: "At least one image is required",
      },
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ title: "text", description: "text" });
productSchema.index({ "location.coordinates": "2dsphere" });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ price: 1 });

// Methods
productSchema.statics.getSimilarProducts = async function (
  productId: string
): Promise<ProductDocument[]> {
  const product = await this.findById(productId);
  if (!product) return [];

  return this.find({
    category: product.category,
    _id: { $ne: productId },
    status: "active",
  })
    .limit(5)
    .sort("-likes");
};

productSchema.statics.searchProducts = async function (
  query: string
): Promise<ProductDocument[]> {
  return this.find(
    {
      $text: { $search: query },
      status: "active",
    },
    {
      score: { $meta: "textScore" },
    }
  ).sort({ score: { $meta: "textScore" } });
};

export const Product = model<ProductDocument, ProductModel>(
  "Product",
  productSchema
);

export default Product;