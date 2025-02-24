import Prism from 'prismjs'

// Core languages
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-json5'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-csv'
import 'prismjs/components/prism-sql'

// Web languages
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-less'
import 'prismjs/components/prism-graphql'

// Configuration languages
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-nginx'
import 'prismjs/components/prism-toml'
import 'prismjs/components/prism-ini'
import 'prismjs/components/prism-env'

export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'json'
  | 'json5'
  | 'markdown'
  | 'yaml'
  | 'csv'
  | 'sql'
  | 'html'
  | 'css'
  | 'scss'
  | 'less'
  | 'graphql'
  | 'docker'
  | 'nginx'
  | 'toml'
  | 'ini'
  | 'env'

interface LanguageConfig {
  name: string
  alias?: string[]
  mimeTypes?: string[]
  icon?: string
}

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  javascript: {
    name: 'JavaScript',
    alias: ['js', 'jsx'],
    mimeTypes: ['application/javascript'],
    icon: 'javascript'
  },
  typescript: {
    name: 'TypeScript',
    alias: ['ts', 'tsx'],
    mimeTypes: ['application/typescript'],
    icon: 'typescript'
  },
  jsx: {
    name: 'JSX',
    mimeTypes: ['text/jsx'],
    icon: 'react'
  },
  tsx: {
    name: 'TSX',
    mimeTypes: ['text/tsx'],
    icon: 'react'
  },
  json: {
    name: 'JSON',
    mimeTypes: ['application/json'],
    icon: 'json'
  },
  json5: {
    name: 'JSON5',
    mimeTypes: ['application/json5'],
    icon: 'json'
  },
  markdown: {
    name: 'Markdown',
    alias: ['md'],
    mimeTypes: ['text/markdown'],
    icon: 'markdown'
  },
  yaml: {
    name: 'YAML',
    alias: ['yml'],
    mimeTypes: ['text/yaml'],
    icon: 'yaml'
  },
  csv: {
    name: 'CSV',
    mimeTypes: ['text/csv'],
    icon: 'csv'
  },
  sql: {
    name: 'SQL',
    mimeTypes: ['application/sql'],
    icon: 'database'
  },
  html: {
    name: 'HTML',
    mimeTypes: ['text/html'],
    icon: 'html'
  },
  css: {
    name: 'CSS',
    mimeTypes: ['text/css'],
    icon: 'css'
  },
  scss: {
    name: 'SCSS',
    mimeTypes: ['text/scss'],
    icon: 'sass'
  },
  less: {
    name: 'Less',
    mimeTypes: ['text/less'],
    icon: 'less'
  },
  graphql: {
    name: 'GraphQL',
    mimeTypes: ['application/graphql'],
    icon: 'graphql'
  },
  docker: {
    name: 'Docker',
    alias: ['dockerfile'],
    mimeTypes: ['text/x-dockerfile'],
    icon: 'docker'
  },
  nginx: {
    name: 'Nginx',
    mimeTypes: ['text/x-nginx-conf'],
    icon: 'nginx'
  },
  toml: {
    name: 'TOML',
    mimeTypes: ['application/toml'],
    icon: 'toml'
  },
  ini: {
    name: 'INI',
    mimeTypes: ['text/x-ini'],
    icon: 'config'
  },
  env: {
    name: 'Environment',
    alias: ['.env'],
    mimeTypes: ['text/plain'],
    icon: 'env'
  }
}

/**
 * Get language config by name or alias
 */
export function getLanguageConfig(
  language: string
): LanguageConfig | undefined {
  const normalizedLang = language.toLowerCase()
  
  // Direct lookup
  if (normalizedLang in LANGUAGE_CONFIGS) {
    return LANGUAGE_CONFIGS[normalizedLang as SupportedLanguage]
  }

  // Search aliases
  return Object.values(LANGUAGE_CONFIGS).find(config => 
    config.alias?.includes(normalizedLang)
  )
}

/**
 * Check if language is supported
 */
export function isLanguageSupported(language: string): boolean {
  return !!getLanguageConfig(language)
}

/**
 * Get MIME type for language
 */
export function getLanguageMimeType(language: string): string | undefined {
  const config = getLanguageConfig(language)
  return config?.mimeTypes?.[0]
}

/**
 * Get language name
 */
export function getLanguageName(language: string): string {
  return getLanguageConfig(language)?.name || language.toUpperCase()
}

/**
 * Get language icon
 */
export function getLanguageIcon(language: string): string {
  return getLanguageConfig(language)?.icon || 'code'
}

/**
 * Initialize Prism with all supported languages
 */
export function initializePrism(): void {
  // Register additional languages
  Object.keys(LANGUAGE_CONFIGS).forEach(lang => {
    const config = LANGUAGE_CONFIGS[lang as SupportedLanguage]
    if (config.alias) {
      config.alias.forEach(alias => {
        Prism.languages[alias] = Prism.languages[lang]
      })
    }
  })
}

// Auto-initialize when imported
initializePrism()