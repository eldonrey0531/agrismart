import { Response } from 'express';
import { ApiResponse } from '../types';
import { AppError } from '../lib/errors';

export class ResponseHandler {
  // Success responses
  static success<T>(res: Response, data?: T, message?: string): void {
    res.status(200).json({
      success: true,
      data,
      message
    });
  }

  static created<T>(res: Response, data?: T, message?: string): void {
    res.status(201).json({
      success: true,
      data,
      message: message || 'Resource created successfully'
    });
  }

  static noContent(res: Response): void {
    res.status(204).send();
  }

  // Error responses
  static error(res: Response, error: AppError | Error): void {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message
        }
      });
    }
  }

  static badRequest(res: Response, message: string, details?: Record<string, any>): void {
    res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message,
        details
      }
    });
  }

  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message
      }
    });
  }

  static forbidden(res: Response, message: string = 'Forbidden'): void {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message
      }
    });
  }

  static notFound(res: Response, resource: string = 'Resource'): void {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `${resource} not found`
      }
    });
  }

  static conflict(res: Response, message: string, details?: Record<string, any>): void {
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message,
        details
      }
    });
  }

  static validationError(res: Response, details: any[]): void {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details
      }
    });
  }

  static serverError(res: Response, error: Error): void {
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: isProduction ? 'Internal server error' : error.message,
        ...(isProduction ? {} : { stack: error.stack })
      }
    });
  }

  // Paginated response
  static paginated<T>(
    res: Response, 
    data: T[], 
    total: number,
    page: number,
    limit: number
  ): void {
    res.status(200).json({
      success: true,
      data: {
        items: data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  }

  // Stream response
  static stream(res: Response, stream: NodeJS.ReadableStream): void {
    stream.pipe(res);
    stream.on('error', (error) => {
      this.serverError(res, error);
    });
  }

  // File response
  static file(res: Response, data: Buffer, filename: string, mimeType: string): void {
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(data);
  }

  // JSON stream response
  static jsonStream(res: Response, stream: NodeJS.ReadableStream): void {
    res.setHeader('Content-Type', 'application/json');
    res.write('[');
    let isFirst = true;

    stream.on('data', (data) => {
      if (!isFirst) {
        res.write(',');
      }
      isFirst = false;
      res.write(JSON.stringify(data));
    });

    stream.on('end', () => {
      res.write(']');
      res.end();
    });

    stream.on('error', (error) => {
      this.serverError(res, error);
    });
  }
}