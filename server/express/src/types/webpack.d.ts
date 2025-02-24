import { Configuration as BaseConfiguration, Stats } from 'webpack';

declare module 'webpack' {
  interface Configuration extends BaseConfiguration {
    /**
     * Custom configuration properties
     */
    mode?: 'development' | 'production' | 'none';
    watch?: boolean;
    target?: string;
    devtool?: string | false;
    externals?: any[];
    optimization?: {
      nodeEnv?: boolean | string;
      [key: string]: any;
    };
    stats?: {
      modules?: boolean;
      colors?: boolean;
      [key: string]: any;
    };
  }

  interface Compiler {
    /**
     * Watch mode methods
     */
    watch(
      watchOptions: {
        aggregateTimeout?: number;
        poll?: boolean | number;
        ignored?: RegExp | string | string[];
      },
      handler: (error: Error | null, stats: Stats | undefined) => void
    ): Watching;

    /**
     * Event hooks
     */
    hooks: {
      done: {
        tap(
          name: string,
          handler: (stats: Stats) => void
        ): void;
      };
      [key: string]: any;
    };
  }

  interface Watching {
    /**
     * Close watching
     */
    close(callback?: () => void): void;

    /**
     * Invalidate watching
     */
    invalidate(callback?: () => void): void;

    /**
     * Pause watching
     */
    pause(): void;

    /**
     * Resume watching
     */
    resume(): void;
  }

  interface Stats {
    /**
     * Has errors
     */
    hasErrors(): boolean;

    /**
     * Has warnings
     */
    hasWarnings(): boolean;

    /**
     * Get formatted stats
     */
    toString(options?: string | { [key: string]: boolean | number | string }): string;

    /**
     * Get raw stats
     */
    toJson(options?: string | { [key: string]: boolean | number | string }): any;
  }
}