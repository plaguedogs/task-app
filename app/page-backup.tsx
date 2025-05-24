"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Cog,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Play,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { useSwipe } from "@/hooks/use-swipe"
import { TaskTimer } from "@/components/task-timer"
import { FacebookFrame } from "@/components/facebook-frame"
import { fetchGoogleSheetData } from "@/lib/google-sheets"
import Link from "next/link"

// Task interface
interface Task {
  id: number
  imageUrl: string
  clickbaitPhrase: string
  affiliateLink: string
  affiliateTitle: string
  completed: boolean
}

// Default mock data to use when no settings are found
const DEFAULT_MOCK_DATA: Task[] = [
  {
    id: 1,
    imageUrl: "https://picsum.photos/800/450",
    clickbaitPhrase: "You won't believe what happens when you click this link!",
    affiliateLink: "https://example.com/affiliate/1",
    affiliateTitle: "Amazing Product #1",
    completed: false,
  },
  {
    id: 2,
    imageUrl: "https://picsum.photos/800/451",
    clickbaitPhrase: "This simple trick will change your life forever!",
    affiliateLink: "https://example.com/affiliate/2",
    affiliateTitle: "Amazing Product #2",
    completed: false,
  },
  {
    id: 3,
    imageUrl: "https://picsum.photos/800/452",
    clickbaitPhrase: "Scientists are shocked by this new discovery!",
    affiliateLink: "https://example.com/affiliate/3",
    affiliateTitle: "Amazing Product #3",
    completed: false,
  },
]

