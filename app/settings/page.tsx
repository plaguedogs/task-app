"use client"

import { useState, useEffect } from "react"
import { Home, Info } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "@/contexts/theme-context"

export default function SettingsPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [localTheme, setLocalTheme] = useState(theme)
  const [googleSheetId, setGoogleSheetId] = useState("")
  const [serviceAccountEmail, setServiceAccountEmail] = useState("")
  const [serviceAccountKey, setServiceAccountKey] = useState("")
  const [minTimer, setMinTimer] = useState("5")
  const [maxTimer, setMaxTimer] = useState("10")
  const [settingsExist, setSettingsExist] = useState(false)

  // Load settings on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem("settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setLocalTheme(settings.theme || "system")
      setGoogleSheetId(settings.googleSheetId || "")
      setServiceAccountEmail(settings.serviceAccountEmail || "")
      setServiceAccountKey(settings.serviceAccountKey || "")
      setMinTimer(settings.minTimer || "5")
      setMaxTimer(settings.maxTimer || "10")
      setSettingsExist(true)
    }
  }, [])

  const handleSaveSettings = () => {
    try {
      // Validate Google Sheet ID
      if (!googleSheetId) {
        toast({
          title: "Warning",
          description: "Google Sheet ID is empty. Sample data will be used.",
          variant: "default",
        })
      }

      // Validate timer values
      const minTimerValue = Number.parseInt(minTimer)
      const maxTimerValue = Number.parseInt(maxTimer)

      if (isNaN(minTimerValue) || minTimerValue <= 0) {
        toast({
          title: "Error",
          description: "Minimum timer must be a positive number",
          variant: "destructive",
        })
        return
      }

      if (isNaN(maxTimerValue) || maxTimerValue <= 0) {
        toast({
          title: "Error",
          description: "Maximum timer must be a positive number",
          variant: "destructive",
        })
        return
      }

      if (minTimerValue > maxTimerValue) {
        toast({
          title: "Error",
          description: "Minimum timer cannot be greater than maximum timer",
          variant: "destructive",
        })
        return
      }

      // Update theme using the context
      setTheme(localTheme)

      // Create a complete settings object with all user values
      const completeSettings = {
        theme: localTheme,
        googleSheetId,
        serviceAccountEmail,
        serviceAccountKey,
        minTimer,
        maxTimer,
        // Add timestamp for reference
        lastUpdated: new Date().toISOString(),
      }

      // Save ALL settings to localStorage (persists across browser sessions)
      localStorage.setItem("settings", JSON.stringify(completeSettings))

      // Clear any previous settings-related errors
      localStorage.removeItem("settingsError")

      toast({
        title: "Settings Saved Permanently",
        description: "Your settings have been saved and will persist until you change them again.",
      })

      // Redirect to home page
      window.location.href = "/"
    } catch (error) {
      // Handle potential localStorage errors
      console.error("Error saving settings:", error)

      // Store error in localStorage for debugging
      localStorage.setItem(
        "settingsError",
        JSON.stringify({
          message: error instanceof Error ? error.message : "Unknown error",
          time: new Date().toISOString(),
        }),
      )

      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">Settings</h1>
          <Link href="/" className="p-2 rounded-full bg-muted hover:bg-muted/80">
            <Home className="h-5 w-5" />
          </Link>
        </div>
        <p className="text-muted-foreground mb-8">
          Configure your Google Sheets integration, appearance, and other application settings.
        </p>

        {!settingsExist && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800">Welcome to the Task App!</h3>
            <p className="text-sm text-blue-700 mt-1">
              This is your first time using the app. Please configure your settings below to connect to your Google
              Sheet. If you don't have a Google Sheet set up yet, you can still use the app with sample data.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg p-4 md:p-6 shadow border">
          <h2 className="text-xl font-semibold mb-2">Application Settings</h2>
          <p className="text-muted-foreground mb-6">
            Manage Google Sheets integration, timer settings, and application appearance.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Theme</h3>
              <Select value={localTheme} onValueChange={setLocalTheme}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="opensuse">openSUSE</SelectItem>
                  <SelectItem value="nobara">Nobara</SelectItem>
                  <SelectItem value="windows">Windows</SelectItem>
                  <SelectItem value="ubuntu">Ubuntu</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">Choose the application's color theme.</p>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <h3 className="font-medium">Google Sheet ID</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 ml-1">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        The ID is the part of the Google Sheet URL between /d/ and /edit. Example:
                        https://docs.google.com/spreadsheets/d/<strong>1A2B3C4D5E6F7G8H9I0J</strong>/edit
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                value={googleSheetId}
                onChange={(e) => setGoogleSheetId(e.target.value)}
                placeholder="Enter Google Sheet ID"
              />
              <p className="text-sm text-muted-foreground mt-1">
                The ID of the Google Sheet to fetch data from. Leave empty to use sample data.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Service Account Client Email</h3>
              <Input
                value={serviceAccountEmail}
                onChange={(e) => setServiceAccountEmail(e.target.value)}
                placeholder="example@project-id.iam.gserviceaccount.com"
              />
              <p className="text-sm text-muted-foreground mt-1">
                The client email from your Google Cloud service account JSON file. (Optional - mock data used if not
                provided)
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Service Account Private Key</h3>
              <Textarea
                value={serviceAccountKey}
                onChange={(e) => setServiceAccountKey(e.target.value)}
                className="font-mono text-xs h-32"
                placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
              />
              <p className="text-sm text-muted-foreground mt-1">
                The private key from your Google Cloud service account JSON file. (Optional - mock data used if not
                provided)
                <br />
                For security in production, consider environment variables or a secure backend proxy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Min Timer (minutes)</h3>
                <Input type="number" value={minTimer} onChange={(e) => setMinTimer(e.target.value)} min="1" />
                <p className="text-sm text-muted-foreground mt-1">Minimum duration for the post timer.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Max Timer (minutes)</h3>
                <Input type="number" value={maxTimer} onChange={(e) => setMaxTimer(e.target.value)} min="1" />
                <p className="text-sm text-muted-foreground mt-1">Maximum duration for the post timer.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <Button
              onClick={handleSaveSettings}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              aria-label="Save settings permanently"
            >
              Save Settings Permanently
            </Button>
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-primary hover:underline w-full sm:w-auto justify-center sm:justify-start"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}