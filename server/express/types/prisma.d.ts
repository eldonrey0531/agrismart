import { Prisma } from '@prisma/client';

declare module '@prisma/client' {
  export interface PrismaClient {
    category: Prisma.CategoryDelegate<
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
    product: Prisma.ProductDelegate<
      Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined
    >;
  }

  export namespace Prisma {
    // Category Delegates
    type CategoryDelegate<R> = {
      findMany: <T extends CategoryFindManyArgs>(
        args?: Subset<T, CategoryFindManyArgs>
      ) => Promise<Category[]>;
      findUnique: <T extends CategoryFindUniqueArgs>(
        args: CategoryFindUniqueArgs
      ) => Promise<Category | null>;
      count: (args?: CategoryCountArgs) => Promise<number>;
    };

    // Product Delegates
    type ProductDelegate<R> = {
      findMany: <T extends ProductFindManyArgs>(
        args?: Subset<T, ProductFindManyArgs>
      ) => Promise<Product[]>;
      findUnique: <T extends ProductFindUniqueArgs>(
        args: ProductFindUniqueArgs
      ) => Promise<Product | null>;
      create: <T extends ProductCreateArgs>(
        args: ProductCreateArgs
      ) => Promise<Product>;
      update: <T extends ProductUpdateArgs>(
        args: ProductUpdateArgs
      ) => Promise<Product>;
      delete: <T extends ProductDeleteArgs>(
        args: ProductDeleteArgs
      ) => Promise<Product>;
      count: (args?: ProductCountArgs) => Promise<number>;
      groupBy: <T extends ProductGroupByArgs>(
        args: ProductGroupByArgs
      ) => Promise<any>;
    };

    // Product Args Types
    interface ProductFindManyArgs {
      where?: ProductWhereInput;
      orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[];
      include?: ProductInclude;
      select?: ProductSelect;
      skip?: number;
      take?: number;
    }

    interface ProductFindUniqueArgs {
      where: ProductWhereUniqueInput;
      include?: ProductInclude;
      select?: ProductSelect;
    }

    interface ProductCreateArgs {
      data: ProductCreateInput;
      include?: ProductInclude;
      select?: ProductSelect;
    }

    interface ProductUpdateArgs {
      where: ProductWhereUniqueInput;
      data: ProductUpdateInput;
      include?: ProductInclude;
      select?: ProductSelect;
    }

    interface ProductDeleteArgs {
      where: ProductWhereUniqueInput;
    }

    interface ProductCountArgs {
      where?: ProductWhereInput;
    }

    interface ProductGroupByArgs {
      by: string[];
      where?: ProductWhereInput;
      orderBy?: ProductOrderByWithRelationInput[];
      having?: ProductScalarWhereWithAggregatesInput;
      take?: number;
      skip?: number;
    }

    // Product Input Types
    interface ProductWhereInput {
      AND?: ProductWhereInput | ProductWhereInput[];
      OR?: ProductWhereInput[];
      NOT?: ProductWhereInput | ProductWhereInput[];
      id?: string | StringFilter;
      name?: string | StringFilter;
      description?: string | StringFilter;
      price?: number | NumberFilter;
      categoryId?: string | StringFilter;
      sellerId?: string | StringFilter;
      condition?: string | StringFilter;
      location?: JsonFilter;
      images?: StringListFilter;
      category?: CategoryRelationFilter;
      seller?: UserRelationFilter;
    }

    interface ProductWhereUniqueInput {
      id?: string;
    }

    interface ProductCreateInput {
      name: string;
      description: string;
      price: number;
      condition: string;
      images?: string[];
      location?: JsonNullValueInput | InputJsonValue;
      category: CategoryCreateNestedOneWithoutProductsInput;
      seller: UserCreateNestedOneWithoutProductsInput;
    }

    interface ProductUpdateInput {
      name?: string | StringFieldUpdateOperationsInput;
      description?: string | StringFieldUpdateOperationsInput;
      price?: number | NumberFieldUpdateOperationsInput;
      condition?: string | StringFieldUpdateOperationsInput;
      images?: string[];
      location?: JsonNullValueInput | InputJsonValue;
      category?: CategoryUpdateOneRequiredWithoutProductsInput;
      seller?: UserUpdateOneRequiredWithoutProductsInput;
    }

    interface ProductInclude {
      category?: boolean;
      seller?: boolean;
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
      category?: boolean;
      seller?: boolean;
    }

    interface ProductOrderByWithRelationInput {
      id?: SortOrder;
      name?: SortOrder;
      description?: SortOrder;
      price?: SortOrder;
      categoryId?: SortOrder;
      sellerId?: SortOrder;
      condition?: SortOrder;
      createdAt?: SortOrder;
      updatedAt?: SortOrder;
      category?: CategoryOrderByWithRelationInput;
      seller?: UserOrderByWithRelationInput;
    }

    // Utility Types
    type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
    interface JsonObject { [Key in string]?: JsonValue }
    interface JsonArray extends Array<JsonValue> {}
    interface JsonFilter {
      equals?: InputJsonValue | JsonNullValueFilter;
      path?: string[];
      array_contains?: InputJsonValue | null;
      string_contains?: string;
      gt?: InputJsonValue;
      gte?: InputJsonValue;
      lt?: InputJsonValue;
      lte?: InputJsonValue;
      not?: InputJsonValue | JsonNullValueFilter;
    }
    type JsonNullValueInput = typeof JsonNullValueInput;
    type JsonNullValueFilter = typeof JsonNullValueFilter;
    type InputJsonValue = JsonValue;
  }
}

// Helper type for handling subset of args
type Subset<T, U> = {
  [key in keyof T]: key extends keyof U ? T[key] : never;
};