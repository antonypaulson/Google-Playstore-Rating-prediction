import { NextRequest, NextResponse } from 'next/server';

const YF_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';

async function fetchQuote(symbol: string) {
  const url = `${YF_BASE}/${symbol}?interval=1d&range=1d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${symbol}`);
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error(`No data for ${symbol}`);
  const price = meta.regularMarketPrice ?? meta.previousClose;
  const prevClose = meta.previousClose ?? meta.chartPreviousClose;
  const change = price - prevClose;
  const changePercent = (change / prevClose) * 100;
  return {
    symbol: symbol.toUpperCase(),
    price, change, changePercent,
    volume: meta.regularMarketVolume,
    marketCap: meta.marketCap,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get('symbols');
  if (!symbolsParam) return NextResponse.json({ error: 'symbols param required' }, { status: 400 });
  const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase());
  const results = await Promise.allSettled(symbols.map(fetchQuote));
  const quotes: Record<string, unknown> = {};
  results.forEach((result, i) => {
    quotes[symbols[i]] = result.status === 'fulfilled' ? result.value : { error: result.reason?.message ?? 'Failed', symbol: symbols[i] };
  });
  return NextResponse.json(quotes);
}
