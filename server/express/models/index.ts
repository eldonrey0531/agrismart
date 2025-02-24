import { User } from './User';
import { Product } from './Product';
import { Order } from './Order';
import { ProductInteraction } from './ProductInteraction';

// Export all implemented models
export {
  User,
  Product,
  Order,
  ProductInteraction,
};

// Export types
export type { UserDocument } from './User';
export type { ProductDocument } from './Product';
export type { OrderDocument } from './Order';
export type { ProductInteractionDocument } from './ProductInteraction';

// Export default object with all models
export default {
  User,
  Product,
  Order,
  ProductInteraction,
};