export default function Home() {
  const { toast } = useToast()
  const isMobile = useMobile()
  const initialLoadRef = useRef(true)

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [clickbaitPhrase, setClickbaitPhrase] = useState("")
  const [isCompleted, setIsCompleted] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [minTimerDuration, setMinTimerDuration] = useState(5 * 60) // 5 minutes in seconds
  const [maxTimerDuration, setMaxTimerDuration] = useState(10 * 60) // 10 minutes in seconds
  const [timerEnded, setTimerEnded] = useState(false)
  const [copiedStates, setCopiedStates] = useState({
    imageUrl: false,
    clickbaitPhrase: false,
    affiliateLink: false,
  })
  const [showFacebook, setShowFacebook] = useState(false)
  const [settingsConfigured, setSettingsConfigured] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)

  // Swipe handlers for Facebook navigation
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipeRight: () => {
      if (isMobile && !showFacebook) {
        setShowFacebook(true)
      }
    },
  })

  // Load settings and timer duration
  useEffect(() => {
    const savedSettings = localStorage.getItem("settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      const minTimer = Number.parseInt(settings.minTimer) || 5
      const maxTimer = Number.parseInt(settings.maxTimer) || 10
      setMinTimerDuration(minTimer * 60)
      setMaxTimerDuration(maxTimer * 60)
      setSettingsConfigured(true)
    } else {
      // No settings found, we'll use default values
      setSettingsConfigured(false)
    }
  }, [])

  // Update the fetchData function to handle the new data structure
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setUsingMockData(false)
    try {
      const savedSettings = localStorage.getItem("settings")

      // If no settings found, use mock data but don't show an error
      if (!savedSettings) {
        console.log("No settings found, using mock data")
        setTasks(DEFAULT_MOCK_DATA)
        setTotalPages(DEFAULT_MOCK_DATA.length)
        setSettingsConfigured(false)
        setUsingMockData(true)
        return
      }

      const settings = JSON.parse(savedSettings)
      const { googleSheetId, serviceAccountEmail, serviceAccountKey } = settings

      if (!googleSheetId) {
        console.log("Google Sheet ID not found in settings, using mock data")
        setTasks(DEFAULT_MOCK_DATA)
        setTotalPages(DEFAULT_MOCK_DATA.length)
        setUsingMockData(true)
        return
      }

      // Fetch data from Google Sheets
      const data = await fetchGoogleSheetData(googleSheetId, serviceAccountEmail, serviceAccountKey)

      // Check if we got mock data back
      const isMockData = JSON.stringify(data) === JSON.stringify(mockFetchGoogleSheetData())
      setUsingMockData(isMockData)

      if (isMockData) {
        console.log("Received mock data from fetchGoogleSheetData")
      }

      if (!data || data.length === 0) {
        throw new Error("No data found in Google Sheet.")
      }

      // Transform data to Task format - UPDATED for new column structure
      // A: Affiliate link, B: Image URL, C: Clickbait phrase
      const transformedData: Task[] = data.map((row, index) => ({
        id: index + 1,
        imageUrl: row[1] || "", // Column B: Image URL
        clickbaitPhrase: row[2] || "", // Column C: Clickbait phrase
        affiliateLink: row[0] || "", // Column A: Affiliate link
        affiliateTitle: "View Product", // Default title since we don't have this in the sheet
        completed: false,
      }))

      setTasks(transformedData)
      setTotalPages(transformedData.length)

      // Load completion status from localStorage
      const savedTasks = localStorage.getItem("completedTasks")
      if (savedTasks) {
        const completedTasks = JSON.parse(savedTasks)

        // Update completion status in tasks
        transformedData.forEach((task) => {
          if (completedTasks[task.id] !== undefined) {
            task.completed = completedTasks[task.id]
          }
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error)

      // Only show toast for errors other than missing settings
      if (error instanceof Error && !error.message.includes("Settings not found")) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to fetch data from Google Sheets",
          variant: "destructive",
        })
      }

      // Use mock data as fallback
      setTasks(DEFAULT_MOCK_DATA)
      setTotalPages(DEFAULT_MOCK_DATA.length)
      setUsingMockData(true)
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Initial data fetch
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false
      fetchData()
    }
  }, [fetchData])

  // Load task data based on current page - with proper checks to prevent infinite loops
  useEffect(() => {
    if (!isLoading && tasks.length > 0) {
      const index = currentPage - 1
      if (index >= 0 && index < tasks.length) {
        const task = tasks[index]
        setCurrentTask(task)
        setClickbaitPhrase(task.clickbaitPhrase)
        setIsCompleted(task.completed)
        setTimerEnded(false)
      }
    }
  }, [currentPage, tasks, isLoading])

  // Save completion status to local storage
  useEffect(() => {
    if (currentTask) {
      const savedTasks = localStorage.getItem("completedTasks")
      const completedTasks = savedTasks ? JSON.parse(savedTasks) : {}

      completedTasks[currentTask.id] = isCompleted
      localStorage.setItem("completedTasks", JSON.stringify(completedTasks))

      // Update tasks array without triggering re-renders
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          task.id === currentTask.id ? { ...task, completed: isCompleted } : task,
        )

        // Only return a new array if something changed
        const hasChanged = updatedTasks.some((task, i) => task.completed !== prevTasks[i].completed)
        return hasChanged ? updatedTasks : prevTasks
      })
    }
  }, [isCompleted, currentTask])

  // Also update the handleRefresh function with the same data mapping logic
  const handleRefresh = () => {
    // Show loading toast
    toast({
      title: "Refreshing data",
      description: "Attempting to fetch real data from Google Sheets",
    })

    // Force real data fetch
    setIsRefreshing(true)
    try {
      const savedSettings = localStorage.getItem("settings")
      if (!savedSettings) {
        toast({
          title: "Settings not found",
          description: "Please configure your Google Sheets integration in settings",
          variant: "destructive",
        })
        setIsRefreshing(false)
        return
      }

      const settings = JSON.parse(savedSettings)
      const { googleSheetId, serviceAccountEmail, serviceAccountKey } = settings

      if (!googleSheetId) {
        toast({
          title: "Google Sheet ID missing",
          description: "Please add your Google Sheet ID in settings",
          variant: "destructive",
        })
        setIsRefreshing(false)
        return
      }

      // Log the settings we're using (without the private key for security)
      console.log("Fetching with settings:", {
        googleSheetId,
        serviceAccountEmail: serviceAccountEmail ? "✓ Provided" : "✗ Missing",
        serviceAccountKey: serviceAccountKey ? "✓ Provided" : "✗ Missing",
      })

      // Fetch real data from Google Sheets
      fetchGoogleSheetData(googleSheetId, serviceAccountEmail, serviceAccountKey)
        .then((data) => {
          if (!data || data.length === 0) {
            throw new Error("No data found in Google Sheet.")
          }

          // Check if we got mock data back
          const isMockData = JSON.stringify(data) === JSON.stringify(mockFetchGoogleSheetData())
          setUsingMockData(isMockData)

          if (isMockData) {
            toast({
              title: "Using Mock Data",
              description: "Could not connect to Google Sheets. Check your settings and try again.",
              variant: "warning",
            })
          }

          // Transform data to Task format - UPDATED for new column structure
          // A: Affiliate link, B: Image URL, C: Clickbait phrase
          const transformedData: Task[] = data.map((row, index) => ({
            id: index + 1,
            imageUrl: row[1] || "", // Column B: Image URL
            clickbaitPhrase: row[2] || "", // Column C: Clickbait phrase
            affiliateLink: row[0] || "", // Column A: Affiliate link
            affiliateTitle: "View Product", // Default title since we don't have this in the sheet
            completed: false,
          }))

          // Load completion status from localStorage
          const savedTasks = localStorage.getItem("completedTasks")
          if (savedTasks) {
            const completedTasks = JSON.parse(savedTasks)
            transformedData.forEach((task) => {
              if (completedTasks[task.id] !== undefined) {
                task.completed = completedTasks[task.id]
              }
            })
          }

          setTasks(transformedData)
          setTotalPages(transformedData.length)

          if (!isMockData) {
            toast({
              title: "Success",
              description: `Loaded ${transformedData.length} tasks from Google Sheets`,
            })
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error)
          toast({
            title: "Error fetching data",
            description: error instanceof Error ? error.message : "Failed to fetch data from Google Sheets",
            variant: "destructive",
          })
          setUsingMockData(true)
        })
        .finally(() => {
          setIsRefreshing(false)
        })
    } catch (error) {
      console.error("Error processing settings:", error)
      toast({
        title: "Error",
        description: "Failed to process settings",
        variant: "destructive",
      })
      setIsRefreshing(false)
      setUsingMockData(true)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleStartTimer = () => {
    setIsTimerRunning(true)
    setTimerEnded(false)
  }

  const handleTimerEnd = () => {
    setIsTimerRunning(false)
    setTimerEnded(true)

    // Play notification sound
    const audio = new Audio("/notification.mp3")
    audio.play()

    toast({
      title: "Timer Ended!",
      description: "Your task timer has completed.",
      variant: "destructive",
    })
  }

  const openFacebook = () => {
    if (isMobile) {
      // On mobile, show the Facebook frame
      setShowFacebook(true)
    } else {
      // On desktop, open Facebook in a new tab
      window.open("https://facebook.com", "_blank")
    }
  }

  const openGoogleSheet = () => {
    const savedSettings = localStorage.getItem("settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      const { googleSheetId } = settings

      if (googleSheetId) {
        window.open(`https://docs.google.com/spreadsheets/d/${googleSheetId}/edit`, "_blank")
        return
      }
    }

    // Fallback
    window.open("https://docs.google.com/spreadsheets", "_blank")
  }

  const copyToClipboard = (text: string, field: keyof typeof copiedStates) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Show copied state
        setCopiedStates((prev) => ({ ...prev, [field]: true }))

        // Reset after 2 seconds
        setTimeout(() => {
          setCopiedStates((prev) => ({ ...prev, [field]: false }))
        }, 2000)

        toast({
          title: "Copied!",
          description: "Text copied to clipboard",
        })
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Error",
          description: "Failed to copy text",
          variant: "destructive",
        })
      },
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1877f2] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-[#f0f2f5] relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Facebook Frame (shown when swiping right) */}
      <FacebookFrame isVisible={showFacebook} onClose={() => setShowFacebook(false)} />

      {/* Swipe indicator - only visible on mobile */}
      {isMobile && (
        <div className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-[#1877f2]/10 text-[#1877f2] px-1 py-3 rounded-l-md z-10">
          <div className="text-xs font-medium rotate-90">Swipe right for Facebook</div>
        </div>
      )}

      {/* Facebook-style header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-[#1877f2] font-bold text-xl md:text-2xl">Task #{currentTask?.id}</h1>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="rounded-full bg-gray-200 hover:bg-gray-300"
              aria-label="Fetch real data from Google Sheet"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-5 w-5 text-gray-700 animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5 text-gray-700" />
              )}
            </Button>

            <Link href="/settings">
              <Button variant="ghost" size="icon" className="rounded-full bg-gray-200 hover:bg-gray-300">
                <Cog className="h-5 w-5 text-gray-700" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        {/* Settings not configured warning */}
        {!settingsConfigured && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Google Sheets not configured</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You're currently viewing sample data. To connect to your Google Sheet, please{" "}
                <Link href="/settings" className="text-[#1877f2] font-medium hover:underline">
                  configure your settings
                </Link>
                .
              </p>
            </div>
          </div>
        )}

        {/* Using mock data warning */}
        {settingsConfigured && usingMockData && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Using Sample Data</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Could not connect to your Google Sheet. Please check your Google Sheet ID and make sure your sheet is
                publicly accessible.
                <br />
                <Link href="/settings" className="text-[#1877f2] font-medium hover:underline">
                  Update settings
                </Link>{" "}
                or{" "}
                <button onClick={handleRefresh} className="text-[#1877f2] font-medium hover:underline">
                  try again
                </button>
                .
              </p>
            </div>
          </div>
        )}

        {/* Use flex column on mobile, grid on larger screens */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 md:gap-6">
          {/* Main content area - full width on mobile */}
          <div className="lg:col-span-8 space-y-4 md:space-y-6 order-1">
            {/* Image card */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="space-y-4">
                {/* Image URL field - moved above image preview */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (from Google Sheet Column B)
                  </label>
                  <div className="flex">
                    <Input value={currentTask?.imageUrl || ""} readOnly className="bg-gray-50 pr-10" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-7 h-10 w-10"
                      onClick={() => copyToClipboard(currentTask?.imageUrl || "", "imageUrl")}
                    >
                      {copiedStates.imageUrl ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Image preview */}
                <div className="relative">
                  <img
                    src={currentTask?.imageUrl || "/placeholder.svg"}
                    alt="Task image"
                    className="w-full h-auto rounded-lg"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=450&width=800"
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clickbait Phrase (from Google Sheet Column C)
                    </label>
                    <div className="flex">
                      <Textarea
                        value={clickbaitPhrase}
                        onChange={(e) => setClickbaitPhrase(e.target.value)}
                        className="min-h-[80px] pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-7 h-10 w-10"
                        onClick={() => copyToClipboard(clickbaitPhrase, "clickbaitPhrase")}
                      >
                        {copiedStates.clickbaitPhrase ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <a
                      href={currentTask?.affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1877f2] font-medium hover:underline flex items-center"
                    >
                      {currentTask?.affiliateTitle}
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                    <div className="relative mt-1">
                      <Input value={currentTask?.affiliateLink || ""} readOnly className="bg-gray-50 pr-10" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10"
                        onClick={() => copyToClipboard(currentTask?.affiliateLink || "", "affiliateLink")}
                      >
                        {copiedStates.affiliateLink ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task completion and navigation */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="task-completed"
                    checked={isCompleted}
                    onCheckedChange={(checked) => setIsCompleted(!!checked)}
                  />
                  <label htmlFor="task-completed" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Mark task as completed
                  </label>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={openGoogleSheet}>
                    Sheet
                  </Button>

                  <div className="flex items-center space-x-1 bg-gray-100 rounded-md px-2 py-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <span className="text-sm font-medium">
                      {currentPage} / {totalPages}
                    </span>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar content - moved to bottom on mobile with flex order */}
          <div className="lg:col-span-4 order-2 mt-4 lg:mt-0">
            {/* Use grid on mobile to place cards side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6">
              {/* Timer card */}
              <div
                className={`bg-white rounded-lg shadow p-4 ${timerEnded ? "animate-pulse border-2 border-red-500" : ""}`}
              >
                <h2 className="font-semibold text-lg mb-3">Task Timer</h2>

                <TaskTimer
                  minDuration={minTimerDuration}
                  maxDuration={maxTimerDuration}
                  isRunning={isTimerRunning}
                  onTimerEnd={handleTimerEnd}
                />

                <Button
                  onClick={handleStartTimer}
                  disabled={isTimerRunning}
                  className="w-full mt-4 bg-[#1877f2] hover:bg-[#166fe5]"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Timer
                </Button>
              </div>

              {/* Facebook buttons */}
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-lg mb-3">Launch Facebook</h2>

                <div className="space-y-3">
                  <Button onClick={openFacebook} className="w-full bg-[#1877f2] hover:bg-[#166fe5]">
                    Open Facebook
                  </Button>

                  {isMobile && (
                    <p className="text-xs text-center text-gray-500">
                      Tip: Swipe right anywhere on screen to access Facebook
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper function to get mock data for comparison
function mockFetchGoogleSheetData(): string[][] {
  return [
    [
      "1",
      "https://picsum.photos/800/450",
      "You won't believe what happens when you click this link!",
      "https://example.com/affiliate/1",
      "Amazing Product #1",
    ],
    [
      "2",
      "https://picsum.photos/800/451",
      "This simple trick will change your life forever!",
      "https://example.com/affiliate/2",
      "Amazing Product #2",
    ],
    [
      "3",
      "https://picsum.photos/800/452",
      "Scientists are shocked by this new discovery!",
      "https://example.com/affiliate/3",
      "Amazing Product #3",
    ],
    [
      "4",
      "https://picsum.photos/800/453",
      "10 secrets they don't want you to know!",
      "https://example.com/affiliate/4",
      "Amazing Product #4",
    ],
    [
      "5",
      "https://picsum.photos/800/454",
      "The one weird trick that doctors hate!",
      "https://example.com/affiliate/5",
      "Amazing Product #5",
    ],
  ]
}
