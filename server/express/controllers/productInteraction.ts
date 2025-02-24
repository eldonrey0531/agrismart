import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../middleware';
import { ProductInteractionService } from '../services/ProductInteractionService';
import { validateInput, formSchemas } from '../utils/validation';
import { BadRequestError } from '../utils/app-error';

export const toggleInteraction = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  try {
    const validatedData = await validateInput(formSchemas.interactionToggle, req.body);
    const result = await ProductInteractionService.toggleInteraction(
      req.user!.id,
      validatedData.productId,
      validatedData.type
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    throw new BadRequestError(error instanceof Error ? error.message : 'Invalid request data');
  }
});

export const getProductStats = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const validatedData = await validateInput(formSchemas.productId, req.params);
  const stats = await ProductInteractionService.getProductStats(validatedData.productId);

  return res.status(200).json({
    success: true,
    data: stats,
  });
});

export const getUserInteractions = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const validatedData = await validateInput(formSchemas.productIds, req.query);
  const productIds = Array.isArray(validatedData.productIds) 
    ? validatedData.productIds 
    : [validatedData.productIds];

  const interactions = await ProductInteractionService.getUserInteractions(
    req.user!.id,
    productIds
  );

  return res.status(200).json({
    success: true,
    data: interactions,
  });
});

export const getPopularProducts = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const validatedData = await validateInput(formSchemas.pagination, req.query);
  const popularProducts = await ProductInteractionService.getPopularProducts(
    validatedData.limit || 10
  );

  return res.status(200).json({
    success: true,
    data: popularProducts,
  });
});

export const getUserLikedProducts = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const validatedData = await validateInput(formSchemas.pagination, req.query);
  const likedProducts = await ProductInteractionService.getUserLikedProducts(
    req.user!.id,
    validatedData.page || 1,
    validatedData.limit || 10
  );

  return res.status(200).json({
    success: true,
    data: likedProducts,
  });
});

export const getUserBookmarks = asyncHandler(async (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const validatedData = await validateInput(formSchemas.pagination, req.query);
  const bookmarks = await ProductInteractionService.getUserBookmarks(
    req.user!.id,
    validatedData.page || 1,
    validatedData.limit || 10
  );

  return res.status(200).json({
    success: true,
    data: bookmarks,
  });
});

export default {
  toggleInteraction,
  getProductStats,
  getUserInteractions,
  getPopularProducts,
  getUserLikedProducts,
  getUserBookmarks,
};