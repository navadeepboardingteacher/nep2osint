# Nepal Election OSINT Dashboard (निर्वाचन 2082)

A production-ready real-time election intelligence dashboard for Nepal Election 2082, featuring live vote counting, RSS news aggregation, and interactive data visualization.

![Dashboard Preview](https://via.placeholder.com/1200x600/1e293b/06b6d4?text=Nepal+Election+OSINT+Dashboard)

## Features

- **Live Results Scraper**: Real-time election data from election.ratopati.com
- **RSS News Aggregator**: Fetches news from 6 major Nepali media sources
- **Alert Engine**: Intelligent alerts for vote lead changes and breaking news
- **Interactive Map**: Constituency-level visualization with party colors
- **Party Performance Charts**: Seat projections and vote distribution
- **Real-time Updates**: Server-Sent Events (SSE) for live data streaming
- **Search & Filter**: Search by candidate, constituency, or party

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **UI Components**: Custom glassmorphism design with neon accents
- **Charts**: Recharts for data visualization
- **Backend**: Next.js API routes (serverless)
- **Scraping**: Axios + Cheerio
- **RSS**: RSS Parser
- **Deployment**: Vercel

## Project Structure

```
/
├── app/
│   ├── api/
│   │   ├── alerts/       # Alerts API endpoint
│   │   ├── rss/         # RSS feed API endpoint
│   │   ├── results/     # Election results API endpoint
│   │   └── stream/      # SSE real-time stream
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main dashboard page
├── components/
│   ├── alerts/          # Alert panel component
│   ├── charts/          # Election charts
│   ├── candidate-table/# Vote counts table
│   ├── map/             # Nepal constituency map
│   ├── rss-feed/        # RSS news feed
│   └── ui/              # Reusable UI components
├── lib/
│   ├── alertsEngine.ts  # Alert logic
│   ├── ratopatiScraper.ts # Election scraper
│   ├── rssFetcher.ts    # RSS feed fetcher
│   └── utils.ts         # Utility functions
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── env.example
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Data Sources

### Primary Data Source
- **election.ratopati.com**: Constituency results, candidate votes, party leads

### Secondary RSS Feeds
- Ratopati (https://www.ratopati.com/rss)
- Setopati (https://setopati.com/rss)
- OnlineKhabar (https://onlinekhabar.com/feed)
- Kantipur (https://ekantipur.com/rss)
- AnnapurnaPost (https://annapurnapost.com/rss)
- NepalPress (https://nepalpress.com/rss)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/results` | Fetch election results |
| `GET /api/rss` | Fetch aggregated RSS news |
| `GET /api/alerts` | Fetch system alerts |
| `GET /api/stream` | SSE real-time updates stream |

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel deploy

# Or for production
vercel deploy --prod
```

### Environment Variables

Configure the following in your Vercel project settings or `.env.local`:

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

## Monitoring Keywords

The system monitors for these keywords:
- निर्वाचन (Election)
- मतगणना (Vote Counting)
- Nepal Election
- NepalVotes
- Candidate names
- Constituency numbers

## Alert Types

1. **Vote Lead Change**: When a candidate takes or loses the lead
2. **New News**: Breaking election news from RSS feeds
3. **Threshold Breach**: When vote margin exceeds threshold
4. **Seat Projection**: Party seat count changes
5. **Live Update**: Periodic live count updates

## Performance

- Results cached for 20 seconds
- RSS feeds cached for 60 seconds
- Rate limiting: 30 requests per minute per IP
- SSE connections timeout after 1 hour

## Security

- Rate limiting on all API endpoints
- CORS headers configured
- No sensitive data stored

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Nepal Election OSINT Dashboard | निर्वाचन 2082**

Built with Next.js 14 and TailwindCSS
