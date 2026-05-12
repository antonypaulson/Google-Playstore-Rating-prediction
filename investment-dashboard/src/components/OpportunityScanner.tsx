'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { WatchlistItem } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Zap, Brain, Plus, Trash2, ExternalLink } from 'lucide-react';

const SUB_SECTOR_LABELS: Record<string, string> = {
  'semiconductors': 'Chips', 'power-energy': 'Power/Energy', 'cloud': 'Cloud',
  'robotics': 'Robotics', 'networking': 'Networking', 'data-center': 'Data Center', 'software': 'AI Software',
};
const SUB_SECTOR_COLORS: Record<string, 'default' | 'success' | 'danger' | 'warning' | 'info' | 'purple'> = {
  'semiconductors': 'info', 'power-energy': 'warning', 'cloud': 'purple',
  'robotics': 'success', 'networking': 'info', 'data-center': 'default', 'software': 'purple',
};
const CONVICTION_BADGE: Record<string, 'default' | 'success' | 'danger' | 'warning' | 'info' | 'purple'> = {
  'high': 'success', 'medium': 'warning', 'low': 'default',
};

interface AIResult { analysis: string; recommendation: string; generatedAt: string; }

export default function OpportunityScanner() {
  const { watchlist, quotes, removeFromWatchlist, addToWatchlist } = useStore();
  const [analysisMap, setAnalysisMap] = useState<Record<string, AIResult>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterSector, setFilterSector] = useState<string>('all');
  const [newItem, setNewItem] = useState<Partial<WatchlistItem>>({ symbol: '', name: '', sector: '', subSector: 'semiconductors', thesis: '', conviction: 'medium', tags: [] });

  const analyzeStock = async (item: WatchlistItem) => {
    setLoadingMap(prev => ({ ...prev, [item.id]: true }));
    try {
      const quote = quotes[item.symbol];
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: item.symbol, type: 'stock-analysis', currentPrice: quote?.price, context: item.thesis }),
      });
      const data = await res.json();
      if (!data.error) setAnalysisMap(prev => ({ ...prev, [item.id]: data }));
    } catch (err) { console.error('Analysis failed:', err); }
    finally { setLoadingMap(prev => ({ ...prev, [item.id]: false })); }
  };

  const handleAdd = () => {
    if (!newItem.symbol || !newItem.name || !newItem.thesis) return;
    addToWatchlist({ symbol: newItem.symbol!.toUpperCase(), name: newItem.name!, sector: newItem.sector || 'Unknown', subSector: newItem.subSector as WatchlistItem['subSector'], thesis: newItem.thesis!, conviction: newItem.conviction as WatchlistItem['conviction'], tags: [] });
    setNewItem({ symbol: '', name: '', sector: '', subSector: 'semiconductors', thesis: '', conviction: 'medium', tags: [] });
    setShowAddForm(false);
  };

  const sectors = ['all', ...Array.from(new Set(watchlist.map(w => w.subSector)))];
  const filtered = filterSector === 'all' ? watchlist : watchlist.filter(w => w.subSector === filterSector);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {sectors.map(s => (
            <button key={s} onClick={() => setFilterSector(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterSector === s ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}>
              {s === 'all' ? 'All' : SUB_SECTOR_LABELS[s] || s}
            </button>
          ))}
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddForm(!showAddForm)}><Plus size={12} /> Add Stock</Button>
      </div>

      {showAddForm && (
        <Card className="border-blue-500/30">
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Symbol" value={newItem.symbol} onChange={e => setNewItem(p => ({ ...p, symbol: e.target.value.toUpperCase() }))} />
              <input className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Company Name" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} />
            </div>
            <select className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" value={newItem.subSector} onChange={e => setNewItem(p => ({ ...p, subSector: e.target.value as WatchlistItem['subSector'] }))}>
              {Object.entries(SUB_SECTOR_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <textarea className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Investment thesis..." rows={3} value={newItem.thesis} onChange={e => setNewItem(p => ({ ...p, thesis: e.target.value }))} />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleAdd}>Add to Watchlist</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const quote = quotes[item.symbol];
          const analysis = analysisMap[item.id];
          const isLoading = loadingMap[item.id];
          return (
            <Card key={item.id}>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{item.symbol}</span>
                      <Badge variant={CONVICTION_BADGE[item.conviction]}>{item.conviction} conviction</Badge>
                      <Badge variant={SUB_SECTOR_COLORS[item.subSector]}>{SUB_SECTOR_LABELS[item.subSector] || item.subSector}</Badge>
                    </div>
                    <div className="text-sm text-slate-400">{item.name}</div>
                  </div>
                  <div className="flex gap-1">
                    {quote?.price && (
                      <div className="text-right mr-2">
                        <div className="text-white font-semibold">${quote.price.toFixed(2)}</div>
                        <div className={`text-xs ${quote.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%</div>
                      </div>
                    )}
                    <button onClick={() => removeFromWatchlist(item.id)} className="text-slate-600 hover:text-red-400 transition-colors p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.thesis}</p>
                {item.tags.length > 0 && <div className="flex gap-1 flex-wrap">{item.tags.map(tag => <span key={tag} className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">#{tag}</span>)}</div>}
                {analysis && (
                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Brain size={12} className="text-purple-400" />
                      <span className="text-xs font-medium text-purple-400">Claude Analysis</span>
                      <span className="text-xs text-slate-600 ml-auto">{timeAgo(analysis.generatedAt)}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{analysis.analysis}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => analyzeStock(item)} disabled={isLoading} className="text-purple-400 hover:text-purple-300">
                    <Brain size={12} className={isLoading ? 'animate-pulse' : ''} />
                    {isLoading ? 'Analyzing...' : 'AI Analysis'}
                  </Button>
                  <a href={`https://finance.yahoo.com/quote/${item.symbol}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors ml-auto">
                    Yahoo Finance <ExternalLink size={10} />
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-slate-500"><Zap size={32} className="mx-auto mb-2 opacity-30" /><p>No stocks in this sector yet.</p></div>}
    </div>
  );
}
