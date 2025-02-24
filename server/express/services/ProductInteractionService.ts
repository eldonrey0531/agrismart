import { ProductInteraction, ProductInteractionDocument } from '../models/ProductInteraction';
import mongoose from 'mongoose';

export class ProductInteractionService {
  static async toggleInteraction(
    userId: string,
    productId: string,
    type: 'like' | 'bookmark'
  ): Promise<{ success: boolean; action: 'added' | 'removed' }> {
    const existingInteraction = await ProductInteraction.findOne({
      user: userId,
      product: productId,
      type,
    });

    if (existingInteraction) {
      await existingInteraction.deleteOne();
      return { success: true, action: 'removed' };
    }

    await ProductInteraction.create({
      user: userId,
      product: productId,
      type,
    });

    return { success: true, action: 'added' };
  }

  static async getProductStats(productId: string): Promise<{
    likes: number;
    bookmarks: number;
  }> {
    const [likes, bookmarks] = await Promise.all([
      ProductInteraction.countDocuments({ product: productId, type: 'like' }),
      ProductInteraction.countDocuments({ product: productId, type: 'bookmark' }),
    ]);

    return { likes, bookmarks };
  }

  static async getUserInteractions(userId: string, productIds: string[]): Promise<{
    likes: string[];
    bookmarks: string[];
  }> {
    const interactions = await ProductInteraction.find({
      user: userId,
      product: { $in: productIds },
    });

    return {
      likes: interactions
        .filter(i => i.type === 'like')
        .map(i => i.product.toString()),
      bookmarks: interactions
        .filter(i => i.type === 'bookmark')
        .map(i => i.product.toString()),
    };
  }

  static async getPopularProducts(limit = 10): Promise<Array<{
    productId: string;
    likes: number;
    bookmarks: number;
  }>> {
    const aggregation = await ProductInteraction.aggregate([
      {
        $group: {
          _id: '$product',
          likes: {
            $sum: { $cond: [{ $eq: ['$type', 'like'] }, 1, 0] },
          },
          bookmarks: {
            $sum: { $cond: [{ $eq: ['$type', 'bookmark'] }, 1, 0] },
          },
        },
      },
      {
        $sort: { likes: -1, bookmarks: -1 },
      },
      {
        $limit: limit,
      },
    ]);

    return aggregation.map(item => ({
      productId: item._id.toString(),
      likes: item.likes,
      bookmarks: item.bookmarks,
    }));
  }

  static async getUserLikedProducts(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{
    products: string[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [interactions, total] = await Promise.all([
      ProductInteraction.find({ user: userId, type: 'like' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('product'),
      ProductInteraction.countDocuments({ user: userId, type: 'like' }),
    ]);

    return {
      products: interactions.map(i => i.product.toString()),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  static async getUserBookmarks(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{
    products: string[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [interactions, total] = await Promise.all([
      ProductInteraction.find({ user: userId, type: 'bookmark' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('product'),
      ProductInteraction.countDocuments({ user: userId, type: 'bookmark' }),
    ]);

    return {
      products: interactions.map(i => i.product.toString()),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  static async removeAllUserInteractions(userId: string): Promise<number> {
    const result = await ProductInteraction.deleteMany({ user: userId });
    return result.deletedCount || 0;
  }

  static async removeAllProductInteractions(productId: string): Promise<number> {
    const result = await ProductInteraction.deleteMany({ product: productId });
    return result.deletedCount || 0;
  }
}

export default ProductInteractionService;