"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

interface MultiImageViewerProps {
  primaryImage: string
  additionalImages?: string[]
  selectedImageUrl: string
  onImageSelect: (url: string) => void
}

export function MultiImageViewer({ 
  primaryImage, 
  additionalImages = [], 
  selectedImageUrl,
  onImageSelect 
}: MultiImageViewerProps) {
  // Combine primary image with additional images
  const allImages = [primaryImage, ...additionalImages].filter(url => url && url.trim() !== "")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = allImages.findIndex(img => img === selectedImageUrl)
      
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        e.preventDefault()
        onImageSelect(allImages[currentIndex - 1])
      } else if (e.key === "ArrowRight" && currentIndex < allImages.length - 1) {
        e.preventDefault()
        onImageSelect(allImages[currentIndex + 1])
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [allImages, selectedImageUrl, onImageSelect])
  
  // Handle mouse wheel scrolling
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return
    
    const handleWheel = (e: WheelEvent) => {
      // Only handle horizontal scrolling if shift is not pressed
      if (!e.shiftKey) {
        e.preventDefault()
        container.scrollLeft += e.deltaY
      }
    }
    
    container.addEventListener("wheel", handleWheel, { passive: false })
    return () => container.removeEventListener("wheel", handleWheel)
  }, [])
  
  return (
    <div className="space-y-2">
      {/* Thumbnail selector - only show if there are images */}
      {allImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-muted-foreground">
              Select image ({allImages.findIndex(img => img === selectedImageUrl) + 1}/{allImages.length})
            </div>
            <div className="text-xs text-muted-foreground">
              Use ← → or scroll wheel
            </div>
          </div>
          <div 
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto py-2 scroll-smooth"
            style={{ scrollbarWidth: 'thin' }}
          >
            {allImages.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => onImageSelect(imageUrl)}
                className={cn(
                  "flex-shrink-0 rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                  imageUrl === selectedImageUrl 
                    ? "border-primary ring-2 ring-primary/20 focus:ring-primary" 
                    : "border-border hover:border-muted-foreground focus:ring-primary/50"
                )}
                title={index === 0 ? "Primary image (Column B)" : `Additional image ${index} (Column ${String.fromCharCode(65 + 25 + index)})`}
                tabIndex={0}
              >
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt={index === 0 ? "Primary image" : `Additional image ${index}`}
                  className="w-[92px] h-[92px] md:w-[110px] md:h-[110px] object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg?height=110&width=110"
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}