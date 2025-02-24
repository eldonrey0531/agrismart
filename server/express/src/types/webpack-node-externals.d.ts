declare module 'webpack-node-externals' {
  interface Options {
    /**
     * An array of additional modules to include in the bundle
     */
    allowlist?: Array<string | RegExp | ((name: string) => boolean)>;

    /**
     * The type of module to consider as external
     */
    importType?: 'commonjs' | 'amd' | 'umd' | 'this' | ((moduleName: string) => string);

    /**
     * An array of absolute paths to directories to include modules from
     */
    modulesDir?: string | string[];

    /**
     * Whether to include node_modules in externals
     */
    includeAbsolutePaths?: boolean;

    /**
     * A function to determine whether a module should be external
     */
    additionalModuleDirs?: string[];
  }

  /**
   * Creates an externals function that excludes node_modules
   */
  function webpackNodeExternals(options?: Options): (
    context: string,
    request: string,
    callback: (error?: null | Error, result?: string) => void
  ) => void;

  export = webpackNodeExternals;
}