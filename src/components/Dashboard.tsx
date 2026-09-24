import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Printer, Box, Clock, Zap, AlertCircle, ChevronRight, CheckCircle2, XCircle, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { RecentPrintItem } from './RecentPrintItem';
import { MOCK_LOGS } from '../constants';
import { PrintLog, QueueItem } from '../types';
import { useUser } from '../contexts/UserContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

const activityData = [
  { name: 'Mon', time: 4 },
  { name: 'Tue', time: 7 },
  { name: 'Wed', time: 5 },
  { name: 'Thu', time: 12 },
  { name: 'Fri', time: 9 },
  { name: 'Sat', time: 15 },
  { name: 'Sun', time: 10 },
];

interface DashboardProps {
  onNavigateToTracking?: () => void;
}

export function Dashboard({ onNavigateToTracking }: DashboardProps) {
  const { user } = useUser();
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const [userQueueLogs, setUserQueueLogs] = useState<PrintLog[]>([]);

  // Listen to completed/failed jobs from user's print queue if logged in
  useEffect(() => {
    if (!user) {
      setUserQueueLogs([]);
      return;
    }

    const queueRef = collection(db, 'users', user.uid, 'print_queue');
    const q = query(queueRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveLogs: PrintLog[] = snapshot.docs
        .map(doc => doc.data() as QueueItem)
        .filter(item => item.status === 'completed' || item.status === 'failed')
        .map((item, idx) => ({
          id: 1000 + idx,
          name: item.name,
          date: item.createdAt ? item.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
          time: item.time || '1h 00m',
          filament: item.filament || '20g',
          cost: '$0.50',
          status: item.status === 'completed' ? 'Success' : 'Failed'
        }));
      setUserQueueLogs(liveLogs);
    }, () => {
      // Graceful fallback to default mock logs
    });

    return () => unsubscribe();
  }, [user]);

  // Combine baseline mock history data with live user print queue history
  const combinedHistory = useMemo(() => {
    return [...userQueueLogs, ...MOCK_LOGS];
  }, [userQueueLogs]);

  // Compute success and failure counts from history data
  const { successfulCount, failedCount, totalCount, successRate, summaryChartData } = useMemo(() => {
    const successful = combinedHistory.filter(item => item.status.toLowerCase() === 'success');
    const failed = combinedHistory.filter(item => item.status.toLowerCase() === 'failed');
    const total = combinedHistory.length;
    const rate = total > 0 ? Math.round((successful.length / total) * 100) : 0;

    const chartData = [
      { name: 'Successful', count: successful.length, color: '#10b981' },
      { name: 'Failed', count: failed.length, color: '#f43f5e' },
    ];

    return {
      successfulCount: successful.length,
      failedCount: failed.length,
      totalCount: total,
      successRate: rate,
      summaryChartData: chartData
    };
  }, [combinedHistory]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Print Card */}
        <div className="lg:col-span-8 glass-card p-8 flex flex-col min-h-[400px]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Low-Poly Planter.stl</h3>
              <p className="text-sm text-white/60">Printing with PLA Silver • Bambu Lab X1-Carbon</p>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-cyan-400 flex items-center justify-center text-xl font-bold text-white shadow-[0_0_20px_rgba(0,242,255,0.2)]">
              78%
            </div>
          </div>
          <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="text-white/40 text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live Camera Stream Feed
            </div>
          </div>
        </div>

        {/* Stats Container */}
        <div className="lg:col-span-4 grid grid-rows-2 gap-6">
          <div className="glass-card p-8 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[2px] text-white/40 font-bold mb-2">Filament Usage (30D)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">4.82</span>
              <span className="text-lg text-white/60">kg</span>
            </div>
            <p className="text-xs text-emerald-400 mt-2 font-medium">↑ 12% from last month</p>
          </div>
          <div className="glass-card p-8 flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[2px] text-white/40 font-bold mb-2">Total Print Time</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">1,248</span>
              <span className="text-lg text-white/60">hrs</span>
            </div>
            <p className="text-xs text-white/40 mt-2 font-medium">3 printers active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Print Activity (Area Chart) */}
        <div className="lg:col-span-2 glass-card p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-white">Print Activity</h3>
                <p className="text-xs text-white/40">Printing duration trends</p>
              </div>
              <Badge variant="outline" className="text-white/40 border-white/10">Last 7 Days</Badge>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F2FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00F2FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#00F2FF' }}
                  />
                  <Area type="monotone" dataKey="time" stroke="#00F2FF" fillOpacity={1} fill="url(#colorTime)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Prints Summary Section (Recharts Success vs Failed) */}
        <div className="glass-card p-8 flex flex-col justify-between">
          <div>
            {/* Header & Chart Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Recent Prints Summary</h3>
                <p className="text-xs text-white/40">Success vs. Failure breakdown</p>
              </div>
              <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setChartType('donut')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                    chartType === 'donut' 
                      ? 'bg-cyan-500 text-black shadow-sm' 
                      : 'text-white/40 hover:text-white'
                  }`}
                  title="View ratio donut chart"
                >
                  Ratio
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
                    chartType === 'bar' 
                      ? 'bg-cyan-500 text-black shadow-sm' 
                      : 'text-white/40 hover:text-white'
                  }`}
                  title="View count bar chart"
                >
                  Bar
                </button>
              </div>
            </div>

            {/* Recharts Visualization Card */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
              <div className="flex items-center gap-4">
                {/* Recharts Chart */}
                <div className="w-28 h-28 relative flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'donut' ? (
                      <PieChart>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            fontSize: '11px',
                            padding: '6px 10px',
                          }}
                        />
                        <Pie
                          data={summaryChartData}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={32}
                          outerRadius={48}
                          paddingAngle={4}
                          stroke="transparent"
                        >
                          {summaryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    ) : (
                      <BarChart data={summaryChartData} margin={{ top: 8, right: 4, bottom: 0, left: -28 }}>
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            fontSize: '11px',
                            padding: '6px 10px',
                          }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {summaryChartData.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>

                  {/* Center Text for Donut */}
                  {chartType === 'donut' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-sm font-black text-white">{successRate}%</span>
                      <span className="text-[7px] text-emerald-400 font-extrabold uppercase tracking-wider">Pass</span>
                    </div>
                  )}
                </div>

                {/* Metrics Breakdown */}
                <div className="flex-1 space-y-2">
                  <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-emerald-300">Successful</span>
                    </div>
                    <span className="text-sm font-mono font-black text-white">{successfulCount}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-xs font-bold text-red-300">Failed</span>
                    </div>
                    <span className="text-sm font-mono font-black text-white">{failedCount}</span>
                  </div>

                  <div className="px-1 flex items-center justify-between text-[10px] text-white/40 font-medium">
                    <span>Total Recorded</span>
                    <span className="font-mono text-white/70">{totalCount} prints</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Prints Feed */}
            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-[1.5px] text-white/40 font-bold px-1">
                Recent Print Jobs
              </p>
              <div className="space-y-2.5">
                {combinedHistory.slice(0, 3).map((item) => (
                  <RecentPrintItem 
                    key={item.id} 
                    name={item.name} 
                    status={item.status === 'Success' ? 'Completed' : 'Failed'} 
                    time={item.time} 
                    error={item.status === 'Failed'} 
                  />
                ))}
              </div>
            </div>
          </div>

          <Button 
            variant="ghost" 
            onClick={onNavigateToTracking}
            className="w-full mt-6 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
          >
            View All History <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
