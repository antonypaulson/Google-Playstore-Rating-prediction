'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, getChangeColor } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DollarSign, Plus, Trash2, TrendingUp } from 'lucide-react';

export default function LumpSumTracker() {
  const { lumpSums, quotes, addLumpSum, deleteLumpSum } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], symbol: '', amount: '', priceAtEntry: '', reason: '' });

  const handleAdd = () => {
    if (!form.symbol || !form.amount || !form.priceAtEntry) return;
    const amount = parseFloat(form.amount);
    const price = parseFloat(form.priceAtEntry);
    addLumpSum({ date: form.date, symbol: form.symbol.toUpperCase(), amount, priceAtEntry: price, shares: amount / price, reason: form.reason });
    setForm({ date: new Date().toISOString().split('T')[0], symbol: '', amount: '', priceAtEntry: '', reason: '' });
    setShowForm(false);
  };

  const enrichedEntries = lumpSums.map(entry => {
    const quote = quotes[entry.symbol];
    const currentPrice = quote?.price ?? entry.priceAtEntry;
    const currentValue = entry.shares * currentPrice;
    const gainLoss = currentValue - entry.amount;
    return { ...entry, currentValue, gainLoss, gainLossPercent: (gainLoss / entry.amount) * 100, currentPrice };
  });

  const totalDeployed = enrichedEntries.reduce((s, e) => s + e.amount, 0);
  const totalCurrentValue = enrichedEntries.reduce((s, e) => s + e.currentValue, 0);
  const totalGainLoss = totalCurrentValue - totalDeployed;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}><Plus size={12} /> Log Lump Sum</Button>
      </div>
      {showForm && (
        <Card className="border-blue-500/30"><CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
            <input className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Symbol" value={form.symbol} onChange={e => setForm(p => ({ ...p, symbol: e.target.value.toUpperCase() }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Amount invested ($)" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            <input type="number" className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Price at entry ($)" value={form.priceAtEntry} onChange={e => setForm(p => ({ ...p, priceAtEntry: e.target.value }))} />
          </div>
          <input className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Reason for entry" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAdd}>Log Entry</Button>
          </div>
        </CardContent></Card>
      )}
      {lumpSums.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card><CardContent className="py-3"><div className="text-xs text-slate-500 mb-1">Total Deployed</div><div className="text-xl font-bold text-white">{formatCurrency(totalDeployed, 0)}</div></CardContent></Card>
          <Card><CardContent className="py-3"><div className="text-xs text-slate-500 mb-1">Current Value</div><div className="text-xl font-bold text-white">{formatCurrency(totalCurrentValue, 0)}</div></CardContent></Card>
          <Card><CardContent className="py-3"><div className="text-xs text-slate-500 mb-1">Total P&L</div><div className={`text-xl font-bold ${getChangeColor(totalGainLoss)}`}>{totalGainLoss >= 0 ? '+' : ''}{formatCurrency(totalGainLoss, 0)}</div></CardContent></Card>
        </div>
      )}
      {lumpSums.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><DollarSign size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No lump sums logged yet.</p></div>
      ) : (
        <div className="space-y-2">
          {enrichedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
            <Card key={entry.id}><CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-500 w-20 flex-shrink-0">{entry.date}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{entry.symbol}</span>
                      <span className="text-sm text-slate-400">{formatCurrency(entry.amount, 0)}</span>
                      <span className="text-xs text-slate-600">@ ${entry.priceAtEntry.toFixed(2)}</span>
                      <span className="text-xs text-slate-600">({entry.shares.toFixed(2)} shares)</span>
                    </div>
                    {entry.reason && <div className="text-xs text-slate-500 mt-0.5">{entry.reason}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-3">
                  <div className="text-right">
                    <div className="text-sm text-slate-300">{formatCurrency(entry.currentValue, 0)}</div>
                    <div className={`text-xs flex items-center gap-0.5 ${getChangeColor(entry.gainLoss)}`}><TrendingUp size={10} />{entry.gainLoss >= 0 ? '+' : ''}{formatCurrency(entry.gainLoss, 0)} ({entry.gainLossPercent >= 0 ? '+' : ''}{entry.gainLossPercent.toFixed(1)}%)</div>
                  </div>
                  <button onClick={() => deleteLumpSum(entry.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
