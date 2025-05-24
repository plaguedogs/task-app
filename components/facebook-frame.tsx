"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSwipe } from "@/hooks/use-swipe"

interface FacebookFrameProps {
  isVisible: boolean
  onClose: () => void
}

export function FacebookFrame({ isVisible, onClose }: FacebookFrameProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  // Reset loaded state when visibility changes
  useEffect(() => {
    if (!isVisible) {
      setIsLoaded(false)
    }
  }, [isVisible])

  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeLeft: onClose,
  })

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-white flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center p-2 border-b">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-semibold text-[#1877f2]">Facebook</h2>
      </div>

      <div className="flex-1 relative">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1877f2]"></div>
          </div>
        )}

        <iframe
          src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Ffacebook&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
          width="100%"
          height="100%"
          style={{ border: "none", overflow: "hidden" }}
          scrolling="no"
          frameBorder="0"
          allowFullScreen={true}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          onLoad={() => setIsLoaded(true)}
          className={isLoaded ? "opacity-100" : "opacity-0"}
        ></iframe>
      </div>

      <div className="p-2 text-center text-sm text-gray-500 border-t">Swipe left to return to the app</div>
    </div>
  )
}
