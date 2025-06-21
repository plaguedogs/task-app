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
import { TaskTimer } from "@/components/task-timer"
import { MultiImageViewer } from "@/components/multi-image-viewer"
import { fetchGoogleSheetData } from "@/lib/google-sheets"
import Link from "next/link"
import { useTheme } from "@/contexts/theme-context"

// Task interface
interface Task {
  id: number
  imageUrl: string
  clickbaitPhrase: string
  affiliateLink: string
  affiliateTitle: string
  completed: boolean
  additionalImages?: string[] // Added for columns AA-AZ
  selectedImageUrl?: string // Track which image is currently selected
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
    additionalImages: ["https://picsum.photos/800/453", "https://picsum.photos/800/454"],
  },
  {
    id: 2,
    imageUrl: "https://picsum.photos/800/451",
    clickbaitPhrase: "This simple trick will change your life forever!",
    affiliateLink: "https://example.com/affiliate/2",
    affiliateTitle: "Amazing Product #2",
    completed: false,
    additionalImages: ["https://picsum.photos/800/455", "https://picsum.photos/800/456"],
  },
  {
    id: 3,
    imageUrl: "https://picsum.photos/800/452",
    clickbaitPhrase: "Scientists are shocked by this new discovery!",
    affiliateLink: "https://example.com/affiliate/3",
    affiliateTitle: "Amazing Product #3",
    completed: false,
    additionalImages: ["https://picsum.photos/800/457"],
  },
]

