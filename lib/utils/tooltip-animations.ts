import { type ClassValue } from "clsx"

export const transitionDurations = {
  fast: 150,
  normal: 200,
  slow: 300,
} as const

export const tooltipAnimations: Record<string, ClassValue> = {
  // Fade animations
  fadeIn: [
    "opacity-0 data-[state=visible]:opacity-100",
    "transition-opacity duration-200"
  ],
  fadeOut: [
    "opacity-100 data-[state=hidden]:opacity-0",
    "transition-opacity duration-150"
  ],

  // Scale animations
  scaleIn: [
    "scale-95 data-[state=visible]:scale-100",
    "transition-transform duration-200"
  ],
  scaleOut: [
    "scale-100 data-[state=hidden]:scale-95",
    "transition-transform duration-150"
  ],

  // Slide animations by side
  slideTop: [
    "translate-y-1 data-[state=visible]:translate-y-0",
    "transition-transform duration-200"
  ],
  slideBottom: [
    "-translate-y-1 data-[state=visible]:translate-y-0",
    "transition-transform duration-200"
  ],
  slideLeft: [
    "translate-x-1 data-[state=visible]:translate-x-0",
    "transition-transform duration-200"
  ],
  slideRight: [
    "-translate-x-1 data-[state=visible]:translate-x-0",
    "transition-transform duration-200"
  ],
}

export const tooltipPositions = {
  top: {
    base: "bottom-full mb-2",
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  },
  bottom: {
    base: "top-full mt-2",
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  },
  left: {
    base: "right-full mr-2",
    start: "top-0",
    center: "top-1/2 -translate-y-1/2",
    end: "bottom-0",
  },
  right: {
    base: "left-full ml-2",
    start: "top-0",
    center: "top-1/2 -translate-y-1/2",
    end: "bottom-0",
  },
}

export const arrowPositions = {
  top: {
    base: "-bottom-1.5 border-t border-l",
    start: "left-4",
    center: "left-1/2 -translate-x-1/2",
    end: "right-4",
  },
  bottom: {
    base: "-top-1.5 border-b border-r",
    start: "left-4",
    center: "left-1/2 -translate-x-1/2",
    end: "right-4",
  },
  left: {
    base: "-right-1.5 border-l border-b",
    start: "top-4",
    center: "top-1/2 -translate-y-1/2",
    end: "bottom-4",
  },
  right: {
    base: "-left-1.5 border-r border-t",
    start: "top-4",
    center: "top-1/2 -translate-y-1/2",
    end: "bottom-4",
  },
}

export const getTooltipPosition = (
  side: keyof typeof tooltipPositions,
  align: keyof typeof tooltipPositions[keyof typeof tooltipPositions]
) => {
  return [
    tooltipPositions[side].base,
    tooltipPositions[side][align],
    tooltipAnimations.fadeIn,
    tooltipAnimations[`slide${side.charAt(0).toUpperCase()}${side.slice(1)}`]
  ]
}

export const getArrowPosition = (
  side: keyof typeof arrowPositions,
  align: keyof typeof arrowPositions[keyof typeof arrowPositions]
) => {
  return [
    "absolute w-2 h-2 rotate-45 bg-inherit",
    arrowPositions[side].base,
    arrowPositions[side][align]
  ]
}