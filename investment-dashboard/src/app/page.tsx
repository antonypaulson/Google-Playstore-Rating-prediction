'use client';

import { useState } from 'react';
import PortfolioDashboard from '@/components/PortfolioDashboard';
import OpportunityScanner from '@/components/OpportunityScanner';
import NewsFeed from '@/components/NewsFeed';
import ThesisTracker from '@/components/ThesisTracker';
import PriceAlerts from '@/components/PriceAlerts';
import LumpSumTracker from '@/components/LumpSumTracker';
import { BarChart2, Zap, Newspaper, BookOpen, Bell, DollarSign } from 'lucide-react';

const TABS = [
  { id: 'portfolio', label: 'Portfolio', icon: BarChart2 },
  { id: 'opportunities', label: 'Opportunities', icon: Zap },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'thesis', label: 'Thesis', icon: BookOpen },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'lumpsum', label: 'Deployments', icon: DollarSign },
] as const;

type TabId = typeof TABS[number]['id'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('portfolio');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1425 50%, #0a0f1a 100%)' }}>
      <header className="border-b border-slate-800/60 sticky top-0 z-50 backdrop-blur-md" style={{ backgroundColor: 'rgba(10, 15, 26, 0.85)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <BarChart2 size={14} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Investment Command Center</div>
                <div className="text-xs text-slate-500">2028 Aggressive Growth · AI Infrastructure</div>
              </div>
            </div>
            <div className="text-xs text-slate-600">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div className="flex gap-0.5 pb-0 -mb-px overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-all ${
                    isActive ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'portfolio' && <PortfolioDashboard />}
        {activeTab === 'opportunities' && <OpportunityScanner />}
        {activeTab === 'news' && <NewsFeed />}
        {activeTab === 'thesis' && <ThesisTracker />}
        {activeTab === 'alerts' && <PriceAlerts />}
        {activeTab === 'lumpsum' && <LumpSumTracker />}
      </main>
    </div>
  );
}
