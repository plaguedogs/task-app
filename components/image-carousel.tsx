"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSwipe } from "@/hooks/use-swipe"
import { cn } from "@/lib/utils"

interface ImageCarouselProps {
  images: string[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onImageUrlChange: (url: string) => void
}

export function ImageCarousel({ images, currentIndex, onIndexChange, onImageUrlChange }: ImageCarouselProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Update URL when index changes
  useEffect(() => {
    if (images[currentIndex]) {
      onImageUrlChange(images[currentIndex])
    }
  }, [currentIndex, images, onImageUrlChange])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true)
      onIndexChange(currentIndex - 1)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }, [currentIndex, isTransitioning, onIndexChange])

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1 && !isTransitioning) {
      setIsTransitioning(true)
      onIndexChange(currentIndex + 1)
      setTimeout(() => setIsTransitioning(false), 300)
    }
  }, [currentIndex, images.length, isTransitioning, onIndexChange])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrevious, handleNext])

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    threshold: 50,
  })

  if (images.length === 0) {
    return (
      <div className="relative">
        <img
          src="/placeholder.svg"
          alt="No image"
          className="w-full h-auto rounded-lg"
        />
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* Image container with swipe handlers */}
      <div
        className="relative overflow-hidden rounded-lg"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((imageUrl, index) => (
            <img
              key={index}
              src={imageUrl || "/placeholder.svg"}
              alt={`Image ${index + 1}`}
              className="w-full h-auto flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg?height=450&width=800"
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation buttons - always visible for desktop users */}
      {images.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background text-foreground rounded-full shadow-lg",
              "h-10 w-10",
              currentIndex === 0 && "opacity-50 cursor-not-allowed"
            )}
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 bg-background/90 hover:bg-background text-foreground rounded-full shadow-lg",
              "h-10 w-10",
              currentIndex === images.length - 1 && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleNext}
            disabled={currentIndex === images.length - 1}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          {/* Image indicators - bigger and easier to click */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/80 px-3 py-2 rounded-full">
            {images.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-all hover:scale-125",
                  index === currentIndex 
                    ? "bg-primary" 
                    : "bg-muted-foreground/50 hover:bg-muted-foreground"
                )}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true)
                    onIndexChange(index)
                    setTimeout(() => setIsTransitioning(false), 300)
                  }
                }}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}