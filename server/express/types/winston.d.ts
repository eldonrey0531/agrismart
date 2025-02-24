import 'winston-daily-rotate-file';
import { Logger } from 'winston';

declare module 'winston' {
  interface DailyRotateFileTransportOptions extends TransportStreamOptions {
    filename: string;
    datePattern?: string;
    zippedArchive?: boolean;
    maxSize?: string;
    maxFiles?: string;
  }
}

declare module 'winston-daily-rotate-file' {
  import { TransportStream } from 'winston';
  
  interface DailyRotateFile extends TransportStream {
    new (options?: winston.DailyRotateFileTransportOptions): TransportStream;
  }
  
  const DailyRotateFile: DailyRotateFile;
  export = DailyRotateFile;
}
