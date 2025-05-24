"use client"

import { useState, useEffect, type TouchEvent } from "react"

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 100 }: SwipeHandlers) {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  // Reset if we get a new handler
  useEffect(() => {
    setTouchStart(null)
    setTouchEnd(null)
  }, [onSwipeLeft, onSwipeRight])

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null) // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > threshold
    const isRightSwipe = distance < -threshold

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft()
    }

    if (isRightSwipe && onSwipeRight) {
      onSwipeRight()
    }

    // Reset values
    setTouchStart(null)
    setTouchEnd(null)
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}
