import { Request, Response } from 'express';
import { ProductService } from '../../services/product.service';
import { ResponseHandler } from '../../utils/response-handler';
import { throwHttpError } from '../../lib/errors';
import { FileWithUrl } from '../../types/express-extension';

export class ProductController {
  static async listProducts(req: Request, res: Response) {
    try {
      const products = await ProductService.listProducts(req.query);
      ResponseHandler.success(res, products);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async searchProducts(req: Request, res: Response) {
    try {
      const products = await ProductService.searchProducts(req.query);
      ResponseHandler.success(res, products);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async listCategories(req: Request, res: Response) {
    try {
      const categories = await ProductService.listCategories();
      ResponseHandler.success(res, categories);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async getProduct(req: Request, res: Response) {
    try {
      const product = await ProductService.getProduct(req.params.id);
      ResponseHandler.success(res, product);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async listReviews(req: Request, res: Response) {
    try {
      const reviews = await ProductService.listReviews(req.params.id, req.query);
      ResponseHandler.success(res, reviews);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async addReview(req: Request, res: Response) {
    try {
      const review = await ProductService.addReview(
        req.params.id,
        req.user!.id,
        req.body
      );
      ResponseHandler.created(res, review);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async createProduct(req: Request, res: Response) {
    try {
      const files = req.files as FileWithUrl[];
      if (!files || files.length === 0) {
        throwHttpError.badRequest('Product images are required');
      }

      const imageUrls = files.map(file => file.url!);
      const product = await ProductService.createProduct({
        ...req.body,
        sellerId: req.user!.id,
        images: imageUrls
      });

      ResponseHandler.created(res, product);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async updateProduct(req: Request, res: Response) {
    try {
      const files = req.files as FileWithUrl[];
      const imageUrls = files?.map(file => file.url!) || [];

      const product = await ProductService.updateProduct(
        req.params.id,
        req.user!.id,
        {
          ...req.body,
          ...(imageUrls.length > 0 && { images: imageUrls })
        }
      );

      ResponseHandler.success(res, product);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    try {
      await ProductService.deleteProduct(req.params.id, req.user!.id);
      ResponseHandler.success(res, null, 'Product deleted successfully');
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async updateProductStatus(req: Request, res: Response) {
    try {
      const product = await ProductService.updateProductStatus(
        req.params.id,
        req.body.status
      );
      ResponseHandler.success(res, product);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async createCategory(req: Request, res: Response) {
    try {
      const category = await ProductService.createCategory(req.body);
      ResponseHandler.created(res, category);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const category = await ProductService.updateCategory(
        req.params.id,
        req.body
      );
      ResponseHandler.success(res, category);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async getProductStats(req: Request, res: Response) {
    try {
      const stats = await ProductService.getProductStats(req.user!.id);
      ResponseHandler.success(res, stats);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async getSellerStats(req: Request, res: Response) {
    try {
      const stats = await ProductService.getSellerStats(req.user!.id);
      ResponseHandler.success(res, stats);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async bulkCreateProducts(req: Request, res: Response) {
    try {
      const products = await ProductService.bulkCreateProducts(
        req.user!.id,
        req.body.products
      );
      ResponseHandler.created(res, products);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async bulkUpdateProducts(req: Request, res: Response) {
    try {
      const products = await ProductService.bulkUpdateProducts(
        req.user!.id,
        req.body.products
      );
      ResponseHandler.success(res, products);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async bulkDeleteProducts(req: Request, res: Response) {
    try {
      await ProductService.bulkDeleteProducts(
        req.user!.id,
        req.body.productIds
      );
      ResponseHandler.success(res, null, 'Products deleted successfully');
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async exportProducts(req: Request, res: Response) {
    try {
      const data = await ProductService.exportProducts(req.user!.id, req.query);
      ResponseHandler.file(res, data, 'products.csv', 'text/csv');
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }

  static async importProducts(req: Request, res: Response) {
    try {
      const file = req.file;
      if (!file) {
        throwHttpError.badRequest('Import file is required');
      }

      const result = await ProductService.importProducts(req.user!.id, file);
      ResponseHandler.success(res, result);
    } catch (error) {
      ResponseHandler.serverError(res, error as Error);
    }
  }
}