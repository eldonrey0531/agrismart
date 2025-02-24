/// <reference types="vite/client" />
/// <reference types="vitest/globals" />

import type { Plugin } from 'vite';

declare module 'vite' {
  interface UserConfig {
    test?: import('vitest').InlineConfig;
  }
}

declare module '@vitejs/plugin-react' {
  const plugin: (options?: any) => Plugin;
  export default plugin;
}

declare module 'vite-tsconfig-paths' {
  const plugin: (options?: any) => Plugin;
  export default plugin;
}

declare module 'vitest' {
  interface InlineConfig {
    globals?: boolean;
    environment?: string;
    setupFiles?: string[];
    include?: string[];
    coverage?: {
      provider: string;
      reporter: string[];
      include?: string[];
      exclude?: string[];
    };
    deps?: {
      inline?: string[];
    };
  }
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_URL: string;
  readonly NODE_ENV: 'development' | 'production' | 'test';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}