/**
 * Animation Test Component
 * 
 * A component for testing and validating animation refinements,
 * including reduced motion compliance.
 */

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimatedCard, AnimatedModal } from '@/components/ui/page-transition'
import { AnimatedList } from '@/components/ui/animated-list'
import { useAnimation, useModalAnimation, useListAnimation } from '@/hooks/use-animation'
import { cn } from '@/lib/utils'

interface TestItem {
  id: string
  title: string
  description: string
}

export function AnimationTest() {
  const [showModal, setShowModal] = useState(false)
  const [items, setItems] = useState<TestItem[]>([
    { id: '1', title: 'First Item', description: 'Initial item for testing' },
    { id: '2', title: 'Second Item', description: 'Another test item' },
  ])

  const cardAnimation = useAnimation({ delay: 100, easing: 'spring' })
  const modalAnimation = useModalAnimation(showModal)
  const listAnimation = useListAnimation(items, {
    keyExtractor: (item) => item.id,
    stagger: 75,
    maxStagger: 3
  })

  const addItem = () => {
    const newItem: TestItem = {
      id: Date.now().toString(),
      title: `Item ${items.length + 1}`,
      description: `Description for item ${items.length + 1}`
    }
    setItems(prev => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const triggerCardAnimation = () => {
    cardAnimation.reset()
    setTimeout(() => cardAnimation.trigger(), 50)
  }

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Animation Testing</h2>
        <p className="text-muted-foreground">
          Test natural animations with automatic reduced motion support.
          Try changing your system's motion preferences to see the difference.
        </p>
        
        {cardAnimation.reducedMotion && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              ✓ Reduced motion detected - animations are disabled for accessibility
            </p>
          </div>
        )}
      </div>

      {/* Card Animation Test */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Card Animation</h3>
        <div className="flex gap-4">
          <Button onClick={triggerCardAnimation}>
            Trigger Card Animation
          </Button>
          <Button variant="outline" onClick={cardAnimation.reset}>
            Reset
          </Button>
        </div>
        
        <AnimatedCard
          origin="bottom"
          delay={0}
          className={cn(
            cardAnimation.transitionClasses,
            cardAnimation.isVisible 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 translate-y-4"
          )}
        >
          <Card className="p-6 border-2 border-primary/20">
            <h4 className="font-semibold">Animated Card</h4>
            <p className="text-muted-foreground mt-2">
              This card animates with natural motion curves.
              {cardAnimation.reducedMotion ? ' (Reduced motion active)' : ''}
            </p>
          </Card>
        </AnimatedCard>
      </section>

      {/* Modal Animation Test */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Modal Animation</h3>
        <Button onClick={() => setShowModal(true)}>
          Open Modal
        </Button>
        
        {modalAnimation.shouldRender && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className={cn(
                "absolute inset-0 bg-black/50",
                modalAnimation.overlayClasses
              )}
              onClick={() => setShowModal(false)}
            />
            
            {/* Modal Content */}
            <div className={cn(
              "relative bg-background border rounded-lg p-6 m-4 max-w-md w-full",
              modalAnimation.contentClasses
            )}>
              <h4 className="font-semibold mb-2">Test Modal</h4>
              <p className="text-muted-foreground mb-4">
                This modal uses natural enter/exit animations.
                {modalAnimation.reducedMotion ? ' (Reduced motion active)' : ''}
              </p>
              <Button onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* List Animation Test */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">List Animation</h3>
        <div className="flex gap-4">
          <Button onClick={addItem}>
            Add Item
          </Button>
          <Button 
            variant="outline" 
            onClick={() => items.length > 0 && removeItem(items[items.length - 1].id)}
          >
            Remove Last
          </Button>
        </div>
        
        <div className="space-y-2">
          {items.map((item, index) => {
            const itemState = listAnimation.getItemState(item, index)
            
            return (
              <div
                key={itemState.key}
                className={cn(
                  itemState.transitionClasses,
                  itemState.isVisible && !itemState.isRemoving
                    ? "opacity-100 translate-x-0 scale-100"
                    : itemState.isRemoving
                    ? "opacity-0 -translate-x-3 scale-[0.98]"
                    : "opacity-0 translate-x-3 scale-[0.98]"
                )}
              >
                <Card className="p-4 border border-border/50 hover:border-primary/30 cursor-pointer hover-lift">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{item.title}</h5>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
        
        {listAnimation.reducedMotion && (
          <p className="text-sm text-muted-foreground">
            Note: List animations are disabled due to reduced motion preference.
          </p>
        )}
      </section>

      {/* Button Animation Test */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Button Interactions</h3>
        <div className="flex gap-4 flex-wrap">
          <Button className="button-press">
            Primary Button
          </Button>
          <Button variant="outline" className="button-press">
            Outline Button
          </Button>
          <Button variant="secondary" className="button-press">
            Secondary Button
          </Button>
          <Button variant="ghost" className="button-press">
            Ghost Button
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Buttons have subtle press animations with natural easing curves.
        </p>
      </section>

      {/* Performance Info */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Performance Features</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <h4 className="font-medium mb-2">✓ Reduced Motion Support</h4>
            <p className="text-sm text-muted-foreground">
              Automatically respects user's motion preferences
            </p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium mb-2">✓ Intelligent Staggering</h4>
            <p className="text-sm text-muted-foreground">
              Reduces delays for large lists automatically
            </p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium mb-2">✓ Natural Easing</h4>
            <p className="text-sm text-muted-foreground">
              Physics-based curves for realistic motion
            </p>
          </Card>
          <Card className="p-4">
            <h4 className="font-medium mb-2">✓ Context Aware</h4>
            <p className="text-sm text-muted-foreground">
              Different animations for different interaction types
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default AnimationTest
