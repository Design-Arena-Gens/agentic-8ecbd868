# AI Video Automation System

Automatically find trending topics, generate AI videos, and upload to YouTube daily.

## Features

- 🔍 **Trending Topic Discovery**: Scans YouTube trending, Google Trends, and other sources
- 🤖 **AI Video Generation**: Uses GPT-4 for scripts and Stable Diffusion/DALL-E for visuals
- 📹 **Automated Upload**: Uploads videos to YouTube with optimized metadata
- ⏰ **Daily Automation**: Cron job for scheduled daily uploads
- 🎨 **Modern Web Interface**: Next.js dashboard to monitor and control automation

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Add your API keys:

```env
OPENAI_API_KEY=sk-...
REPLICATE_API_KEY=r8_...
YOUTUBE_CLIENT_ID=...
YOUTUBE_CLIENT_SECRET=...
YOUTUBE_REDIRECT_URI=http://localhost:3000/api/youtube/callback
SERPAPI_KEY=... (optional)
```

### 3. Setup YouTube OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:3000/api/youtube/callback` to authorized redirect URIs
6. Run the app and click "Setup YouTube OAuth"
7. Copy the refresh token to your `.env` file

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Run Automation Manually

From the web interface, click "Run Automation Now"

Or from command line:

```bash
node scripts/daily-automation.js --now
```

### Schedule Daily Uploads

```bash
node scripts/daily-automation.js --cron
```

Or configure the cron schedule in `.env`:

```env
CRON_SCHEDULE=0 9 * * *  # Daily at 9 AM
```

## Deploy to Vercel

```bash
vercel deploy --prod
```

Add environment variables in Vercel dashboard.

## How It Works

1. **Find Trends**: Scrapes trending topics from YouTube and Google Trends
2. **Select Topic**: Uses GPT-4 to select the best topic for video creation
3. **Generate Script**: Creates a 30-60 second video script with scene descriptions
4. **Create Video**: Generates video using AI models (Stable Video Diffusion, DALL-E 3)
5. **Upload**: Automatically uploads to YouTube with optimized metadata

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI Models**: OpenAI GPT-4, DALL-E 3, Replicate (Stable Video Diffusion)
- **APIs**: YouTube Data API, Google Trends (via SerpAPI)
- **Automation**: node-cron

## License

MIT
