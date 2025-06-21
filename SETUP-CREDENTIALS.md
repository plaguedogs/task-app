# Setting Up Google Sheets Credentials

This app requires Google Service Account credentials to access Google Sheets.

## Steps to Set Up:

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google Sheets API**
   - In the Google Cloud Console, go to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. **Create a Service Account**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the service account details
   - Grant it the "Editor" role (or create a custom role with sheets permissions)

4. **Generate a Key**
   - Click on the created service account
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Save the downloaded file as `google_service_account.json` in the project root

5. **Share Your Google Sheet**
   - Open your Google Sheet
   - Click "Share"
   - Add the service account email (found in the JSON file as `client_email`)
   - Give it "Editor" permissions

6. **Configure the App**
   - Copy `.env.example` to `.env`
   - Either:
     - Place your `google_service_account.json` in the project root, OR
     - Fill in the individual values in the `.env` file
   - Add your Google Spreadsheet ID to the `.env` file

## Security Notes

- **NEVER** commit your `google_service_account.json` or `.env` file to version control
- The `.gitignore` file is configured to exclude these files
- Keep your service account credentials secure and rotate them regularly