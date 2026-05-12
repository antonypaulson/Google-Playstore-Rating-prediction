'use client';

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { StockQuote } from '@/lib/types';
import { formatCurrency, formatPercent, getChangeColor, getChangeBg } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  'ai-infra': '#3b82f6', 'core': '#8b5cf6', 'etf': '#10b981', 'hedge': '#f59e0b', 'cash': '#6b7280',
};
const CATEGORY_LABELS: Record<string, string> = {
  'ai-infra': 'AI Infra', 'core': 'Core Tech', 'etf': 'ETFs', 'hedge': 'Hedge', 'cash': 'Cash',
};

export default function PortfolioDashboard() {
  const { portfolio, quotes, setQuotes } = useStore();
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    try {
      const symbols = portfolio.filter(p => p.symbol !== 'CASH' && p.symbol !== 'FLIN' && p.symbol !== 'INDY').map(p => p.symbol).join(',');
      const res = await fetch(`/api/stocks?symbols=${symbols}`);
      const data = await res.json();
      setQuotes(data as Record<string, StockQuote>);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) { console.error('Failed to fetch quotes:', err); }
    finally { setLoading(false); }
  }, [portfolio, setQuotes]);

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, [fetchQuotes]);

  const totalValue = portfolio.reduce((sum, p) => sum + p.value, 0);
  const totalDayChange = portfolio.reduce((sum, p) => {
    const q = quotes[p.symbol];
    if (!q || typeof q.changePercent !== 'number') return sum;
    return sum + (p.value * q.changePercent / 100);
  }, 0);
  const totalDayChangePercent = (totalDayChange / totalValue) * 100;
  const categoryData = Object.entries(
    portfolio.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + p.value; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: CATEGORY_LABELS[name] || name, value, category: name }));
  const GOAL_2028 = totalValue * 3;
  const aiInfraValue = portfolio.filter(p => p.category === 'ai-infra').reduce((s, p) => s + p.value, 0);
  const aiInfraPercent = (aiInfraValue / totalValue) * 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card><CardContent className="py-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><DollarSign size={12} /> Portfolio Value</div>
          <div className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
          <div className={`text-xs mt-0.5 ${getChangeColor(totalDayChange)}`}>{formatCurrency(totalDayChange)} today</div>
        </CardContent></Card>
        <Card><CardContent className="py-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">{totalDayChange >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} Day Change</div>
          <div className={`text-2xl font-bold ${getChangeColor(totalDayChangePercent)}`}>{formatPercent(totalDayChangePercent)}</div>
          <div className="text-xs text-slate-500 mt-0.5">{formatCurrency(totalDayChange)}</div>
        </CardContent></Card>
        <Card><CardContent className="py-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><Target size={12} /> AI Infra Exposure</div>
          <div className="text-2xl font-bold text-blue-400">{aiInfraPercent.toFixed(1)}%</div>
          <div className="text-xs text-slate-500 mt-0.5">{formatCurrency(aiInfraValue)}</div>
        </CardContent></Card>
        <Card><CardContent className="py-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1"><TrendingUp size={12} /> 2028 3x Target</div>
          <div className="text-2xl font-bold text-purple-400">{formatCurrency(GOAL_2028)}</div>
          <div className="text-xs text-slate-500 mt-0.5">~3x from {formatCurrency(totalValue)}</div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Holdings</CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchQuotes} disabled={loading}>
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              {lastUpdated ? `Updated ${lastUpdated}` : 'Refresh'}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-5 py-2.5 text-xs text-slate-500 font-medium">Symbol</th>
                    <th className="text-right px-3 py-2.5 text-xs text-slate-500 font-medium">Value</th>
                    <th className="text-right px-3 py-2.5 text-xs text-slate-500 font-medium">Price</th>
                    <th className="text-right px-3 py-2.5 text-xs text-slate-500 font-medium">Day</th>
                    <th className="text-right px-5 py-2.5 text-xs text-slate-500 font-medium">Alloc</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((position) => {
                    const quote = quotes[position.symbol];
                    const alloc = (position.value / totalValue) * 100;
                    const hasQuote = quote && typeof quote.price === 'number';
                    return (
                      <tr key={position.symbol} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[position.category] || '#6b7280' }} />
                            <div>
                              <div className="font-semibold text-white">{position.symbol}</div>
                              <div className="text-xs text-slate-500 truncate max-w-[120px]">{position.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right text-slate-200 font-medium">{formatCurrency(position.value, 0)}</td>
                        <td className="px-3 py-3 text-right text-slate-300">{hasQuote ? `$${quote.price.toFixed(2)}` : '–'}</td>
                        <td className="px-3 py-3 text-right">
                          {hasQuote ? (
                            <span className={`text-xs font-medium ${getChangeBg(quote.changePercent)} px-1.5 py-0.5 rounded`}>{formatPercent(quote.changePercent)}</span>
                          ) : <span className="text-slate-600">–</span>}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 bg-slate-700 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(alloc * 2.5, 100)}%`, backgroundColor: CATEGORY_COLORS[position.category] || '#6b7280' }} />
                            </div>
                            <span className="text-slate-400 text-xs w-10 text-right">{alloc.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Allocation by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#6b7280'} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value), 0)} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {categoryData.map((cat) => (
                  <div key={cat.category} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat.category] }} />
                    <span className="text-xs text-slate-400">{cat.name}</span>
                    <span className="text-xs text-slate-500 ml-auto">{((cat.value / totalValue) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Buddy&apos;s Read</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-amber-400 bg-amber-400/10 rounded-lg p-2.5 border border-amber-400/20">⚡ NVDA at 38% is extreme concentration. Consider trimming 10% if it rips further.</div>
              <div className="text-xs text-blue-400 bg-blue-400/10 rounded-lg p-2.5 border border-blue-400/20">💡 GLD (13%) is dead weight for 2yr aggressive growth. Redeploy into VST, CEG, or ANET.</div>
              <div className="text-xs text-emerald-400 bg-emerald-400/10 rounded-lg p-2.5 border border-emerald-400/20">✅ AI Infra exposure at {aiInfraPercent.toFixed(0)}% — strong base. Add power/energy leg.</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
