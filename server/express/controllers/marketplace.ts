import type { Request, Response, NextFunction } from 'express-serve-static-core';
import { Types } from 'mongoose';
import { Product } from '../models/Product';
import { FileStorageService } from '../services/FileStorageService';
import { BadRequestError, NotFoundError, ForbiddenError, ValidationError } from '../utils/app-error';
import { Role } from '../models/types/Role';
import {
  productFilterSchema,
  createProductSchema,
  updateProductSchema,
  type ProductFilter
} from '../validations/product';

// Extend Request to include files from multer
interface RequestWithFiles extends Request {
  files: Express.Multer.File[];
}

export class MarketplaceController {
  /**
   * Search products with validated filters
   */
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = await productFilterSchema.safeParseAsync(req.query);
      if (!validation.success) {
        throw new ValidationError('Invalid search parameters', 
          validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        );
      }

      const filters = validation.data;
      const query: Record<string, any> = { status: "active" };

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = filters.minPrice;
        if (filters.maxPrice) query.price.$lte = filters.maxPrice;
      }

      if (filters.location) {
        query.location = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [filters.location.longitude, filters.location.latitude]
            },
            $maxDistance: filters.location.radius * 1000 // Convert km to meters
          }
        };
      }

      if (filters.query) {
        query.$text = { $search: filters.query };
      }

      const skip = (filters.page - 1) * filters.limit;

      const [products, total] = await Promise.all([
        Product.find(query)
          .skip(skip)
          .limit(filters.limit)
          .sort(filters.sortBy ? { [filters.sortBy]: filters.sortOrder === 'desc' ? -1 : 1 } : undefined)
          .populate('seller', 'name email'),
        Product.countDocuments(query)
      ]);

      res.json({
        data: products,
        meta: {
          page: filters.page,
          limit: filters.limit,
          total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID with validation
   */
  static async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!Types.ObjectId.isValid(req.params.id)) {
        throw new BadRequestError('Invalid product ID');
      }

      const product = await Product.findById(req.params.id)
        .populate('seller', 'name email');

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create product with validation
   */
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = await createProductSchema.safeParseAsync(req.body);
      if (!validation.success) {
        throw new ValidationError('Invalid product data',
          validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        );
      }

      const product = await Product.create({
        ...validation.data,
        seller: req.user!.id,
        status: 'active'
      });

      await product.populate('seller', 'name email');
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update product with validation
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!Types.ObjectId.isValid(req.params.id)) {
        throw new BadRequestError('Invalid product ID');
      }

      const validation = await updateProductSchema.safeParseAsync(req.body);
      if (!validation.success) {
        throw new ValidationError('Invalid product data',
          validation.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        );
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: validation.data },
        { new: true }
      ).populate('seller', 'name email');

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete product with cleanup
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      if (!Types.ObjectId.isValid(req.params.id)) {
        throw new BadRequestError('Invalid product ID');
      }

      const product = await Product.findById(req.params.id);
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      // Delete associated images
      if (product.images?.length) {
        await Promise.all(
          product.images.map((imageId: string) => FileStorageService.deleteFile(imageId))
        );
      }

      await product.deleteOne();
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload and attach images to product
   */
  static async uploadImages(req: Request, res: Response, next: NextFunction) {
    try {
      if (!Types.ObjectId.isValid(req.params.id)) {
        throw new BadRequestError('Invalid product ID');
      }

      const files = req.files as Express.Multer.File[];
      if (!files?.length) {
        throw new BadRequestError('No files uploaded');
      }

      const fileIds = await FileStorageService.uploadImages(
        files,
        req.user!.id,
        'product-image'
      );

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $push: { images: { $each: fileIds } } },
        { new: true }
      );

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      res.json({
        success: true,
        fileIds,
        images: product.images
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete image from product
   */
  static async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, imageId } = req.params;
      
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestError('Invalid product ID');
      }

      const product = await Product.findById(id);
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const imageIndex = product.images.indexOf(imageId);
      if (imageIndex === -1) {
        throw new NotFoundError('Image not found in product');
      }

      product.images.splice(imageIndex, 1);
      await product.save();
      await FileStorageService.deleteFile(imageId);

      res.json({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check product ownership middleware
   */
  static async checkProductOwnership(req: Request, res: Response, next: NextFunction) {
    try {
      if (!Types.ObjectId.isValid(req.params.id)) {
        throw new BadRequestError('Invalid product ID');
      }

      const product = await Product.findById(req.params.id, 'seller');
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      if (product.seller.toString() !== req.user!.id && req.user!.role !== Role.ADMIN) {
        throw new ForbiddenError('You do not have permission to modify this product');
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}