# Content Cleanup Prompt

Use this prompt with any LLM to clean scraped web content:

```
Clean up this scraped web content by following these rules:

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

Return ONLY the cleaned article content - no explanations or metadata about the cleanup process.
```

## Usage

1. Copy the prompt above
2. Paste it into your preferred LLM (ChatGPT, Claude, etc.)
3. Add your scraped content after the prompt
4. The LLM will return cleaned, formatted content ready for use