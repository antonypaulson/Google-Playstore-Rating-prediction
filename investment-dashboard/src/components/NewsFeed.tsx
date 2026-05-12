'use client';

import { useState, useEffect, useCallback } from 'react';
import { NewsArticle } from '@/lib/types';
import { timeAgo } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RefreshCw, ExternalLink, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SENTIMENT_ICONS = {
  bullish: <TrendingUp size={12} />, bearish: <TrendingDown size={12} />, neutral: <Minus size={12} />,
};
const SENTIMENT_BADGE: Record<string, 'default' | 'success' | 'danger' | 'warning' | 'info' | 'purple'> = {
  bullish: 'success', bearish: 'danger', neutral: 'default',
};

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'bullish' | 'bearish'>('all');
  const [minScore, setMinScore] = useState(1);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?minScore=${minScore}`);
      const data = await res.json();
      setArticles(data.articles || []);
      setLastFetch(new Date().toLocaleTimeString());
    } catch (err) { console.error('Failed to fetch news:', err); }
    finally { setLoading(false); }
  }, [minScore]);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const filtered = filter === 'all' ? articles : articles.filter(a => a.sentiment === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          {(['all', 'bullish', 'bearish'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}>
              {f === 'all' ? 'All News' : f === 'bullish' ? '🟢 Bullish' : '🔴 Bearish'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Flame size={12} /> Min relevance:
            <select value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="bg-slate-700/50 border border-slate-600 rounded px-2 py-0.5 text-slate-300 text-xs focus:outline-none">
              <option value={1}>1+</option><option value={2}>2+</option><option value={3}>3+ (AI focused)</option><option value={5}>5+ (highly relevant)</option>
            </select>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchNews} disabled={loading}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />{lastFetch ?? 'Fetch'}
          </Button>
        </div>
      </div>

      {loading && articles.length === 0 && <div className="text-center py-12 text-slate-500"><RefreshCw size={24} className="animate-spin mx-auto mb-2" /><p className="text-sm">Fetching AI infrastructure news...</p></div>}

      <div className="space-y-3">
        {filtered.map((article) => (
          <Card key={article.id} className="hover:border-slate-600/70 transition-colors">
            <CardContent className="py-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-200 hover:text-white transition-colors leading-snug line-clamp-2 block mb-1.5">{article.title}</a>
                  {article.summary && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-2">{article.summary}</p>}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-600">{article.source}</span>
                    <span className="text-xs text-slate-700">·</span>
                    <span className="text-xs text-slate-600">{timeAgo(article.publishedAt)}</span>
                    <span className="text-xs text-slate-700">·</span>
                    <Badge variant={SENTIMENT_BADGE[article.sentiment]}><span className="flex items-center gap-0.5">{SENTIMENT_ICONS[article.sentiment]}{article.sentiment}</span></Badge>
                    {article.relatedSymbols.slice(0, 4).map(s => <span key={s} className="text-xs text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">{s}</span>)}
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(article.relevanceScore, 5) }).map((_, i) => <Flame key={i} size={10} className="text-orange-400" />)}
                    {Array.from({ length: Math.max(5 - article.relevanceScore, 0) }).map((_, i) => <Flame key={i} size={10} className="text-slate-700" />)}
                  </div>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-400 transition-colors"><ExternalLink size={12} /></a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!loading && filtered.length === 0 && <div className="text-center py-12 text-slate-500"><p className="text-sm">No articles found. Try lowering the relevance filter.</p><Button variant="secondary" size="sm" className="mt-3" onClick={fetchNews}>Refresh Feed</Button></div>}
    </div>
  );
}
