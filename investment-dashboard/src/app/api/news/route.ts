import { NextRequest, NextResponse } from 'next/server';

const AI_INFRA_KEYWORDS = [
  'nvidia', 'nvda', 'artificial intelligence', 'AI infrastructure', 'data center',
  'semiconductor', 'chip', 'gpu', 'machine learning', 'large language model',
  'openai', 'anthropic', 'microsoft azure', 'google cloud', 'aws',
  'tsmc', 'broadcom', 'amd', 'arm holdings', 'arista', 'vertiv',
  'nuclear energy data center', 'power grid ai', 'constellation energy',
  'vistra', 'eaton corporation', 'ge vernova', 'palantir', 'supermicro',
  'robotics', 'tesla ai', 'physical ai',
];

interface RSSItem {
  title: string; link: string; pubDate: string; description: string; source: string;
}

async function fetchRSSFeed(url: string, sourceName: string): Promise<RSSItem[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/rss+xml, text/xml' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const text = await res.text();
    const items: RSSItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const itemXml = match[1];
      const getTag = (tag: string) => {
        const m = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\/${tag}>|<${tag}[^>]*>([^<]*)<\/${tag}>`));
        return m ? (m[1] ?? m[2] ?? '').trim() : '';
      };
      const title = getTag('title');
      const link = getTag('link') || getTag('guid');
      const pubDate = getTag('pubDate');
      const description = getTag('description');
      if (title && link) items.push({ title, link, pubDate, description, source: sourceName });
    }
    return items.slice(0, 15);
  } catch { return []; }
}

function scoreRelevance(item: RSSItem): number {
  const text = `${item.title} ${item.description}`.toLowerCase();
  let score = 0;
  for (const kw of AI_INFRA_KEYWORDS) { if (text.includes(kw.toLowerCase())) score += 1; }
  return Math.min(score, 10);
}

function detectSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const bullish = ['surge', 'jump', 'rally', 'beat', 'record', 'growth', 'win', 'gain', 'up', 'rise', 'strong', 'expand', 'bullish', 'upgrade'];
  const bearish = ['fall', 'drop', 'miss', 'decline', 'cut', 'warn', 'loss', 'down', 'weak', 'concern', 'risk', 'bear', 'downgrade', 'crash'];
  const lower = text.toLowerCase();
  const b = bullish.filter(w => lower.includes(w)).length;
  const r = bearish.filter(w => lower.includes(w)).length;
  if (b > r) return 'bullish';
  if (r > b) return 'bearish';
  return 'neutral';
}

function extractSymbols(text: string): string[] {
  const known = ['NVDA','MSFT','GOOGL','AMZN','META','TSLA','AAPL','AMD','TSM','AVGO','ANET','VRT','ETN','CEG','VST','PLTR','ARM','ASML','GLD','VOO','QQQ'];
  const upper = text.toUpperCase();
  return known.filter(s => upper.includes(s));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const minScore = parseInt(searchParams.get('minScore') ?? '1');
  const feeds = [
    { url: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=NVDA,AMD,MSFT,GOOGL,TSLA,META&region=US&lang=en-US', name: 'Yahoo Finance' },
    { url: 'https://www.reutersagency.com/feed/?best-topics=tech&post_type=best', name: 'Reuters Tech' },
    { url: 'https://feeds.feedburner.com/TechCrunch', name: 'TechCrunch' },
  ];
  const allItemsArrays = await Promise.allSettled(feeds.map(f => fetchRSSFeed(f.url, f.name)));
  const allItems: RSSItem[] = [];
  allItemsArrays.forEach(r => { if (r.status === 'fulfilled') allItems.push(...r.value); });
  const scored = allItems
    .map((item, idx) => {
      const score = scoreRelevance(item);
      const text = `${item.title} ${item.description}`;
      return {
        id: `news-${idx}-${Date.now()}`,
        title: item.title,
        summary: item.description.replace(/<[^>]+>/g, '').slice(0, 200),
        url: item.link,
        source: item.source,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        relevanceScore: score,
        relatedSymbols: extractSymbols(text),
        sentiment: detectSentiment(text),
      };
    })
    .filter(item => item.relevanceScore >= minScore)
    .sort((a, b) => b.relevanceScore - a.relevanceScore || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 30);
  return NextResponse.json({ articles: scored, fetchedAt: new Date().toISOString() });
}
