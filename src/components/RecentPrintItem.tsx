import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Box, AlertCircle } from 'lucide-react';

interface RecentPrintItemProps {
  name: string;
  status: string;
  time: string;
  progress?: number;
  error?: boolean;
}

export function RecentPrintItem({ name, status, time, progress, error }: RecentPrintItemProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${error ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-white/60 group-hover:text-cyan-400 transition-colors'}`}>
          {error ? <AlertCircle size={18} /> : <Box size={18} />}
        </div>
        <div>
          <p className="text-sm font-semibold text-white truncate w-32">{name}</p>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{time}</p>
        </div>
      </div>
      <div className="text-right">
        <Badge variant={status === 'Completed' ? 'default' : status === 'Printing' ? 'secondary' : 'destructive'} className="text-[9px] px-2 py-0 font-bold uppercase">
          {status}
        </Badge>
        {progress !== undefined && (
          <p className="text-[10px] text-cyan-400 mt-1 font-black">{progress}%</p>
        )}
      </div>
    </div>
  );
}
