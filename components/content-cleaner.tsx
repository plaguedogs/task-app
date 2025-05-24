"use client"

import { useState } from "react"
import { Trash2, Copy, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export function ContentCleaner() {
  const { toast } = useToast()
  const [inputContent, setInputContent] = useState("")
  const [cleanedContent, setCleanedContent] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  const cleanupPrompt = `Clean up this scraped web content by following these rules:

FIRST CHECK:
If the content appears to be primarily advertising or promotional material with little substantive content, return 'SKIP - mostly ads' instead of attempting to clean it.

REMOVE completely:

All CSS code (anything between <style> tags or CSS selectors like .className)
All JavaScript code (including googletag, window.googletag, ad serving scripts)
All advertising code (Google AdSense, banner ads, affiliate tracking)
HTML navigation elements (menus, headers, footers, sidebars)
Social media sharing buttons and widgets
Cookie notices and privacy banners
Comment sections and user-generated content
Website metadata and SEO tags
Analytics tracking code
Auto-generated content like "Share on Pinterest", "Copy Link"

KEEP and preserve:

The main article title and headlines
All body text and paragraphs
Legitimate hyperlinks within the article content (but remove tracking parameters)
Image captions and photo credits
Author bylines and publication dates
Quote blocks and cited sources
Lists and bullet points that are part of the article
Embedded content that's relevant to the article (videos, infographics)

FORMAT the output as:

Clean, readable text
Preserve paragraph breaks
Keep hyperlinks in markdown format: [link text](url)
Include image references as: ![alt text](image URL)
Maintain the logical flow and structure of the original article

QUALITY CHECK:

Ensure the content makes sense and flows naturally
Remove any incomplete sentences or fragmented text
Fix any formatting issues caused by the scraping process
Preserve the original meaning and context

Return ONLY the cleaned article content - no explanations or metadata about the cleanup process.`

  const handleClean = async () => {
    if (!inputContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to clean",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/clean-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inputContent }),
      })

      const data = await response.json()
      
      if (data.prompt) {
        // Show the prompt for manual use
        setCleanedContent(`PROMPT TO USE WITH YOUR LLM:\n\n${data.prompt}\n\n---\n\nYOUR CONTENT:\n\n${inputContent}`)
        toast({
          title: "Ready for Manual Cleaning",
          description: "Copy the prompt and content to use with your preferred LLM",
        })
      }
    } catch (error) {
      console.error("Error cleaning content:", error)
      toast({
        title: "Error",
        description: "Failed to process content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: "content" | "prompt") => {
    navigator.clipboard.writeText(text).then(
      () => {
        if (type === "content") {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } else {
          setCopiedPrompt(true)
          setTimeout(() => setCopiedPrompt(false), 2000)
        }
        toast({
          title: "Copied!",
          description: `${type === "content" ? "Content" : "Prompt"} copied to clipboard`,
        })
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        })
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Clean Content
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Content Cleaner</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Scraped Content</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setInputContent("")}
                className="text-xs"
              >
                Clear
              </Button>
            </div>
            <Textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Paste your scraped web content here..."
              className="min-h-[200px] font-mono text-xs"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleClean}
              disabled={isLoading || !inputContent.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate Cleanup Instructions"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(cleanupPrompt, "prompt")}
            >
              {copiedPrompt ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy Prompt Only
            </Button>
          </div>

          {cleanedContent && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Cleanup Instructions</label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(cleanedContent, "content")}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy All
                </Button>
              </div>
              <Textarea
                value={cleanedContent}
                readOnly
                className="min-h-[300px] font-mono text-xs bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-2">
                Copy this to your preferred LLM (ChatGPT, Claude, etc.) to clean your content
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}