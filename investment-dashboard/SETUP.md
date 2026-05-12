# Investment Command Center — Setup Guide

## Quick Start

```bash
cd investment-dashboard
npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables

Create `.env.local`:

```
ANTHROPIC_API_KEY=your_key_here
```

Get your key: https://console.anthropic.com/

## Features

| Tab | What it does |
|-----|--------------|
| Portfolio | Live quotes, allocation pie, day P&L, Buddy's tips |
| Opportunities | Watchlist with Claude AI analysis per stock |
| News | RSS-scraped AI infra news with relevance scoring |
| Thesis | Document your investment reasoning per position |
| Alerts | Price above/below triggers |
| Deployments | Log lump sum entries and track live P&L |

## Deploy to Vercel (free)

1. Push this repo to GitHub
2. Connect to Vercel: https://vercel.com/new
3. Add `ANTHROPIC_API_KEY` in Vercel environment variables
4. Deploy — get a public URL

## Watchlist Pre-Seeded (AI Infrastructure)

- **VST** — Vistra Energy (power for AI data centers)
- **CEG** — Constellation Energy (nuclear, Microsoft deal)
- **ANET** — Arista Networks (AI data center networking)
- **AVGO** — Broadcom (custom AI chips + networking)
- **VRT** — Vertiv Holdings (liquid cooling, power mgmt)
- **ETN** — Eaton Corp (electrical infrastructure)
- **ASML** — EUV lithography monopoly
- **AMD** — NVDA alternative GPU play
- **PLTR** — Palantir AI platform
- **ARM** — Chip architecture royalties
