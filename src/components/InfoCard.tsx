import React from 'react';

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  size?: 'xl' | '2xl';
}

export function InfoCard({ icon, label, value, size = 'xl' }: InfoCardProps) {
  return (
    <div className="glass-card p-6 flex items-center gap-5 hover:bg-white/5 transition-colors group">
      <div className="p-3 bg-white/5 rounded-2xl text-white/40 group-hover:text-cyan-400 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[2px] mb-1">{label}</p>
        <p className={`font-black text-white ${size === '2xl' ? 'text-2xl' : 'text-xl'}`}>{value}</p>
      </div>
    </div>
  );
}
