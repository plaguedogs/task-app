/**
 * Fetches data from a Google Sheet using server-side API route
 * @param sheetId The ID of the Google Sheet
 * @returns Promise<string[][]> A 2D array of the sheet data
 */
export async function fetchGoogleSheetData(
  sheetId: string,
  clientEmail?: string,
  privateKey?: string,
): Promise<string[][]> {
  try {
    // If no sheet ID is provided, return mock data
    if (!sheetId) {
      console.log("No Google Sheet ID provided, using mock data")
      return mockFetchGoogleSheetData()
    }

    console.log("Fetching Google Sheet data via API route...")

    // Method 1: Use our server-side API route
    try {
      const response = await fetch(`/api/sheets?sheetId=${encodeURIComponent(sheetId)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API route error (${response.status}): ${errorData.error || response.statusText}`)
      }

      const { data } = await response.json()

      if (!data || data.length === 0) {
        throw new Error("No data returned from API route")
      }

      console.log(`✅ Successfully fetched ${data.length} rows via API route`)
      return data
    } catch (apiError) {
      console.error("API route method failed:", apiError)

      // Method 2: Try CSV export as fallback
      try {
        console.log("Trying CSV export method as fallback...")
        const csvData = await fetchViaCSV(sheetId)
        console.log("✅ CSV export method successful")
        return csvData
      } catch (csvError) {
        console.error("CSV method failed:", csvError)

        // If all methods fail, use mock data
        console.log("All methods failed, using mock data")
        return mockFetchGoogleSheetData()
      }
    }
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error)
    return mockFetchGoogleSheetData()
  }
}

/**
 * Fetch via CSV export (requires public sharing)
 */
async function fetchViaCSV(sheetId: string): Promise<string[][]> {
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`

  const response = await fetch(csvUrl)

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Sheet not publicly accessible. Please share with 'Anyone with the link can view'")
    }
    if (response.status === 404) {
      throw new Error("Sheet not found. Please check your Sheet ID")
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const csvText = await response.text()

  if (!csvText || csvText.trim() === "") {
    throw new Error("Empty response from CSV export")
  }

  // Check if we got an error page instead of CSV
  if (csvText.includes("<!DOCTYPE html>") || csvText.includes("<html")) {
    throw new Error("Received HTML instead of CSV - sheet may not be publicly accessible")
  }

  const rows = parseCSV(csvText)

  if (rows.length === 0) {
    throw new Error("No data rows found in CSV")
  }

  return rows
}

/**
 * Simple CSV parser that handles quoted fields and commas
 */
function parseCSV(csvText: string): string[][] {
  const rows: string[][] = []
  const lines = csvText.split("\n")

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex].trim()
    if (line === "") continue // Skip empty lines

    const row: string[] = []
    let currentField = ""
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          // Escaped quote (double quote)
          currentField += '"'
          i += 2
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
        }
      } else if (char === "," && !inQuotes) {
        // End of field
        row.push(currentField.trim())
        currentField = ""
        i++
      } else {
        // Regular character
        currentField += char
        i++
      }
    }

    // Add the last field
    row.push(currentField.trim())

    // Only add rows that have at least one non-empty field
    if (row.some((field) => field !== "")) {
      rows.push(row)
    }
  }

  return rows
}

/**
 * Mock function to simulate fetching data from Google Sheets
 */
function mockFetchGoogleSheetData(): Promise<string[][]> {
  console.log("🔄 Using mock data")

  // Mock data structure: [Affiliate Link, Image URL, Clickbait Phrase]
  const mockData: string[][] = [
    [
      "https://example.com/affiliate/1",
      "https://picsum.photos/800/450",
      "You won't believe what happens when you click this link!",
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
    ["https://example.com/affiliate/4", "https://picsum.photos/800/453", "10 secrets they don't want you to know!"],
    ["https://example.com/affiliate/5", "https://picsum.photos/800/454", "The one weird trick that doctors hate!"],
  ]

  return Promise.resolve(mockData)
}
