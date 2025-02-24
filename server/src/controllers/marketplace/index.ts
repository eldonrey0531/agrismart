import { Request } from 'express';
import { MarketplaceService } from '../../services/marketplace.service';
import { ResponseHandler } from '../../utils/response-handler';
import { throwError } from '../../lib/errors';
import { 
  ProductWithSeller,
  CategoryResponse,
  TrendingProducts,
  CategoryStats,
  MarketplaceStats
} from '../../types/marketplace';
import { 
  TypedRequest, 
  TypedResponse,
  RequestWithAuth
} from '../../types/express-extension';

interface SearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class MarketplaceController {
  static async getFeaturedProducts(_req: Request, res: TypedResponse<ProductWithSeller[]>) {
    try {
      const products = await MarketplaceService.getFeaturedProducts();
      ResponseHandler.success(res, products);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getCategories(_req: Request, res: TypedResponse<CategoryResponse>) {
    try {
      const categories = await MarketplaceService.getCategories();
      ResponseHandler.success(res, categories);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getSubcategories(req: TypedRequest<any, any, { id: string }>, res: TypedResponse) {
    try {
      const { id } = req.params;
      const subcategories = await MarketplaceService.getSubcategories(id);
      ResponseHandler.success(res, subcategories);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getTrendingProducts(_req: Request, res: TypedResponse<TrendingProducts>) {
    try {
      const products = await MarketplaceService.getTrendingProducts();
      ResponseHandler.success(res, products);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async search(req: TypedRequest<any, SearchParams>, res: TypedResponse) {
    try {
      const results = await MarketplaceService.search(req.query);
      ResponseHandler.success(res, results);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getAvailableFilters(req: Request, res: TypedResponse) {
    try {
      const { category } = req.query;
      const filters = await MarketplaceService.getAvailableFilters(category as string);
      ResponseHandler.success(res, filters);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getCategoryProducts(
    req: TypedRequest<any, any, { id: string }>,
    res: TypedResponse<ProductWithSeller[]>
  ) {
    try {
      const { id } = req.params;
      const products = await MarketplaceService.getCategoryProducts(id, req.query);
      ResponseHandler.success(res, products);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getSellerDashboard(req: RequestWithAuth, res: TypedResponse<MarketplaceStats>) {
    try {
      const stats = await MarketplaceService.getSellerDashboard(req.user.id);
      ResponseHandler.success(res, stats);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getSellerOrders(req: RequestWithAuth, res: TypedResponse) {
    try {
      const orders = await MarketplaceService.getSellerOrders(req.user.id, req.query);
      ResponseHandler.success(res, orders);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getSellerReviews(
    req: TypedRequest<any, any, { id: string }>,
    res: TypedResponse
  ) {
    try {
      const { id } = req.params;
      const reviews = await MarketplaceService.getSellerReviews(id, req.query);
      ResponseHandler.success(res, reviews);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async createSellerReview(
    req: RequestWithAuth & TypedRequest<{ rating: number; comment: string }, any, { id: string }>,
    res: TypedResponse
  ) {
    try {
      const { id } = req.params;
      const review = await MarketplaceService.createSellerReview(
        id,
        req.user.id,
        req.body
      );
      ResponseHandler.created(res, review);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getTrendingCategories(_req: Request, res: TypedResponse<CategoryStats[]>) {
    try {
      const categories = await MarketplaceService.getTrendingCategories();
      ResponseHandler.success(res, categories);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async getPriceTrends(
    req: TypedRequest<any, { category: string; period: string }>,
    res: TypedResponse
  ) {
    try {
      const trends = await MarketplaceService.getPriceTrends(req.query);
      ResponseHandler.success(res, trends);
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async followSeller(
    req: RequestWithAuth & TypedRequest<any, any, { id: string }>,
    res: TypedResponse
  ) {
    try {
      const { id } = req.params;
      await MarketplaceService.followSeller(req.user.id, id);
      ResponseHandler.success(res, null, 'Seller followed successfully');
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }

  static async unfollowSeller(
    req: RequestWithAuth & TypedRequest<any, any, { id: string }>,
    res: TypedResponse
  ) {
    try {
      const { id } = req.params;
      await MarketplaceService.unfollowSeller(req.user.id, id);
      ResponseHandler.success(res, null, 'Seller unfollowed successfully');
    } catch (error) {
      ResponseHandler.error(res, error as Error);
    }
  }
}
