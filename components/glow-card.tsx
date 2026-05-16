import React from 'react'
import { cn } from '@/lib/utils'

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  glowColor?: 'purple' | 'cyan' | 'blue'
  animated?: boolean
  interactive?: boolean
}

export function GlowCard({
  children,
  glowColor = 'purple',
  animated = false,
  interactive = false,
  className,
  ...props
}: GlowCardProps) {
  const glowClasses = {
    purple: 'glow-purple',
    cyan: 'glow-cyan',
    blue: 'shadow-lg shadow-blue-500/30',
  }

  return (
    <div
      className={cn(
        'glassmorphism rounded-lg p-6',
        glowClasses[glowColor],
        animated && 'glow-pulse',
        interactive && 'hover:shadow-2xl transition-shadow duration-300 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
