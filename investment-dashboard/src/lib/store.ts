'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Position, WatchlistItem, InvestmentThesis, PriceAlert, LumpSumEntry, StockQuote } from './types';
import { generateId } from './utils';

const INITIAL_PORTFOLIO: Position[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corp', value: 23400, sector: 'Semiconductors', category: 'ai-infra' },
  { symbol: 'GLD', name: 'SPDR Gold ETF', value: 8000, sector: 'Commodities', category: 'hedge' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', value: 6700, sector: 'Broad Market', category: 'etf' },
  { symbol: 'QQQ', name: 'Invesco QQQ ETF', value: 5600, sector: 'Broad Market', category: 'etf' },
  { symbol: 'TSM', name: 'Taiwan Semiconductor', value: 3800, sector: 'Semiconductors', category: 'ai-infra' },
  { symbol: 'META', name: 'Meta Platforms', value: 3800, sector: 'Social Media / AI', category: 'core' },
  { symbol: 'TSLA', name: 'Tesla', value: 3700, sector: 'EV / Robotics', category: 'ai-infra' },
  { symbol: 'AAPL', name: 'Apple Inc', value: 2100, sector: 'Consumer Tech', category: 'core' },
  { symbol: 'MSFT', name: 'Microsoft Corp', value: 1600, sector: 'Cloud / AI', category: 'ai-infra' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', value: 1200, sector: 'Cloud / AI', category: 'ai-infra' },
  { symbol: 'FLIN', name: 'Franklin FTSE India ETF', value: 700, sector: 'Emerging Markets', category: 'etf' },
  { symbol: 'INDY', name: 'iShares MSCI India ETF', value: 700, sector: 'Emerging Markets', category: 'etf' },
  { symbol: 'CASH', name: 'Cash', value: 85, sector: 'Cash', category: 'cash' },
];

const INITIAL_WATCHLIST: WatchlistItem[] = [
  { id: generateId(), symbol: 'VST', name: 'Vistra Energy', sector: 'Power & Energy', subSector: 'power-energy', thesis: 'AI data centers need massive power. Vistra is the largest competitive power producer in the US with nuclear assets.', conviction: 'high', addedAt: new Date().toISOString(), tags: ['ai-power', 'nuclear', 'data-center'] },
  { id: generateId(), symbol: 'CEG', name: 'Constellation Energy', sector: 'Nuclear Power', subSector: 'power-energy', thesis: 'Microsoft signed 20yr nuclear deal. Clean, reliable baseload for hyperscalers. Rare moat.', conviction: 'high', addedAt: new Date().toISOString(), tags: ['nuclear', 'clean-energy', 'microsoft'] },
  { id: generateId(), symbol: 'ANET', name: 'Arista Networks', sector: 'Networking', subSector: 'networking', thesis: 'Dominates AI networking in data centers. Revenue accelerating as GPU clusters require ultra-low-latency networking.', conviction: 'high', addedAt: new Date().toISOString(), tags: ['networking', 'data-center', 'ai-infra'] },
  { id: generateId(), symbol: 'AVGO', name: 'Broadcom', sector: 'Semiconductors', subSector: 'semiconductors', thesis: 'Custom AI chips (XPUs) for Google, Meta. Plus networking. Multiple AI revenue streams.', conviction: 'high', addedAt: new Date().toISOString(), tags: ['custom-ai-chips', 'networking', 'xpu'] },
  { id: generateId(), symbol: 'VRT', name: 'Vertiv Holdings', sector: 'Data Center Infrastructure', subSector: 'data-center', thesis: 'Liquid cooling and power management for AI data centers. Backlog surging. Pure play on physical AI infrastructure.', conviction: 'high', addedAt: new Date().toISOString(), tags: ['cooling', 'data-center', 'power'] },
  { id: generateId(), symbol: 'ETN', name: 'Eaton Corp', sector: 'Electrical Equipment', subSector: 'power-energy', thesis: 'Power management for data centers and grid. Beneficiary of both AI buildout and grid modernization.', conviction: 'medium', addedAt: new Date().toISOString(), tags: ['power', 'grid', 'data-center'] },
  { id: generateId(), symbol: 'ASML', name: 'ASML Holding', sector: 'Chip Equipment', subSector: 'semiconductors', thesis: 'Monopoly on EUV lithography machines. Every advanced chip fab needs ASML. Unbreakable moat.', conviction: 'high', addedAt: new Date().toISOString(), tags: ['chip-equipment', 'euv', 'monopoly'] },
  { id: generateId(), symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductors', subSector: 'semiconductors', thesis: 'GPU alternative to NVDA. MI300X gaining traction. Benefits if NVDA supply constrained.', conviction: 'medium', addedAt: new Date().toISOString(), tags: ['gpu', 'ai-chips', 'nvda-alternative'] },
  { id: generateId(), symbol: 'PLTR', name: 'Palantir Technologies', sector: 'AI Software', subSector: 'software', thesis: 'AI software platform winning enterprise + government contracts. AIP (AI Platform) is a sleeper hit.', conviction: 'medium', addedAt: new Date().toISOString(), tags: ['ai-software', 'government', 'enterprise'] },
  { id: generateId(), symbol: 'ARM', name: 'ARM Holdings', sector: 'Chip Architecture', subSector: 'semiconductors', thesis: 'Architecture underlying most mobile and increasingly AI chips. Royalty model = pure leverage on AI chip volume.', conviction: 'medium', addedAt: new Date().toISOString(), tags: ['architecture', 'royalties', 'mobile-ai'] },
];

interface StoreState {
  portfolio: Position[];
  watchlist: WatchlistItem[];
  theses: InvestmentThesis[];
  alerts: PriceAlert[];
  lumpSums: LumpSumEntry[];
  quotes: Record<string, StockQuote>;
  lastQuotesFetch: string | null;
  updatePosition: (symbol: string, updates: Partial<Position>) => void;
  addToWatchlist: (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => void;
  removeFromWatchlist: (id: string) => void;
  updateWatchlistItem: (id: string, updates: Partial<WatchlistItem>) => void;
  addThesis: (thesis: Omit<InvestmentThesis, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateThesis: (id: string, updates: Partial<InvestmentThesis>) => void;
  deleteThesis: (id: string) => void;
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  removeAlert: (id: string) => void;
  triggerAlert: (id: string) => void;
  addLumpSum: (entry: Omit<LumpSumEntry, 'id'>) => void;
  deleteLumpSum: (id: string) => void;
  setQuotes: (quotes: Record<string, StockQuote>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      portfolio: INITIAL_PORTFOLIO,
      watchlist: INITIAL_WATCHLIST,
      theses: [], alerts: [], lumpSums: [], quotes: {}, lastQuotesFetch: null,
      updatePosition: (symbol, updates) => set((state) => ({ portfolio: state.portfolio.map((p) => p.symbol === symbol ? { ...p, ...updates } : p) })),
      addToWatchlist: (item) => set((state) => ({ watchlist: [...state.watchlist, { ...item, id: generateId(), addedAt: new Date().toISOString() }] })),
      removeFromWatchlist: (id) => set((state) => ({ watchlist: state.watchlist.filter((w) => w.id !== id) })),
      updateWatchlistItem: (id, updates) => set((state) => ({ watchlist: state.watchlist.map((w) => w.id === id ? { ...w, ...updates } : w) })),
      addThesis: (thesis) => set((state) => ({ theses: [...state.theses, { ...thesis, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] })),
      updateThesis: (id, updates) => set((state) => ({ theses: state.theses.map((t) => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t) })),
      deleteThesis: (id) => set((state) => ({ theses: state.theses.filter((t) => t.id !== id) })),
      addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, { ...alert, id: generateId(), createdAt: new Date().toISOString(), triggered: false }] })),
      removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),
      triggerAlert: (id) => set((state) => ({ alerts: state.alerts.map((a) => a.id === id ? { ...a, triggered: true, triggeredAt: new Date().toISOString() } : a) })),
      addLumpSum: (entry) => set((state) => ({ lumpSums: [...state.lumpSums, { ...entry, id: generateId() }] })),
      deleteLumpSum: (id) => set((state) => ({ lumpSums: state.lumpSums.filter((l) => l.id !== id) })),
      setQuotes: (quotes) => set(() => ({ quotes, lastQuotesFetch: new Date().toISOString() })),
    }),
    { name: 'investment-dashboard-store' }
  )
);
