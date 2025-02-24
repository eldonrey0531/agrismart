import { z } from 'zod';
import { authSchemas } from './schemas/auth';
import { marketplaceSchemas } from './schemas/marketplace';
import { productInteractionSchemas } from './schemas/productInteraction';
import { BadRequestError } from '../app-error';

export const formSchemas = {
  ...authSchemas,
  ...marketplaceSchemas,
  ...productInteractionSchemas,
};

type ValidationError = {
  path: (string | number)[];
  message: string;
};

function formatZodError(error: z.ZodError): string {
  return error.errors
    .map((err: z.ZodIssue) => {
      const path = err.path.join('.');
      return path ? `${path}: ${err.message}` : err.message;
    })
    .join('; ');
}

export async function validateInput<T>(
  schema: z.ZodType<T>,
  data: unknown
): Promise<T> {
  try {
    const result = await schema.parseAsync(data);
    return result;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError(formatZodError(error));
    }
    throw new BadRequestError('Invalid input data');
  }
}

export type { z };

export default {
  validateInput,
  formSchemas,
};