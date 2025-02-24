import { SupportedLanguage, LANGUAGE_CONFIGS } from './prism-languages'

interface FileSignature {
  pattern: RegExp | string[]
  language: SupportedLanguage
  confidence: number
}

interface DetectionResult {
  language: SupportedLanguage
  confidence: number
  source: 'extension' | 'content' | 'fallback'
}

/**
 * File extension mappings
 */
const EXTENSION_MAP: Record<string, SupportedLanguage> = {
  // JavaScript
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.mjs': 'javascript',
  '.cjs': 'javascript',

  // TypeScript
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.mts': 'typescript',
  '.cts': 'typescript',

  // Web
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.gql': 'graphql',
  '.graphql': 'graphql',

  // Config
  '.json': 'json',
  '.json5': 'json5',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'toml',
  '.ini': 'ini',
  '.env': 'env',
  
  // Data
  '.csv': 'csv',
  '.sql': 'sql',
  
  // Documentation
  '.md': 'markdown',
  '.markdown': 'markdown',

  // Docker
  'Dockerfile': 'docker',
  '.dockerfile': 'docker',

  // Nginx
  '.conf': 'nginx',
  'nginx.conf': 'nginx'
}

/**
 * Content signatures for language detection
 */
const CONTENT_SIGNATURES: FileSignature[] = [
  // JavaScript
  {
    pattern: [
      'export default',
      'module.exports',
      'import * from',
      'require(',
      'async function'
    ],
    language: 'javascript',
    confidence: 0.8
  },

  // TypeScript
  {
    pattern: [
      'interface ',
      'type ',
      'namespace ',
      ': string',
      ': number',
      ': boolean'
    ],
    language: 'typescript',
    confidence: 0.9
  },

  // React
  {
    pattern: [
      'import React',
      'React.Component',
      'useState(',
      'useEffect(',
      '<div>',
      'className='
    ],
    language: 'jsx',
    confidence: 0.9
  },

  // HTML
  {
    pattern: [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '<body>',
      '<script>'
    ],
    language: 'html',
    confidence: 1
  },

  // CSS
  {
    pattern: [
      '@media',
      '@import',
      '@keyframes',
      'background:',
      'margin:',
      'padding:'
    ],
    language: 'css',
    confidence: 0.8
  },

  // JSON
  {
    pattern: /^[\s\n]*[{\[]/,
    language: 'json',
    confidence: 0.7
  },

  // YAML
  {
    pattern: /^[\s\n]*([a-zA-Z0-9_-]+:|\s*-\s+)/,
    language: 'yaml',
    confidence: 0.7
  },

  // GraphQL
  {
    pattern: [
      'type Query',
      'type Mutation',
      'input ',
      'schema {',
      'extend type'
    ],
    language: 'graphql',
    confidence: 0.9
  },

  // SQL
  {
    pattern: [
      'SELECT ',
      'INSERT INTO',
      'UPDATE ',
      'DELETE FROM',
      'CREATE TABLE'
    ],
    language: 'sql',
    confidence: 0.9
  },

  // Docker
  {
    pattern: [
      'FROM ',
      'RUN ',
      'COPY ',
      'WORKDIR ',
      'ENV ',
      'EXPOSE '
    ],
    language: 'docker',
    confidence: 0.9
  }
]

/**
 * Detect language from file extension
 */
function detectFromExtension(filename: string): DetectionResult | null {
  const ext = filename.toLowerCase()
  const language = EXTENSION_MAP[ext] || EXTENSION_MAP[`.${ext}`]
  
  return language ? {
    language,
    confidence: 1,
    source: 'extension'
  } : null
}

/**
 * Detect language from content
 */
function detectFromContent(content: string): DetectionResult | null {
  let bestMatch: DetectionResult | null = null

  for (const sig of CONTENT_SIGNATURES) {
    let matches = 0

    if (Array.isArray(sig.pattern)) {
      matches = sig.pattern.filter(p => content.includes(p)).length
      const confidence = (matches / sig.pattern.length) * sig.confidence
      
      if (confidence > (bestMatch?.confidence || 0)) {
        bestMatch = {
          language: sig.language,
          confidence,
          source: 'content'
        }
      }
    } else if (sig.pattern.test(content)) {
      if (sig.confidence > (bestMatch?.confidence || 0)) {
        bestMatch = {
          language: sig.language,
          confidence: sig.confidence,
          source: 'content'
        }
      }
    }
  }

  return bestMatch
}

/**
 * Detect file language
 */
export function detectLanguage(
  content: string,
  filename?: string
): DetectionResult {
  // Try extension first
  if (filename) {
    const extResult = detectFromExtension(filename)
    if (extResult && extResult.confidence > 0.8) {
      return extResult
    }
  }

  // Try content analysis
  const contentResult = detectFromContent(content)
  if (contentResult && contentResult.confidence > 0.6) {
    return contentResult
  }

  // Fallback to extension result or plain text
  return (
    filename ? detectFromExtension(filename) : null
  ) || {
    language: 'markdown',
    confidence: 0.1,
    source: 'fallback'
  }
}

/**
 * Get common file extensions for a language
 */
export function getLanguageExtensions(language: SupportedLanguage): string[] {
  return Object.entries(EXTENSION_MAP)
    .filter(([, lang]) => lang === language)
    .map(([ext]) => ext)
}

/**
 * Example usage:
 * ```typescript
 * const result = detectLanguage(fileContent, 'example.ts')
 * console.log(result)
 * // {
 * //   language: 'typescript',
 * //   confidence: 0.9,
 * //   source: 'content'
 * // }
 * ```
 */