"use client"

import { useEffect, useState } from 'react'

export function BackgroundPattern() {
  const [borderColor, setBorderColor] = useState('rgba(0, 0, 0, 0.1)')

  useEffect(() => {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--border')
    setBorderColor(color)
  }, [])

  return (
    <div 
      className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, ${borderColor} 1px, transparent 0)`,
        backgroundSize: "32px 32px",
      }}
    />
  )
}