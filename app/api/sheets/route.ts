import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

// Load service account credentials from environment variables
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") // Fix escaped newlines

export async function GET(request: NextRequest) {
  try {
    // Get sheet ID from query parameters
    const searchParams = request.nextUrl.searchParams
    const sheetId = searchParams.get("sheetId")

    if (!sheetId) {
      return NextResponse.json({ error: "Missing sheetId parameter" }, { status: 400 })
    }

    console.log("Fetching sheet data for:", sheetId)

    // Check if we have service account credentials
    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) {
      console.log("No service account credentials found in environment variables")
      return NextResponse.json(
        { error: "Service account credentials not configured in environment variables" },
        { status: 500 },
      )
    }

    // Create JWT client
    const auth = new google.auth.JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    // Create Google Sheets API client
    const sheets = google.sheets({ version: "v4", auth })

    // Fetch data from the sheet including additional images in columns AA-AZ
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "Sheet1!A1:AZ1000", // Extended range to include AA-AZ columns
    })

    const rows = response.data.values

    if (!rows || rows.length === 0) {
      console.log("No data found in sheet")
      return NextResponse.json({ error: "No data found in sheet" }, { status: 404 })
    }

    console.log(`Successfully fetched ${rows.length} rows from Google Sheets`)
    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error("Error fetching Google Sheet data:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch sheet data" },
      { status: 500 },
    )
  }
}
