import { useState, useEffect, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AnimatedListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string | number
  className?: string
  itemClassName?: string
  animationDelay?: number
  staggerDelay?: number
}

export function AnimatedList<T>({
  items,
  renderItem,
  keyExtractor,
  className = "",
  itemClassName = "",
  animationDelay = 0,
  staggerDelay = 50,
}: AnimatedListProps<T>) {
  const [visibleItems, setVisibleItems] = useState<Set<string | number>>(new Set())
  const [removingItems, setRemovingItems] = useState<Set<string | number>>(new Set())
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      // Skip animations, show all items immediately
      setVisibleItems(new Set(items.map(keyExtractor)))
      setHasInitialLoad(true)
      return
    }

    const currentKeys = new Set(items.map(keyExtractor))
    const newKeys = [...currentKeys].filter(key => !visibleItems.has(key))
    
    if (newKeys.length > 0) {
      // Reduce stagger for rapid additions (more than 5 items)
      const effectiveStaggerDelay = newKeys.length > 5 ? Math.max(staggerDelay / 2, 20) : staggerDelay
      
      newKeys.forEach((key, index) => {
        setTimeout(() => {
          setVisibleItems(prev => new Set([...prev, key]))
        }, animationDelay + (index * effectiveStaggerDelay))
      })
    }

    // Remove items that are no longer in the list
    const keysToRemove = [...visibleItems].filter(key => !currentKeys.has(key))
    if (keysToRemove.length > 0) {
      setRemovingItems(new Set(keysToRemove))
      
      // Clean up after animation completes
      setTimeout(() => {
        setVisibleItems(prev => {
          const newSet = new Set(prev)
          keysToRemove.forEach(key => newSet.delete(key))
          return newSet
        })
        setRemovingItems(new Set())
      }, 150) // Shorter duration for exits
    }

    if (!hasInitialLoad) {
      setHasInitialLoad(true)
    }
  }, [items, animationDelay, staggerDelay, keyExtractor, visibleItems, hasInitialLoad])

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => {
        const key = keyExtractor(item, index)
        const isVisible = visibleItems.has(key)
        const isRemoving = removingItems.has(key)
        
        return (
          <div
            key={key}
            className={cn(
              "transition-all ease-spring",
              isVisible && !isRemoving
                ? "opacity-100 translate-x-0 scale-100 duration-200"
                : isRemoving
                ? "opacity-0 -translate-x-3 scale-[0.98] duration-150 ease-natural-in"
                : "opacity-0 translate-x-3 scale-[0.98] duration-200",
              itemClassName
            )}
          >
            {renderItem(item, index)}
          </div>
        )
      })}
    </div>
  )
}

// Specialized component for transaction lists
interface AnimatedTransactionListProps {
  transactions: Array<{
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    date: string
  }>
  className?: string
}

export function AnimatedTransactionList({ 
  transactions, 
  className = "" 
}: AnimatedTransactionListProps) {
  return (
    <AnimatedList
      items={transactions}
      keyExtractor={(transaction) => transaction.id}
      className={className}
      renderItem={(transaction) => (
        <div className="flex items-center justify-between p-3 bg-card border rounded-lg hover-lift">
          <div className="flex-1">
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
          <div className={cn(
            "font-semibold",
            transaction.type === 'income' ? "text-green-600" : "text-red-600"
          )}>
            {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
          </div>
        </div>
      )}
      staggerDelay={75}
    />
  )
}

// Generic staggered grid component
interface StaggeredGridProps {
  children: ReactNode[]
  className?: string
  itemClassName?: string
  columns?: 1 | 2 | 3 | 4
  staggerDelay?: number
}

export function StaggeredGrid({
  children,
  className = "",
  itemClassName = "",
  columns = 1,
  staggerDelay = 100,
}: StaggeredGridProps) {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    children.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => new Set([...prev, index]))
      }, index * staggerDelay)
    })
  }, [children, staggerDelay])

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            "transition-all duration-300 ease-smooth",
            visibleItems.has(index)
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4",
            itemClassName
          )}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
