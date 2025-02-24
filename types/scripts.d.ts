// Type declarations for script dependencies
declare module 'glob' {
  interface GlobOptions {
    cwd?: string;
    root?: string;
    dot?: boolean;
    nomount?: boolean;
    mark?: boolean;
    nosort?: boolean;
    stat?: boolean;
    silent?: boolean;
    strict?: boolean;
    cache?: { [key: string]: any };
    statCache?: { [key: string]: any };
    symlinks?: { [key: string]: any };
    realpathCache?: { [key: string]: any };
    sync?: boolean;
    nounique?: boolean;
    nonull?: boolean;
    debug?: boolean;
    nobrace?: boolean;
    noglobstar?: boolean;
    noext?: boolean;
    nocase?: boolean;
    matchBase?: boolean;
    nodir?: boolean;
    ignore?: string | string[];
    follow?: boolean;
    realpath?: boolean;
    absolute?: boolean;
  }

  interface Glob {
    (pattern: string, options?: GlobOptions): Promise<string[]>;
    sync(pattern: string, options?: GlobOptions): string[];
  }

  const glob: Glob;
  export = glob;
}

declare module '@babel/parser' {
  export interface ParserOptions {
    sourceType: 'module' | 'script' | 'unambiguous';
    plugins?: string[];
  }
  export function parse(input: string, options?: ParserOptions): any;
}

declare module '@babel/traverse' {
  interface NodePath<T = any> {
    node: T;
    scope: {
      path: NodePath;
    };
  }

  interface TraverseOptions {
    ImportDeclaration?: (path: NodePath) => void;
    ClassProperty?: (path: NodePath) => void;
    Function?: (path: NodePath) => void;
    JSXElement?: (path: NodePath) => void;
    JSXAttribute?: (path: NodePath) => void;
    Identifier?: (path: NodePath) => void;
    [key: string]: ((path: NodePath) => void) | undefined;
  }

  export default function traverse(ast: any, visitors: TraverseOptions): void;
}

declare module '@babel/types' {
  export interface BaseNode {
    type: string;
  }

  export interface StringLiteral extends BaseNode {
    type: 'StringLiteral';
    value: string;
  }

  export interface JSXIdentifier extends BaseNode {
    type: 'JSXIdentifier';
    name: string;
  }

  export interface JSXAttribute extends BaseNode {
    type: 'JSXAttribute';
    name: JSXIdentifier;
    value: StringLiteral | JSXExpressionContainer | null;
  }

  export interface JSXExpressionContainer extends BaseNode {
    type: 'JSXExpressionContainer';
    expression: Expression;
  }

  export interface Expression extends BaseNode {
    type: string;
  }

  export interface JSXElement extends BaseNode {
    type: 'JSXElement';
    openingElement: JSXOpeningElement;
    children: Array<JSXElement | JSXText | JSXExpressionContainer>;
    closingElement: JSXClosingElement | null;
  }

  export interface JSXOpeningElement extends BaseNode {
    type: 'JSXOpeningElement';
    name: JSXIdentifier;
    attributes: JSXAttribute[];
    selfClosing: boolean;
  }

  export interface JSXClosingElement extends BaseNode {
    type: 'JSXClosingElement';
    name: JSXIdentifier;
  }

  export interface JSXText extends BaseNode {
    type: 'JSXText';
    value: string;
  }

  export function isJSXAttribute(node: any): node is JSXAttribute;
  export function isStringLiteral(node: any): node is StringLiteral;
  export function isJSXElement(node: any): node is JSXElement;
  export function isJSXExpressionContainer(node: any): node is JSXExpressionContainer;
  export function isJSXIdentifier(node: any): node is JSXIdentifier;
}

// Script interfaces
export interface StyleAnalysis {
  filePath: string;
  unusedClasses: string[];
  duplicateClasses: string[];
  nonTailwindClasses: string[];
  totalClasses: number;
}

export interface StyleReport {
  totalFiles: number;
  totalUnusedClasses: number;
  totalDuplicateClasses: number;
  totalNonTailwindClasses: number;
  fileAnalysis: StyleAnalysis[];
  suggestions: string[];
}

export interface BundleStats {
  name: string;
  size: number;
  gzipSize: number;
  dependencies: string[];
}

export interface BundleAnalysis {
  totalSize: number;
  totalGzipSize: number;
  chunks: BundleStats[];
  largeModules: BundleStats[];
  duplicateDependencies: string[];
  suggestions: string[];
}

export interface ComponentAnalysis {
  name: string;
  path: string;
  complexity: number;
  dependencies: string[];
  unusedImports: string[];
  unusedStyles: string[];
  bundleSize: number;
}

export interface OptimizationReport {
  components: ComponentAnalysis[];
  totalBundleSize: number;
  unusedDependencies: string[];
  duplicateStyles: string[];
  optimizationSuggestions: string[];
}

// Configuration types
export interface TailwindConfig {
  content: string[];
  theme: {
    extend?: Record<string, unknown>;
  };
  plugins: unknown[];
}

export interface PackageJson {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}