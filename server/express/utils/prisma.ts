import { PrismaClient, Prisma } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaOptions: Prisma.PrismaClientOptions = {
  log: [
    {
      emit: 'stdout' as const,
      level: 'error' as Prisma.LogLevel,
    },
    {
      emit: 'stdout' as const,
      level: 'warn' as Prisma.LogLevel,
    },
    ...(process.env.NODE_ENV === 'development' ? [
      {
        emit: 'stdout' as const,
        level: 'query' as Prisma.LogLevel,
      }
    ] : [])
  ]
};

// Prevent multiple instances in development
export const prisma = global.prisma || new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Add middleware for error handling and logging
prisma.$use(async (params, next) => {
  const start = Date.now();
  
  try {
    const result = await next(params);
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - start;
      if (duration > 100) {
        console.warn('Slow query:', {
          model: params.model,
          action: params.action,
          duration: `${duration}ms`
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Database operation failed:', {
      model: params.model,
      action: params.action,
      args: params.args,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
});

// Re-export Prisma namespace for types
export { Prisma };