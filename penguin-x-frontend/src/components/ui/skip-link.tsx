import React from 'react'
import { cn } from '@/lib/utils'

interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "skip-link",
        className
      )}
      onFocus={(e) => {
        // Ensure the target element exists and is focusable
        const target = document.querySelector(href)
        if (target) {
          (target as HTMLElement).tabIndex = -1
        }
      }}
    >
      {children}
    </a>
  )
}
