import { useState, useCallback } from 'react'

interface CodeFoldProps {
  children: React.ReactNode
  initiallyFolded?: boolean
  label?: string
  minHeight?: string
  maxHeight?: string
  className?: string
}

/**
 * Foldable code section component
 */
export function CodeFold({
  children,
  initiallyFolded = false,
  label,
  minHeight = '3rem',
  maxHeight = '20rem',
  className = ''
}: CodeFoldProps) {
  const [isFolded, setIsFolded] = useState(initiallyFolded)
  const [isOverflowing, setIsOverflowing] = useState(false)

  /**
   * Handle element reference to check overflow
   */
  const contentRef = useCallback((element: HTMLDivElement | null) => {
    if (element) {
      const hasOverflow = element.scrollHeight > element.clientHeight
      setIsOverflowing(hasOverflow)
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Content */}
      <div
        ref={contentRef}
        style={{
          maxHeight: isFolded ? minHeight : maxHeight,
          transition: 'max-height 0.3s ease-in-out'
        }}
        className="overflow-hidden"
      >
        {children}

        {/* Gradient overlay when folded */}
        {isFolded && isOverflowing && (
          <div
            className="absolute bottom-0 left-0 right-0 h-12
              bg-gradient-to-t from-white dark:from-gray-900 to-transparent
              pointer-events-none"
          />
        )}
      </div>

      {/* Fold toggle button */}
      {isOverflowing && (
        <button
          onClick={() => setIsFolded(!isFolded)}
          className="
            flex items-center justify-center w-full py-2
            text-sm text-gray-500 hover:text-gray-700
            dark:text-gray-400 dark:hover:text-gray-200
            focus:outline-none focus:ring-2 focus:ring-offset-2
            focus:ring-blue-500 transition-colors
          "
          aria-expanded={!isFolded}
          aria-label={isFolded ? 'Show more' : 'Show less'}
        >
          <span className="mr-2">
            {label || (isFolded ? 'Show more' : 'Show less')}
          </span>
          <ChevronIcon
            className={`
              w-4 h-4 transform transition-transform
              ${isFolded ? '' : 'rotate-180'}
            `}
          />
        </button>
      )}
    </div>
  )
}

/**
 * Chevron icon component
 */
function ChevronIcon({ className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/**
 * Export types
 */
export interface FoldRegion {
  start: number
  end: number
  label?: string
}

/**
 * Example usage:
 * ```tsx
 * <CodeFold
 *   initiallyFolded
 *   label="Configuration options"
 *   maxHeight="30rem"
 * >
 *   <SyntaxHighlight
 *     code={longCode}
 *     language="json"
 *   />
 * </CodeFold>
 * ```
 */