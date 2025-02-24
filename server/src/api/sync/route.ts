import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Errors, ErrorMessages, createAppError } from "@/lib/utils/error";

// Validation schemas
const syncItemSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  operation: z.enum(["create", "update", "delete"]),
  resource: z.string(),
  data: z.any(),
  retries: z.number(),
  synced: z.boolean(),
});

const syncRequestSchema = z.object({
  items: z.array(syncItemSchema),
});

// Resource handlers
const resourceHandlers = {
  // Farm data
  "farms": {
    create: async (data: any, userId: string) => {
      return await prisma.farm.create({
        data: { ...data, userId },
      });
    },
    update: async (data: any) => {
      return await prisma.farm.update({
        where: { id: data.id },
        data,
      });
    },
    delete: async (id: string) => {
      return await prisma.farm.delete({
        where: { id },
      });
    },
  },

  // Sensor data
  "sensors": {
    create: async (data: any, userId: string) => {
      return await prisma.sensor.create({
        data: { ...data, userId },
      });
    },
    update: async (data: any) => {
      return await prisma.sensor.update({
        where: { id: data.id },
        data,
      });
    },
    delete: async (id: string) => {
      return await prisma.sensor.delete({
        where: { id },
      });
    },
  },

  // Field data
  "fields": {
    create: async (data: any, userId: string) => {
      return await prisma.field.create({
        data: { ...data, userId },
      });
    },
    update: async (data: any) => {
      return await prisma.field.update({
        where: { id: data.id },
        data,
      });
    },
    delete: async (id: string) => {
      return await prisma.field.delete({
        where: { id },
      });
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user) {
      throw Errors.unauthorized(ErrorMessages.UNAUTHORIZED);
    }

    // Validate request body
    const body = await req.json();
    const validation = syncRequestSchema.safeParse(body);

    if (!validation.success) {
      throw Errors.validation(ErrorMessages.VALIDATION, validation.error.errors);
    }

    const { items } = validation.data;
    const results = [];
    const errors = [];

    // Process each sync item
    for (const item of items) {
      try {
        const handler = resourceHandlers[item.resource as keyof typeof resourceHandlers];
        
        if (!handler) {
          throw Errors.notFound(ErrorMessages.NOT_FOUND);
        }

        let result;
        switch (item.operation) {
          case "create":
            result = await handler.create(item.data, session.user.id);
            break;
          case "update":
            result = await handler.update(item.data);
            break;
          case "delete":
            result = await handler.delete(item.data.id);
            break;
        }

        results.push({
          id: item.id,
          success: true,
          result,
        });
      } catch (error) {
        console.error(`Error processing item ${item.id}:`, error);
        errors.push({
          id: item.id,
          error: createAppError(error),
        });
      }
    }

    // Check for partial success
    if (errors.length > 0 && results.length > 0) {
      return Response.json({
        message: "Some changes took root, while others need more nurturing",
        results,
        errors,
        timestamp: Date.now(),
      }, { status: 207 }); // Multi-Status
    }

    // Check for complete failure
    if (errors.length > 0 && results.length === 0) {
      throw Errors.syncFailed(ErrorMessages.SYNC_FAILED, errors);
    }

    // Success
    return Response.json({
      message: "Your changes have blossomed successfully",
      results,
      timestamp: Date.now(),
    });

  } catch (error) {
    const appError = createAppError(error);
    console.error("Sync error:", appError);

    return Response.json(
      { 
        error: appError.message,
        code: appError.code,
        details: appError.details,
      },
      { status: appError.status }
    );
  }
}

// Get sync status
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      throw Errors.unauthorized(ErrorMessages.UNAUTHORIZED);
    }

    // Get last sync timestamp from query
    const lastSync = req.nextUrl.searchParams.get('lastSync');
    const lastSyncTime = lastSync ? parseInt(lastSync) : 0;

    // Get changes since last sync
    const changes = await prisma.syncLog.findMany({
      where: {
        userId: session.user.id,
        timestamp: {
          gt: new Date(lastSyncTime),
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return Response.json({
      message: "Like checking your garden's growth",
      changes,
      timestamp: Date.now(),
    });

  } catch (error) {
    const appError = createAppError(error);
    console.error("Status check error:", appError);

    return Response.json(
      { 
        error: appError.message,
        code: appError.code,
        details: appError.details,
      },
      { status: appError.status }
    );
  }
}