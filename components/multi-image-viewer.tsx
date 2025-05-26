"use client"

import { cn } from "@/lib/utils"

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
  
  return (
    <div className="space-y-4">
      {/* Main selected image display */}
      <div className="relative overflow-hidden rounded-lg bg-muted">
        <img
          src={selectedImageUrl || primaryImage || "/placeholder.svg"}
          alt="Selected image"
          className="w-full h-auto max-h-[150px] md:max-h-[200px] object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=300"
          }}
        />
      </div>

      {/* Thumbnail previews - only show if there are multiple images */}
      {allImages.length > 1 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Select image ({allImages.findIndex(img => img === selectedImageUrl) + 1}/{allImages.length})
          </div>
          <div className="flex gap-2 overflow-x-auto py-2">
            {allImages.map((imageUrl, index) => (
              <button
                key={index}
                onClick={() => onImageSelect(imageUrl)}
                className={cn(
                  "flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                  imageUrl === selectedImageUrl ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-muted-foreground"
                )}
                title={index === 0 ? "Primary image (Column C)" : `Additional image ${index} (Column ${String.fromCharCode(65 + 25 + index)})`}
              >
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt={index === 0 ? "Primary image" : `Additional image ${index}`}
                  className="w-20 h-20 md:w-24 md:h-24 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.svg?height=96&width=96"
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