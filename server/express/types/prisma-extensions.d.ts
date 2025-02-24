import { Prisma } from '@prisma/client';

declare module '@prisma/client' {
  export interface PrismaClient {
    $extends: {
      result: {
        product: {
          distance?: number;
        };
      };
    };
  }
}

declare global {
  namespace Prisma {
    // Extend Includes
    interface ProductInclude {
      category?: boolean;
      seller?: boolean | {
        select: {
          id?: boolean;
          name?: boolean;
          email?: boolean;
        };
      };
    }

    interface CategoryInclude {
      parent?: boolean;
      children?: boolean;
      products?: boolean;
    }

    interface UserInclude {
      products?: boolean;
      rememberMeTokens?: boolean;
    }

    // Extend Selects
    interface UserSelect {
      id?: boolean;
      name?: boolean;
      email?: boolean;
      role?: boolean;
      status?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      products?: boolean | ProductSelect;
      rememberMeTokens?: boolean;
    }

    interface CategorySelect {
      id?: boolean;
      name?: boolean;
      description?: boolean;
      parentId?: boolean;
      level?: boolean;
      order?: boolean;
      parent?: boolean | CategorySelect;
      children?: boolean | CategorySelect;
      products?: boolean | ProductSelect;
    }

    interface ProductSelect {
      id?: boolean;
      name?: boolean;
      description?: boolean;
      price?: boolean;
      categoryId?: boolean;
      sellerId?: boolean;
      condition?: boolean;
      images?: boolean;
      location?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      category?: boolean | CategorySelect;
      seller?: boolean | UserSelect | {
        select: {
          id?: boolean;
          name?: boolean;
          email?: boolean;
        };
      };
    }

    // Extend WhereInput
    interface ProductWhereInput {
      location?: JsonFilter & {
        near?: {
          latitude: number;
          longitude: number;
          distance?: number;
        };
      };
    }

    // Extend OrderBy
    interface ProductOrderByWithRelationInput {
      distance?: SortOrder;
      _geoDistance?: {
        location: {
          latitude: number;
          longitude: number;
        };
        order: SortOrder;
      };
    }
  }
}

export {};