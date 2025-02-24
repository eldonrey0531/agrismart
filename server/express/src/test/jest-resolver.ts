import { resolve as resolvePath } from 'path';

/**
 * Custom Jest resolver to handle TypeScript path aliases
 */
module.exports = (
  request: string,
  options: { basedir: string; defaultResolver: (path: string, options: any) => string }
) => {
  // Handle TypeScript path aliases
  if (request.startsWith('@/')) {
    const rootDir = process.cwd();
    const resolvedPath = resolvePath(rootDir, 'src', request.slice(2));
    return options.defaultResolver(resolvedPath, options);
  }

  // Use default resolver for other modules
  return options.defaultResolver(request, options);
};

// Mock file extensions
module.exports.mockExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.node'];