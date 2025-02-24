import { Types } from 'mongoose';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { AppError, NotFoundError, BadRequestError } from '../utils/app-error';

export class MarketplaceService {
  /**
   * Create a new product listing
   */
  async createProduct(data: {
    title: string;
    description: string;
    price: number;
    category: string;
    seller: Types.ObjectId;
    location: {
      type: 'Point';
      coordinates: [number, number];
      address: string;
    };
    images: string[];
  }) {
    return await Product.create({
      ...data,
      status: 'active',
    });
  }

  /**
   * Get product by ID
   */
  async getProduct(id: string) {
    const product = await Product.findById(id).populate('seller', 'name email');
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  /**
   * Search products with filters
   */
  async searchProducts(params: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: [number, number];
    maxDistance?: number; // in kilometers
    sortBy?: 'price' | 'date' | 'distance';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      location,
      maxDistance = 50, // Default 50km
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = params;

    // Build query
    const filter: any = { status: 'active' };

    // Text search
    if (query) {
      filter.$text = { $search: query };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    // Location-based search
    if (location) {
      filter['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: location,
          },
          $maxDistance: maxDistance * 1000, // Convert to meters
        },
      };
    }

    // Build sort options
    const sort: any = {};
    switch (sortBy) {
      case 'price':
        sort.price = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'distance':
        // MongoDB handles distance sorting automatically with $near
        break;
      default: // date
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('seller', 'name email'),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Update product
   */
  async updateProduct(id: string, sellerId: Types.ObjectId, data: Partial<{
    title: string;
    description: string;
    price: number;
    category: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
      address: string;
    };
    images: string[];
    status: 'active' | 'inactive' | 'sold';
  }>) {
    const product = await Product.findOne({ _id: id, seller: sellerId });
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    Object.assign(product, data);
    await product.save();
    return product;
  }

  /**
   * Create order
   */
  async createOrder(data: {
    buyer: Types.ObjectId;
    product: string;
    quantity: number;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
  }) {
    const product = await Product.findById(data.product);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.status !== 'active') {
      throw new BadRequestError('Product is not available for purchase');
    }

    // Create order
    const order = await Order.create({
      ...data,
      totalPrice: product.price * data.quantity,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Update product status
    product.status = 'sold';
    await product.save();

    return order;
  }

  /**
   * Get order details
   */
  async getOrder(id: string, userId: Types.ObjectId) {
    const order = await Order.findOne({
      _id: id,
      $or: [
        { buyer: userId },
        { 'product.seller': userId },
      ],
    }).populate('product buyer');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return order;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string,
    sellerId: Types.ObjectId,
    status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  ) {
    const order = await Order.findOne({
      _id: id,
      'product.seller': sellerId,
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (status === 'cancelled' && ['shipped', 'delivered'].includes(order.status)) {
      throw new BadRequestError('Cannot cancel order in current status');
    }

    order.status = status;
    await order.save();
    return order;
  }
}

export default new MarketplaceService();