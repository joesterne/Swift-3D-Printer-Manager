import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Printer, Box, Clock, Zap, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RecentPrintItem } from './RecentPrintItem';

const data = [
  { name: 'Mon', time: 4 },
  { name: 'Tue', time: 7 },
  { name: 'Wed', time: 5 },
  { name: 'Thu', time: 12 },
  { name: 'Fri', time: 9 },
  { name: 'Sat', time: 15 },
  { name: 'Sun', time: 10 },
];

export function Dashboard() {
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
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-white">Print Activity</h3>
            <Badge variant="outline" className="text-white/40 border-white/10">Last 7 Days</Badge>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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

        <div className="glass-card p-8">
          <h3 className="text-lg font-bold text-white mb-6">Recent Prints</h3>
          <div className="space-y-4">
            <RecentPrintItem name="Benchy_v2.stl" status="Completed" time="1h 45m" />
            <RecentPrintItem name="Articulated_Dragon.stl" status="Printing" time="12h 20m" progress={78} />
            <RecentPrintItem name="Tool_Holder.stl" status="Failed" time="45m" error />
            <RecentPrintItem name="Phone_Stand.stl" status="Completed" time="2h 10m" />
          </div>
          <Button variant="ghost" className="w-full mt-6 text-white/40 hover:text-white hover:bg-white/5 rounded-xl">
            View All History <ChevronRight size={16} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
