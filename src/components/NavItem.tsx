import React from 'react';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

export function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
        active 
          ? "bg-white/10 text-white border border-white/20 shadow-lg shadow-black/10" 
          : "text-white/40 hover:text-white/80 hover:bg-white/5"
      }`}
    >
      <span className={active ? "text-cyan-400" : ""}>{icon}</span>
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}
