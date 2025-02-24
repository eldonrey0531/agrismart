import { Router } from 'express';
import { ProductController } from '../../controllers/products';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { uploads } from '../../middleware/upload';
import { productSchema } from '../../lib/validation/product.schemas';

const router = Router();

// Public routes
router.get(
  '/',
  validate(productSchema.query),
  ProductController.listProducts
);

router.get(
  '/search',
  validate(productSchema.search),
  ProductController.searchProducts
);

router.get(
  '/categories',
  ProductController.listCategories
);

router.get(
  '/:id',
  validate(productSchema.id),
  ProductController.getProduct
);

router.get(
  '/:id/reviews',
  validate(productSchema.reviewQuery),
  ProductController.listReviews
);

// Protected routes
router.use(authenticate);

// Review routes (authenticated users)
router.post(
  '/:id/reviews',
  validate(productSchema.createReview),
  ProductController.addReview
);

// Seller routes
router.post(
  '/',
  requireRole(['SELLER']),
  uploads.productImages,
  validate(productSchema.create),
  ProductController.createProduct
);

router.put(
  '/:id',
  requireRole(['SELLER']),
  uploads.productImages,
  validate(productSchema.update),
  ProductController.updateProduct
);

router.delete(
  '/:id',
  requireRole(['SELLER']),
  validate(productSchema.id),
  ProductController.deleteProduct
);

// Admin routes
router.patch(
  '/:id/status',
  requireRole(['ADMIN']),
  validate(productSchema.updateStatus),
  ProductController.updateProductStatus
);

router.post(
  '/categories',
  requireRole(['ADMIN']),
  validate(productSchema.createCategory),
  ProductController.createCategory
);

router.put(
  '/categories/:id',
  requireRole(['ADMIN']),
  validate(productSchema.updateCategory),
  ProductController.updateCategory
);

// Statistics routes
router.get(
  '/stats/overview',
  requireRole(['ADMIN', 'SELLER']),
  ProductController.getProductStats
);

router.get(
  '/stats/seller',
  requireRole(['SELLER']),
  ProductController.getSellerStats
);

// Bulk operations
router.post(
  '/bulk/create',
  requireRole(['SELLER']),
  validate(productSchema.bulkCreate),
  ProductController.bulkCreateProducts
);

router.put(
  '/bulk/update',
  requireRole(['SELLER']),
  validate(productSchema.bulkUpdate),
  ProductController.bulkUpdateProducts
);

router.post(
  '/bulk/delete',
  requireRole(['SELLER']),
  validate(productSchema.bulkDelete),
  ProductController.bulkDeleteProducts
);

// Export management
router.get(
  '/export',
  requireRole(['ADMIN', 'SELLER']),
  validate(productSchema.export),
  ProductController.exportProducts
);

// Import management
router.post(
  '/import',
  requireRole(['ADMIN', 'SELLER']),
  uploads.documents,
  validate(productSchema.import),
  ProductController.importProducts
);

export default router;