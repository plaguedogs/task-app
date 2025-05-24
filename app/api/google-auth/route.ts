import { type NextRequest, NextResponse } from "next/server"
import { GoogleAuth } from "google-auth-library"

export async function POST(request: NextRequest) {
  try {
    const { client_email, private_key, scopes } = await request.json()

    // Use environment variables if available, otherwise use provided credentials
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || client_email
    const serviceAccountKey = process.env.GOOGLE_PRIVATE_KEY || private_key

    if (!serviceAccountEmail || !serviceAccountKey) {
      return NextResponse.json({ error: "Missing service account credentials" }, { status: 400 })
    }

    // Create credentials object
    const credentials = {
      client_email: serviceAccountEmail,
      private_key: serviceAccountKey.replace(/\\n/g, "\n"), // Handle escaped newlines
    }

    // Create auth client
    const auth = new GoogleAuth({
      credentials,
      scopes: scopes || ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    })

    // Get access token
    const authClient = await auth.getClient()
    const accessToken = await authClient.getAccessToken()

    if (!accessToken.token) {
      throw new Error("Failed to get access token")
    }

    return NextResponse.json({ access_token: accessToken.token })
  } catch (error) {
    console.error("Google Auth error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication failed" },
      { status: 500 },
    )
  }
}
