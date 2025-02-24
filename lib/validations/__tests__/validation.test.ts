import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createValidationMiddleware, composeValidation } from "../middleware";
import { productSchema, locationSchema, categorySchema } from "../schemas";
import { NextRequest, NextResponse } from "next/server";

describe("Validation System", () => {
  describe("Schema Validation", () => {
    it("should validate correct product data", async () => {
      const validProduct = {
        title: "Test Product",
        description: "This is a test product description that meets the minimum length",
        category: "VEGETABLES",
        location: {
          latitude: 14.5995,
          longitude: 120.9842,
          address: "Manila, Philippines",
        },
        images: [
          {
            url: "https://example.com/image.jpg",
            size: 1024 * 1024, // 1MB
            type: "image/jpeg",
            width: 800,
            height: 600,
          },
        ],
        price: 100,
      };

      const result = await productSchema.safeParseAsync(validProduct);
      expect(result.success).toBe(true);
    });

    it("should reject invalid product data", async () => {
      const invalidProduct = {
        title: "Test",
        description: "Too short",
        category: "INVALID",
        location: {
          latitude: 200, // Invalid latitude
          longitude: 120.9842,
        },
        images: [],
        price: -100,
      };

      const result = await productSchema.safeParseAsync(invalidProduct);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors).toHaveLength(6); // Should have multiple validation errors
      }
    });

    it("should validate location data consistently", async () => {
      const validLocation = {
        latitude: 14.5995,
        longitude: 120.9842,
        address: "Manila, Philippines",
      };

      const result = await locationSchema.safeParseAsync(validLocation);
      expect(result.success).toBe(true);
    });

    it("should validate categories consistently", async () => {
      const validCategory = "VEGETABLES";
      const invalidCategory = "INVALID";

      const validResult = await categorySchema.safeParseAsync(validCategory);
      const invalidResult = await categorySchema.safeParseAsync(invalidCategory);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });
  });

  describe("Validation Middleware", () => {
    it("should pass valid requests through middleware", async () => {
      const schema = z.object({
        name: z.string().min(3),
        age: z.number().positive(),
      });

      const middleware = createValidationMiddleware(schema);
      const validBody = { name: "John Doe", age: 25 };
      const request = new NextRequest("http://localhost", {
        method: "POST",
        body: JSON.stringify(validBody),
      });

      const nextMock = async () => NextResponse.json({ success: true });
      const response = await middleware(request, nextMock);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
    });

    it("should reject invalid requests with proper error format", async () => {
      const schema = z.object({
        name: z.string().min(3),
        age: z.number().positive(),
      });

      const middleware = createValidationMiddleware(schema);
      const invalidBody = { name: "Jo", age: -1 };
      const request = new NextRequest("http://localhost", {
        method: "POST",
        body: JSON.stringify(invalidBody),
      });

      const nextMock = async () => NextResponse.json({ success: true });
      const response = await middleware(request, nextMock);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
      expect(data.error.code).toBe("VALIDATION_ERROR");
      expect(Array.isArray(data.error.details)).toBe(true);
    });
  });

  describe("Validation Composition", () => {
    it("should compose multiple validation middlewares", async () => {
      const schema1 = z.object({ field1: z.string() });
      const schema2 = z.object({ field2: z.number() });

      const middleware1 = createValidationMiddleware(schema1);
      const middleware2 = createValidationMiddleware(schema2);
      const composed = composeValidation(middleware1, middleware2);

      const request = new NextRequest("http://localhost", {
        method: "POST",
        body: JSON.stringify({ field1: "test", field2: 123 }),
      });

      const response = await composed(request);
      expect(response).toBeDefined();
    });
  });
});