# Google Sheets Integration Setup

## Overview
This app fetches data from Google Sheets using server-side authentication for security.

## Setup Steps

1. **Environment Variables**
   - The app requires a `.env.local` file with Google service account credentials
   - This file has been created with the credentials from `google_service_account.json`

2. **Google Sheet Configuration**
   - Share your Google Sheet with the service account email: 
     `breakfast-id@breakfast-451407.iam.gserviceaccount.com`
   - Copy the Sheet ID from the URL (the part between `/d/` and `/edit`)
   - Enter the Sheet ID in the app settings page

3. **Expected Sheet Format**
   - Column A: Affiliate Link
   - Column B: Image URL
   - Column C: Clickbait Phrase

## Testing

Run the test script to verify the connection:
```bash
node test-sheets.js
```

## Running the App

```bash
npm run dev
```

Visit http://localhost:3000 and configure your Sheet ID in the settings.

## Security Notes
- Service account credentials are stored server-side only
- Never commit `.env.local` or `google_service_account.json` to version control
- The `.gitignore` file is configured to exclude these sensitive files