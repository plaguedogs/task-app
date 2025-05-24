# Task App with Google Sheets Integration

A Next.js application that fetches task data from Google Sheets with multiple theme support, image carousel, and timer functionality.

## Features

- 📊 **Google Sheets Integration** - Fetch data directly from your Google Sheets using service account authentication
- 🎨 **Multiple Themes** - 8 built-in themes: Light, Dark, System, Facebook, openSUSE, Nobara, Windows 11, and Ubuntu
- 🖼️ **Image Carousel** - Navigate through multiple images with:
  - Mouse clicks (arrow buttons and dots)
  - Keyboard arrows (← →)
  - Touch/swipe gestures on mobile
- ⏱️ **Task Timer** - Countdown timer with audio notifications
- 📱 **Mobile Responsive** - Optimized layout with bottom toolbar for mobile devices
- 🔄 **Live Data Refresh** - Refresh button to fetch latest data from Google Sheets

## Prerequisites

- Node.js 18+ 
- npm or pnpm
- Google Cloud service account with Sheets API access

## Installation

1. Clone the repository:
```bash
git clone https://github.com/danharris923/task-app.git
cd task-app
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

## Google Sheets Setup

1. Create a Google Cloud service account
2. Enable Google Sheets API
3. Share your Google Sheet with the service account email
4. Structure your sheet with:
   - **Column A**: Affiliate Link
   - **Column B**: Main Image URL
   - **Column C**: Clickbait Phrase
   - **Columns AA-AZ**: Additional Image URLs (optional)

## Usage

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000)

3. Go to Settings and enter your Google Sheet ID

4. The app will fetch and display your data

## Theme Selection

Navigate to Settings to choose from:
- **Light/Dark** - Classic themes
- **System** - Follows OS preference
- **Facebook** - Classic blue theme
- **openSUSE** - Green/teal theme
- **Nobara** - Red/dark theme
- **Windows 11** - Modern Windows theme
- **Ubuntu** - Purple/orange theme

## Image Navigation

- **Desktop**: Click arrow buttons or dots, use keyboard arrows
- **Mobile**: Swipe left/right on images
- **Keyboard**: Press ← → arrow keys

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── sheets/         # Google Sheets API endpoint
│   │   └── google-auth/    # Authentication endpoint
│   ├── settings/           # Settings page
│   └── page.tsx           # Main app page
├── components/
│   ├── image-carousel.tsx  # Image carousel component
│   ├── task-timer.tsx     # Timer component
│   └── ui/                # UI components
├── contexts/
│   └── theme-context.tsx  # Theme provider
├── lib/
│   ├── google-sheets.ts   # Sheets integration
│   └── themes.ts          # Theme definitions
└── public/
    └── notification.mp3   # Timer notification sound
```

## Security Notes

- Never commit `.env.local` or service account credentials
- Use environment variables for sensitive data
- Service account credentials are only used server-side

## Deployment

For Vercel deployment:
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Google Sheets integration via [googleapis](https://www.npmjs.com/package/googleapis)