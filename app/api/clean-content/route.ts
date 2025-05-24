import { NextRequest, NextResponse } from "next/server"

const CLEANUP_PROMPT = `Clean up this scraped web content by following these rules:

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

export async function POST(request: NextRequest) {
  try {
    const { content, apiKey } = await request.json()
    
    if (!content) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 })
    }

    // If no API key provided, return the prompt for manual use
    if (!apiKey) {
      return NextResponse.json({ 
        prompt: CLEANUP_PROMPT,
        instruction: "Use this prompt with your preferred LLM to clean the content"
      })
    }

    // Here you would integrate with an LLM API (OpenAI, Anthropic, etc.)
    // For now, returning the prompt and content for manual processing
    return NextResponse.json({
      prompt: CLEANUP_PROMPT,
      content: content,
      message: "Integrate with your preferred LLM API to automatically clean content"
    })

  } catch (error) {
    console.error("Error in content cleanup:", error)
    return NextResponse.json(
      { error: "Failed to process content" },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return the cleanup prompt for reference
  return NextResponse.json({
    prompt: CLEANUP_PROMPT,
    usage: "POST to this endpoint with { content: 'your scraped content', apiKey: 'optional' }"
  })
}