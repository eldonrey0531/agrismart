declare module 'sharp' {
  interface Sharp {
    resize(width?: number, height?: number, options?: {
      fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
      withoutEnlargement?: boolean;
    }): Sharp;
    webp(options?: { quality?: number }): Sharp;
    toBuffer(): Promise<Buffer>;
    metadata(): Promise<{
      width?: number;
      height?: number;
      format?: string;
      size?: number;
    }>;
  }

  interface SharpOptions {
    failOnError?: boolean;
  }

  interface SharpConstructor {
    (buffer: Buffer, options?: SharpOptions): Sharp;
    (input: string, options?: SharpOptions): Sharp;
  }

  const sharp: SharpConstructor;
  export = sharp;
}