import React, { useCallback, useState, useRef, useEffect } from 'react'
import { SyntaxHighlight } from './syntax-highlight'

interface CodeBlockProps {
  code: string
  language: 'json' | 'html' | 'csv'
  showLineNumbers?: boolean
  highlight?: number[]
  maxHeight?: string
  label?: string
  className?: string
}

/**
 * Accessible code block with copy functionality and line numbers
 */
export function CodeBlock({
  code,
  language,
  showLineNumbers = false,
  highlight = [],
  maxHeight = '400px',
  label,
  className = ''
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipTimeout = useRef<NodeJS.Timeout>()
  const blockRef = useRef<HTMLPreElement>(null)

  // Handle copy functionality
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setShowTooltip(true)

      // Reset states after delay
      tooltipTimeout.current = setTimeout(() => {
        setCopied(false)
        setShowTooltip(false)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
      setShowTooltip(true)
      tooltipTimeout.current = setTimeout(() => {
        setShowTooltip(false)
      }, 2000)
    }
  }, [code])

  // Cleanup tooltip timer
  useEffect(() => {
    return () => {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current)
      }
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCopy()
    }
  }, [handleCopy])

  return (
    <div className="relative group" aria-label={`Code block: ${label || language}`}>
      {/* Language badge */}
      <div
        className="absolute top-0 right-4 px-2 py-1 text-xs font-medium 
          bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300
          rounded-b-md transform -translate-y-full opacity-75 transition-opacity
          group-hover:opacity-100"
        aria-label={`Language: ${language.toUpperCase()}`}
      >
        {language.toUpperCase()}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        onKeyDown={handleKeyDown}
        className={`
          absolute top-2 right-2 p-2 rounded-md
          transition-all duration-200 focus:outline-none
          ${copied
            ? 'bg-green-100 dark:bg-green-800'
            : 'bg-gray-100 dark:bg-gray-800 opacity-0 group-hover:opacity-100'
          }
        `}
        aria-label={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
        tabIndex={0}
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <CopyIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          role="status"
          aria-live="polite"
          className="absolute -top-8 right-2 px-2 py-1 text-sm
            bg-gray-800 text-white rounded shadow-lg"
        >
          {copied ? 'Copied!' : 'Failed to copy'}
        </div>
      )}

      {/* Code content */}
      <pre
        ref={blockRef}
        className={`
          relative overflow-auto rounded-lg
          ${showLineNumbers ? 'pl-12' : 'pl-4'}
          ${className}
        `}
        style={{ maxHeight }}
      >
        {/* Line numbers */}
        {showLineNumbers && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-8
              flex flex-col items-end px-2 py-4
              text-xs text-gray-400 select-none
              border-r border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800"
            aria-hidden="true"
          >
            {code.split('\n').map((_, i) => (
              <div
                key={i}
                className={highlight.includes(i + 1) ? 'text-blue-500 font-bold' : ''}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <SyntaxHighlight
          code={code}
          language={language}
          highlight={highlight}
        />
      </pre>
    </div>
  )
}

function CopyIcon({ className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CheckIcon({ className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}