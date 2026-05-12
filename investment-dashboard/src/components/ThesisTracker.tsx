'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { InvestmentThesis } from '@/lib/types';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BookOpen, Plus, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const STATUS_CONFIG = {
  active: { label: 'Active', variant: 'success' as const, icon: <CheckCircle size={12} /> },
  monitoring: { label: 'Monitoring', variant: 'warning' as const, icon: <Clock size={12} /> },
  closed: { label: 'Closed', variant: 'default' as const, icon: <AlertCircle size={12} /> },
};

export default function ThesisTracker() {
  const { theses, addThesis, deleteThesis, updateThesis } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ symbol: '', title: '', thesis: '', catalysts: '', risks: '', targetPrice: '', targetDate: '2027-12-31', status: 'active' as InvestmentThesis['status'] });

  const handleAdd = () => {
    if (!form.symbol || !form.thesis) return;
    addThesis({
      symbol: form.symbol.toUpperCase(), title: form.title || `${form.symbol.toUpperCase()} 2028 thesis`,
      thesis: form.thesis, catalysts: form.catalysts.split('\n').filter(Boolean), risks: form.risks.split('\n').filter(Boolean),
      targetPrice: parseFloat(form.targetPrice) || 0, targetDate: form.targetDate, status: form.status,
    });
    setForm({ symbol: '', title: '', thesis: '', catalysts: '', risks: '', targetPrice: '', targetDate: '2027-12-31', status: 'active' });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setShowForm(!showForm)}><Plus size={12} /> New Thesis</Button>
      </div>
      {showForm && (
        <Card className="border-blue-500/30"><CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Symbol" value={form.symbol} onChange={e => setForm(p => ({ ...p, symbol: e.target.value.toUpperCase() }))} />
            <input className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Title (optional)" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <textarea className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Investment thesis..." rows={4} value={form.thesis} onChange={e => setForm(p => ({ ...p, thesis: e.target.value }))} />
          <div className="grid grid-cols-2 gap-3">
            <textarea className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Catalysts (one per line)" rows={3} value={form.catalysts} onChange={e => setForm(p => ({ ...p, catalysts: e.target.value }))} />
            <textarea className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Risks (one per line)" rows={3} value={form.risks} onChange={e => setForm(p => ({ ...p, risks: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" placeholder="Price target $" value={form.targetPrice} onChange={e => setForm(p => ({ ...p, targetPrice: e.target.value }))} />
            <input type="date" className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} />
            <select className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as InvestmentThesis['status'] }))}>
              <option value="active">Active</option><option value="monitoring">Monitoring</option><option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleAdd}>Save Thesis</Button>
          </div>
        </CardContent></Card>
      )}
      {theses.length === 0 ? (
        <div className="text-center py-16 text-slate-500"><BookOpen size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">No investment theses yet.</p></div>
      ) : (
        <div className="space-y-3">
          {theses.map((thesis) => {
            const config = STATUS_CONFIG[thesis.status];
            const isExpanded = expanded === thesis.id;
            return (
              <Card key={thesis.id}><CardContent className="py-3">
                <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(isExpanded ? null : thesis.id)}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold">{thesis.symbol}</span>
                      <Badge variant={config.variant}><span className="flex items-center gap-1">{config.icon}{config.label}</span></Badge>
                      {thesis.targetPrice > 0 && <span className="text-xs text-slate-500">Target: {formatCurrency(thesis.targetPrice)}</span>}
                    </div>
                    <div className="text-sm text-slate-300">{thesis.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Updated {timeAgo(thesis.updatedAt)}</div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <select className="bg-slate-700/50 border border-slate-600 rounded px-2 py-0.5 text-xs text-slate-300 focus:outline-none" value={thesis.status} onClick={e => e.stopPropagation()} onChange={e => updateThesis(thesis.id, { status: e.target.value as InvestmentThesis['status'] })}>
                      <option value="active">Active</option><option value="monitoring">Monitoring</option><option value="closed">Closed</option>
                    </select>
                    <button onClick={e => { e.stopPropagation(); deleteThesis(thesis.id); }} className="text-slate-600 hover:text-red-400 transition-colors p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 space-y-3 border-t border-slate-700/50 pt-3">
                    <p className="text-sm text-slate-300 leading-relaxed">{thesis.thesis}</p>
                    {thesis.catalysts.length > 0 && <div><div className="text-xs font-medium text-emerald-400 mb-1.5">Catalysts</div><ul className="space-y-1">{thesis.catalysts.map((c, i) => <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5"><span className="text-emerald-400 mt-0.5">→</span> {c}</li>)}</ul></div>}
                    {thesis.risks.length > 0 && <div><div className="text-xs font-medium text-red-400 mb-1.5">Risks</div><ul className="space-y-1">{thesis.risks.map((r, i) => <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5"><span className="text-red-400 mt-0.5">⚠</span> {r}</li>)}</ul></div>}
                  </div>
                )}
              </CardContent></Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
