export interface Position {
  symbol: string;
  name: string;
  value: number;
  shares?: number;
  avgCost?: number;
  sector: string;
  category: 'core' | 'ai-infra' | 'hedge' | 'etf' | 'cash';
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  lastUpdated: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  subSector: 'semiconductors' | 'power-energy' | 'cloud' | 'robotics' | 'networking' | 'data-center' | 'software';
  targetPrice?: number;
  currentPrice?: number;
  thesis: string;
  conviction: 'high' | 'medium' | 'low';
  addedAt: string;
  tags: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  relevanceScore: number;
  relatedSymbols: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

export interface InvestmentThesis {
  id: string;
  symbol: string;
  title: string;
  thesis: string;
  catalysts: string[];
  risks: string[];
  targetPrice: number;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'closed' | 'monitoring';
}

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'above' | 'below';
  price: number;
  note: string;
  createdAt: string;
  triggered: boolean;
  triggeredAt?: string;
}

export interface LumpSumEntry {
  id: string;
  date: string;
  symbol: string;
  amount: number;
  priceAtEntry: number;
  shares: number;
  reason: string;
  currentValue?: number;
  gainLoss?: number;
}

export interface AIAnalysis {
  symbol: string;
  recommendation: 'strong-buy' | 'buy' | 'hold' | 'sell' | 'strong-sell';
  summary: string;
  keyPoints: string[];
  risks: string[];
  catalysts: string[];
  priceTarget?: number;
  generatedAt: string;
}
