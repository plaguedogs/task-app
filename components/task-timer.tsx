"use client"

import { useState, useEffect } from "react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { useTheme } from "@/contexts/theme-context"

interface TaskTimerProps {
  minDuration: number
  maxDuration: number
  isRunning: boolean
  onTimerEnd: () => void
}

export function TaskTimer({ minDuration, maxDuration, isRunning, onTimerEnd }: TaskTimerProps) {
  const { currentColors } = useTheme()
  const [duration, setDuration] = useState(() => {
    // Generate a random duration between min and max on initial render
    return Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration
  })
  const [timeLeft, setTimeLeft] = useState(duration)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    setTimeLeft(duration)
    setProgress(100)
  }, [duration])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1
          return newTime >= 0 ? newTime : 0
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      onTimerEnd()
    }
  }, [isRunning, timeLeft, onTimerEnd])

  useEffect(() => {
    setProgress((timeLeft / duration) * 100)
  }, [timeLeft, duration])

  useEffect(() => {
    // When isRunning changes to false (timer stops), generate a new random duration for next time
    if (!isRunning) {
      const newDuration = Math.floor(Math.random() * (maxDuration - minDuration + 1)) + minDuration
      setDuration(newDuration)
      setTimeLeft(newDuration)
      setProgress(100)
    }
  }, [isRunning, minDuration, maxDuration])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 md:w-12 md:h-12">
        <CircularProgressbar
          value={progress}
          text={formatTime(timeLeft)}
          styles={buildStyles({
            textSize: "32px",
            pathColor: isRunning ? currentColors.primary : currentColors.mutedForeground,
            textColor: currentColors.foreground,
            trailColor: currentColors.muted,
          })}
        />
      </div>
      <p className="text-[10px] text-gray-500 mt-0.5">
        {isRunning ? "Timer running..." : `Random timer: ${formatTime(duration)}`}
      </p>
    </div>
  )
}