import { useEffect, useRef } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-csv'
import 'prismjs/themes/prism.css'

export interface SyntaxHighlightProps {
  code: string
  language: 'json' | 'html' | 'csv'
  highlight?: number[]
  className?: string
  wrapLines?: boolean
  showLineNumbers?: boolean
}

/**
 * Syntax highlighting component using Prism.js with line highlighting
 */
export function SyntaxHighlight({
  code,
  language,
  highlight = [],
  className = '',
  wrapLines = false,
  showLineNumbers = false
}: SyntaxHighlightProps) {
  const codeRef = useRef<HTMLElement>(null)
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current)
    }
  }, [code, language])

  // Apply line highlighting
  useEffect(() => {
    if (!preRef.current || !highlight.length) return

    const lines = preRef.current.querySelectorAll('.line')
    lines.forEach((line, index) => {
      if (highlight.includes(index + 1)) {
        line.classList.add('highlighted')
      } else {
        line.classList.remove('highlighted')
      }
    })
  }, [highlight])

  // Split code into lines if needed
  const codeLines = wrapLines ? code.split('\n') : [code]
  const hasHighlight = highlight.length > 0

  return (
    <pre
      ref={preRef}
      className={`language-${language} ${className} ${hasHighlight ? 'has-line-highlighting' : ''}`}
      style={{
        margin: 0,
        padding: showLineNumbers ? '1em 0 1em 3.8em' : '1em'
      }}
    >
      {wrapLines ? (
        codeLines.map((line, i) => (
          <div
            key={i}
            className={`line ${highlight.includes(i + 1) ? 'highlighted' : ''}`}
            data-line={showLineNumbers ? i + 1 : undefined}
          >
            <code
              ref={i === 0 ? codeRef : undefined}
              className={`language-${language}`}
            >
              {line}
            </code>
          </div>
        ))
      ) : (
        <code
          ref={codeRef}
          className={`language-${language}`}
        >
          {code}
        </code>
      )}
    </pre>
  )
}

/**
 * Custom theme styles
 */
export const syntaxTheme = {
  // Base styles
  'pre[class*="language-"]': {
    background: '#f8f9fa',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    padding: '1rem',
    margin: 0,
    overflow: 'auto',
    borderRadius: '0.5rem'
  },

  // Line highlighting
  '.line': {
    display: 'block',
    padding: '0 1em',
    transition: 'background-color 0.1s'
  },

  '.highlighted': {
    backgroundColor: 'rgba(255, 255, 0, 0.1)',
    borderLeft: '2px solid #fbbf24'
  },

  // Line numbers
  '.line-number': {
    position: 'absolute',
    left: 0,
    color: '#94a3b8',
    textAlign: 'right',
    width: '3em',
    userSelect: 'none'
  },

  // Dark mode
  '@media (prefers-color-scheme: dark)': {
    'pre[class*="language-"]': {
      background: '#1e293b'
    },
    '.highlighted': {
      backgroundColor: 'rgba(255, 255, 0, 0.05)',
      borderLeftColor: '#d97706'
    },
    '.line-number': {
      color: '#64748b'
    }
  }
}

/**
 * Example usage:
 * ```tsx
 * <SyntaxHighlight
 *   code={`const x = 42;
 * console.log(x);`}
 *   language="json"
 *   highlight={[2]}
 *   wrapLines
 *   showLineNumbers
 * />
 * ```
 */