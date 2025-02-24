import { PrismaClient, Prisma } from '@prisma/client';

type ProductAttributeCreateInput = {
  data: {
    productId: string;
    name: string;
    value: string;
    type: string;
  };
};

type ProductAttributeDeleteManyInput = {
  where: {
    productId: string;
  };
};

interface ProductAttributeDelegate {
  create: (args: ProductAttributeCreateInput) => Promise<any>;
  deleteMany: (args: ProductAttributeDeleteManyInput) => Promise<Prisma.BatchPayload>;
}

export interface ExtendedPrismaClient extends PrismaClient {
  productAttribute: ProductAttributeDelegate;
}

const prismaClient = new PrismaClient();

// Add custom methods
const extendedPrisma = prismaClient.$extends({
  model: {
    product: {
      async createWithRelations(data: Prisma.ProductCreateInput & { attributes?: any[] }) {
        const { attributes, ...productData } = data;
        const product = await prismaClient.product.create({
          data: productData
        });

        if (attributes) {
          await Promise.all(
            attributes.map((attr) =>
              prismaClient.productAttribute.create({
                data: {
                  productId: product.id,
                  ...attr
                }
              })
            )
          );
        }

        return product;
      }
    }
  }
}) as unknown as ExtendedPrismaClient;

export const prisma = extendedPrisma;