'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Bell, BellOff, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export default function PriceAlerts() {
  const { alerts, quotes, addAlert, removeAlert } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ symbol: '', type: 'below' as 'above' | 'below', price: '', note: '' });

  const handleAdd = () => {
    if (!form.symbol || !form.price) return;
    addAlert({ symbol: form.symbol.toUpperCase(), type: form.type, price: parseFloat(form.price), note: form.note });
    setForm({ symbol: '', type: 'below', price: '', note: '' });
    setShowForm(false);
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}><Plus size={12} /> New Alert</Button>
      </div>
      {showForm && (
        <Card className="border-blue-500/30"><CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Symbol" value={form.symbol} onChange={e => setForm(p => ({ ...p, symbol: e.target.value.toUpperCase() }))} />
            <select className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'above' | 'below' }))}>
              <option value="below">Drops below</option><option value="above">Rises above</option>
            </select>
            <input type="number" className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Price $" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
          </div>
          <input className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Note (e.g. Entry point if market corrects)" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAdd}>Set Alert</Button>
          </div>
        </CardContent></Card>
      )}
      {alerts.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><Bell size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No price alerts set.</p></div>
      ) : (
        <div className="space-y-4">
          {activeAlerts.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Active Alerts</div>
              <div className="space-y-2">
                {activeAlerts.map((alert) => {
                  const quote = quotes[alert.symbol];
                  const currentPrice = quote?.price;
                  const isTriggered = currentPrice ? (alert.type === 'above' ? currentPrice >= alert.price : currentPrice <= alert.price) : false;
                  const diff = currentPrice ? ((currentPrice - alert.price) / alert.price) * 100 : null;
                  return (
                    <Card key={alert.id} className={isTriggered ? 'border-amber-500/50' : ''}><CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${isTriggered ? 'bg-amber-500/20' : 'bg-slate-700/50'}`}>
                            {alert.type === 'above' ? <ArrowUp size={14} className={isTriggered ? 'text-amber-400' : 'text-emerald-400'} /> : <ArrowDown size={14} className={isTriggered ? 'text-amber-400' : 'text-blue-400'} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{alert.symbol}</span>
                              <span className="text-sm text-slate-400">{alert.type === 'above' ? 'rises above' : 'drops below'}</span>
                              <span className="text-white font-medium">{formatCurrency(alert.price)}</span>
                              {isTriggered && <Badge variant="warning">🔔 Triggered</Badge>}
                            </div>
                            {alert.note && <div className="text-xs text-slate-500 mt-0.5">{alert.note}</div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          {currentPrice && <div className="text-right"><div className="text-sm text-slate-300">${currentPrice.toFixed(2)}</div>{diff !== null && <div className={`text-xs ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{diff >= 0 ? '+' : ''}{diff.toFixed(1)}% from target</div>}</div>}
                          <button onClick={() => removeAlert(alert.id)} className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </CardContent></Card>
                  );
                })}
              </div>
            </div>
          )}
          {triggeredAlerts.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-600 uppercase tracking-wider mb-2">Triggered</div>
              <div className="space-y-2 opacity-60">
                {triggeredAlerts.map((alert) => (
                  <Card key={alert.id}><CardContent className="py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-500"><BellOff size={12} /><span>{alert.symbol}</span><span>{alert.type === 'above' ? '↑' : '↓'}</span><span>{formatCurrency(alert.price)}</span>{alert.triggeredAt && <span>· {timeAgo(alert.triggeredAt)}</span>}</div>
                      <button onClick={() => removeAlert(alert.id)} className="text-slate-700 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </CardContent></Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