export default function Home() {
  const { toast } = useToast()
  const { currentColors } = useTheme()
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
  // Facebook frame state removed - no longer needed
  const [settingsConfigured, setSettingsConfigured] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("") // Track selected image URL

  // Remove swipe handlers - no longer needed

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
      // A: Affiliate link, B: Image URL, C: Clickbait phrase, AA-AZ: Additional images
      const transformedData: Task[] = data.map((row, index) => {
        // Extract additional images from columns AA-AZ (index 26-51)
        const additionalImages: string[] = []
        for (let i = 26; i <= 51 && i < row.length; i++) {
          if (row[i] && row[i].trim() !== "") {
            additionalImages.push(row[i])
          }
        }
        
        return {
          id: index + 1,
          imageUrl: row[1] || "", // Column B: Image URL
          clickbaitPhrase: row[2] || "", // Column C: Clickbait phrase
          affiliateLink: row[0] || "", // Column A: Affiliate link
          affiliateTitle: "View Product", // Default title since we don't have this in the sheet
          completed: false,
          additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
        }
      })

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
        setSelectedImageUrl(task.imageUrl) // Default to primary image
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
          // A: Affiliate link, B: Image URL, C: Clickbait phrase, AA-AZ: Additional images
          const transformedData: Task[] = data.map((row, index) => {
            // Extract additional images from columns AA-AZ (index 26-51)
            const additionalImages: string[] = []
            for (let i = 26; i <= 51 && i < row.length; i++) {
              if (row[i] && row[i].trim() !== "") {
                additionalImages.push(row[i])
              }
            }
            
            return {
              id: index + 1,
              imageUrl: row[1] || "", // Column B: Image URL
              clickbaitPhrase: row[2] || "", // Column C: Clickbait phrase
              affiliateLink: row[0] || "", // Column A: Affiliate link
              affiliateTitle: "View Product", // Default title since we don't have this in the sheet
              completed: false,
              additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
            }
          })

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
    } else {
      // Circle to last page
      setCurrentPage(totalPages)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    } else {
      // Circle to first page
      setCurrentPage(1)
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
    // Always open in browser/new tab to ensure it opens in mobile browser, not app
    // Using window.location for mobile to force browser
    if (isMobile) {
      // This forces mobile browser instead of app
      window.location.href = "https://m.facebook.com";
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="container mx-auto px-4 py-4 flex-1 max-w-4xl">
        {/* Settings not configured warning */}
        {!settingsConfigured && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-800">Google Sheets not configured</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You're currently viewing sample data. To connect to your Google Sheet, please{" "}
                <Link href="/settings" className="text-primary font-medium hover:underline">
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
                <Link href="/settings" className="text-primary font-medium hover:underline">
                  Update settings
                </Link>{" "}
                or{" "}
                <button onClick={handleRefresh} className="text-primary font-medium hover:underline">
                  try again
                </button>
                .
              </p>
            </div>
          </div>
        )}

        {/* Header section */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-primary font-bold text-xl md:text-2xl">Task #{currentTask?.id}</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="rounded-full bg-muted hover:bg-muted/80"
              aria-label="Fetch real data from Google Sheet"
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              ) : (
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="rounded-full bg-muted hover:bg-muted/80">
                <Cog className="h-5 w-5 text-muted-foreground" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main content area */}
        <div className="space-y-2 md:space-y-4">
            {/* Image card */}
            <div className="bg-card rounded-lg shadow p-2 md:p-4">
              <div className="space-y-2">
                {/* Selected Image URL field */}
                <div className="relative">
                  <label className="block text-xs md:text-sm font-medium text-foreground mb-1">
                    Selected Image URL
                  </label>
                  <div className="flex">
                    <Input value={selectedImageUrl || ""} readOnly className="bg-muted pr-10 text-sm" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-6 h-8 w-8 hover:bg-primary/10"
                      onClick={() => copyToClipboard(selectedImageUrl || "", "imageUrl")}
                    >
                      {copiedStates.imageUrl ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-primary" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Multi-image viewer */}
                <MultiImageViewer
                  primaryImage={currentTask?.imageUrl || ""}
                  additionalImages={currentTask?.additionalImages}
                  selectedImageUrl={selectedImageUrl}
                  onImageSelect={setSelectedImageUrl}
                />

                <div className="space-y-2">
                  <div className="relative">
                    <label className="block text-xs md:text-sm font-medium text-foreground mb-1">
                      Clickbait Phrase (from Google Sheet Column B)
                    </label>
                    <div className="flex">
                      <Textarea
                        value={clickbaitPhrase}
                        onChange={(e) => setClickbaitPhrase(e.target.value)}
                        className="min-h-[60px] md:min-h-[80px] pr-10 text-sm"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-7 h-10 w-10 hover:bg-primary/10"
                        onClick={() => copyToClipboard(clickbaitPhrase, "clickbaitPhrase")}
                      >
                        {copiedStates.clickbaitPhrase ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <a
                      href={currentTask?.affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium hover:underline flex items-center"
                    >
                      {currentTask?.affiliateTitle}
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                    <div className="relative mt-1">
                      <Input value={currentTask?.affiliateLink || ""} readOnly className="bg-muted pr-10 text-sm" />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-10 w-10 hover:bg-primary/10"
                        onClick={() => copyToClipboard(currentTask?.affiliateLink || "", "affiliateLink")}
                      >
                        {copiedStates.affiliateLink ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-primary" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Task completion and navigation */}
            <div className="bg-card rounded-lg shadow p-2 md:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="task-completed"
                    checked={isCompleted}
                    onCheckedChange={(checked) => setIsCompleted(!!checked)}
                  />
                  <label htmlFor="task-completed" className="text-xs md:text-sm font-medium text-foreground cursor-pointer">
                    Mark completed
                  </label>
                </div>

                {/* Big navigation buttons */}
                <div className="flex items-center gap-2">
                  <Button 
                    onClick={handlePrevPage}
                    size="default"
                    variant="default"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleNextPage}
                    size="default"
                    variant="default"
                  >
                    Forward
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom controls - integrated into main layout */}
            <div className="bg-card rounded-lg shadow p-2 md:p-4 mt-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Facebook and Sheet buttons */}
                <div className="flex items-center gap-2">
                  <Button onClick={openFacebook} size="sm" variant="default">
                    <ExternalLink className="mr-1 h-3 w-3" />
                    FB
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={openGoogleSheet}
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    Sheet
                  </Button>
                </div>

                {/* Page number - middle */}
                <div className="bg-muted rounded-md px-3 py-1">
                  <span className="text-xs font-medium">
                    {currentPage} / {totalPages}
                  </span>
                </div>

                {/* Timer section */}
                <div className="flex items-center gap-2">
                  <TaskTimer
                    minDuration={minTimerDuration}
                    maxDuration={maxTimerDuration}
                    isRunning={isTimerRunning}
                    onTimerEnd={handleTimerEnd}
                  />
                  <Button
                    onClick={handleStartTimer}
                    disabled={isTimerRunning}
                    size="sm"
                    variant={timerEnded ? "destructive" : "default"}
                    className={timerEnded ? "animate-pulse" : ""}
                  >
                    {isTimerRunning ? (
                      <Play className="h-3 w-3" />
                    ) : (
                      "Start"
                    )}
                  </Button>
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
      "https://example.com/affiliate/1", // Column A: Affiliate link
      "https://picsum.photos/800/450", // Column B: Image URL
      "You won't believe what happens when you click this link!", // Column C: Clickbait phrase
    ],
    [
      "https://example.com/affiliate/2",
      "https://picsum.photos/800/451",
      "This simple trick will change your life forever!",
    ],
    [
      "https://example.com/affiliate/3",
      "https://picsum.photos/800/452",
      "Scientists are shocked by this new discovery!",
    ],
    [
      "https://example.com/affiliate/4",
      "https://picsum.photos/800/453",
      "10 secrets they don't want you to know!",
    ],
    [
      "https://example.com/affiliate/5",
      "https://picsum.photos/800/454",
      "The one weird trick that doctors hate!",
    ],
  ]
}
