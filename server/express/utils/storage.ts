import { GridFSBucket, ObjectId } from "mongodb";
import mongoose from "mongoose";
import { Request } from "express";
import { AppError } from "./app-error";
import multer, { FileFilterCallback } from "multer";
import { Stream } from "stream";

let bucket: GridFSBucket;

// Initialize GridFS bucket
export const initializeStorage = () => {
  if (!mongoose.connection.db) {
    throw new Error('Database connection not established');
  }
  bucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads"
  });
};

// Configure multer for file upload
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new AppError("Only image files are allowed", 400));
      return;
    }
    cb(null, true);
  }
});

// Helper to upload file to GridFS
export const uploadFile = async (
  fileBuffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType
    });

    const bufferStream = new Stream.Readable();
    bufferStream.push(fileBuffer);
    bufferStream.push(null);

    bufferStream.pipe(uploadStream)
      .on("error", (error: Error) => reject(error))
      .on("finish", () => resolve(uploadStream.id.toString()));
  });
};

// Helper to delete file from GridFS
export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    await bucket.delete(new ObjectId(fileId));
  } catch (error: unknown) {
    if (error instanceof Error && error.message !== "FileNotFound") {
      throw error;
    }
  }
};

// Helper to get file stream from GridFS
export const getFileStream = (fileId: string) => {
  return bucket.openDownloadStream(new ObjectId(fileId));
};

// Get file info from GridFS
export const getFileInfo = async (fileId: string) => {
  const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
  if (files.length === 0) {
    throw new AppError("File not found", 404);
  }
  return files[0];
};

// Helper to extract file ID from avatar URL
export const getFileIdFromUrl = (url: string): string => {
  const matches = url.match(/\/files\/([a-f\d]{24})/i);
  return matches?.[1] || "";
};

// Middleware to handle file upload errors
export const handleFileUploadError = (err: Error, req: Request) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      throw new AppError("File size cannot exceed 5MB", 400);
    }
    throw new AppError(err.message, 400);
  }
  throw err;
};
