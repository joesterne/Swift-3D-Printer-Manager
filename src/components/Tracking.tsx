import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  History,
  Box,
  Clock,
  Calendar,
  Search,
  X
} from 'lucide-react';
import { MOCK_LOGS } from '../constants';
import { PrintLog, QueueItem } from '../types';
import { queueItemToLog } from '../lib/printLogs';
import { useUser } from '../contexts/UserContext';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

// "12h 45m" / "1h 30m" -> minutes; unparseable counts as 0.
function timeToMinutes(time: string): number {
  const h = time.match(/(\d+(?:\.\d+)?)\s*h/);
  const m = time.match(/(\d+)\s*m/);
  return (h ? parseFloat(h[1]) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
}

// "245g" / "4.2kg" -> grams; unparseable counts as 0.
function filamentToGrams(filament: string): number {
  const n = parseFloat(filament);
  if (isNaN(n)) return 0;
  return filament.toLowerCase().includes('kg') ? n * 1000 : n;
}

export function Tracking() {
  const { user } = useUser();
  const [liveLogs, setLiveLogs] = useState<PrintLog[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Signed in: the user's real print_queue history (same source and mapping
  // as the Dashboard). This page used to render ONLY the hardcoded mock
  // logs regardless of sign-in, with hardcoded header totals.
  useEffect(() => {
    if (!user) {
      setLiveLogs([]);
      return;
    }
    const queueRef = collection(db, 'users', user.uid, 'print_queue');
    const unsubscribe = onSnapshot(query(queueRef), (snapshot) => {
      const logs: PrintLog[] = snapshot.docs
        .map(doc => doc.data() as QueueItem)
        .filter(item => item.status === 'completed' || item.status === 'failed')
        .map((item, idx) => queueItemToLog(item, 1000 + idx));
      setLiveLogs(logs);
    }, () => {
      // Keep whatever is already shown; the Dashboard has the same posture.
    });
    return () => unsubscribe();
  }, [user]);

  const logs = user ? liveLogs : MOCK_LOGS;

  const filteredLogs = useMemo(() => {
    const start = startDate ? new Date(startDate).getTime() : null;
    const end = endDate ? new Date(endDate).getTime() : null;
    const lowerName = nameFilter.trim().toLowerCase();

    return logs.filter(log => {
      if (lowerName && !log.name.toLowerCase().includes(lowerName)) {
        return false;
      }
      if (statusFilter !== "All" && log.status !== statusFilter) {
        return false;
      }
      if (start || end) {
        const logTime = new Date(log.date).getTime();
        if (start && logTime < start) return false;
        if (end && logTime > end) return false;
      }
      return true;
    });
  }, [logs, nameFilter, statusFilter, startDate, endDate]);

  // Header totals are computed from the displayed rows — they used to be
  // hardcoded strings ("124h" / "4.2kg") unrelated to any data.
  const totals = useMemo(() => {
    const minutes = filteredLogs.reduce((sum, log) => sum + timeToMinutes(log.time), 0);
    const grams = filteredLogs.reduce((sum, log) => sum + filamentToGrams(log.filament), 0);
    return {
      time: minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`,
      filament: grams >= 1000 ? `${(grams / 1000).toFixed(1)}kg` : `${Math.round(grams)}g`,
    };
  }, [filteredLogs]);

  const clearFilters = () => {
    setNameFilter("");
    setStatusFilter("All");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-3xl font-black text-white">Print History</h3>
          <p className="text-white/40 font-medium">
            Track your usage and costs over time.
            {!user && <span className="text-cyan-400"> Showing demo data — sign in to see your real history.</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 px-4 py-1 rounded-full">
            Total: {totals.time}
          </Badge>
          <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 px-4 py-1 rounded-full">
            Total: {totals.filament}
          </Badge>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-6 flex flex-col lg:flex-row gap-4 items-end">
        <div className="w-full lg:w-1/3 space-y-2">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Model Name</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
            <Input
              placeholder="Search models..."
              className="pl-10 bg-white/5 border-white/10 focus:ring-cyan-500 text-white"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full lg:w-48 space-y-2">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Status</label>
          <select
            className="w-full h-10 bg-white/5 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All" className="bg-[#0a0a0a]">All Status</option>
            <option value="Success" className="bg-[#0a0a0a]">Success</option>
            <option value="Failed" className="bg-[#0a0a0a]">Failed</option>
          </select>
        </div>

        <div className="w-full lg:flex-1 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">From</label>
            <Input
              type="date"
              className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">To</label>
            <Input
              type="date"
              className="bg-white/5 border-white/10 text-white [color-scheme:dark]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <Button
          variant="ghost"
          className="h-10 px-4 text-white/40 hover:text-white hover:bg-white/5"
          onClick={clearFilters}
        >
          <X size={16} className="mr-2" /> Clear
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-[2px]">Model</th>
                <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-[2px]">Date</th>
                <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-[2px]">Time</th>
                <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-[2px]">Filament</th>
                <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-[2px]">Cost</th>
                <th className="p-6 text-[10px] font-black text-white/30 uppercase tracking-[2px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/5 rounded-lg text-white/20 group-hover:text-cyan-400 transition-colors">
                          <Box size={18} />
                        </div>
                        <span className="text-sm font-bold text-white">{log.name}</span>
                      </div>
                    </td>
                    <td className="p-6 text-sm text-white/60 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-white/20" />
                        {log.date}
                      </div>
                    </td>
                    <td className="p-6 text-sm text-white/60 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-white/20" />
                        {log.time}
                      </div>
                    </td>
                    <td className="p-6 text-sm text-white/60 font-medium">{log.filament}</td>
                    <td className="p-6 text-sm text-white/60 font-medium">{log.cost}</td>
                    <td className="p-6">
                      <Badge variant={log.status === 'Success' ? 'default' : 'destructive'} className="text-[9px] px-2 py-0 font-bold uppercase">
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center justify-center text-white/20 space-y-4">
                      <History size={48} />
                      <p className="font-medium">No print logs found matching your filters.</p>
                      <Button variant="outline" size="sm" onClick={clearFilters} className="border-white/10 text-white/60">
                        Reset Filters
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
