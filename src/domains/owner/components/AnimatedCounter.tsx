'use client'

import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  format?: boolean
}

export function AnimatedCounter({ value, duration = 1500, format = true }: AnimatedCounterProps) {
  const safeValue = Number(value) || 0
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTimestamp: number | null = null
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      
      setCount(Math.floor(easeProgress * safeValue))

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setCount(safeValue)
      }
    }
    
    window.requestAnimationFrame(step)
  }, [safeValue, duration])

  return (
    <span>{format ? count.toLocaleString('en-US') : count}</span>
  )
}
