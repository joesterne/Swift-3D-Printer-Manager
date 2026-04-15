import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  Search, 
  Scissors, 
  History, 
  Settings, 
  Printer, 
  Box, 
  Clock, 
  Zap,
  Download,
  MessageSquare,
  ChevronRight,
  Plus,
  Trash2,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';
import { STLViewer } from './components/STLViewer';
import { ChatAssistant } from './components/ChatAssistant';
import { Dashboard } from './components/Dashboard';
import { Explore } from './components/Explore';
import { Slicer } from './components/Slicer';
import { Tracking } from './components/Tracking';
import { Profile } from './components/Profile';
import { NavItem } from './components/NavItem';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UserProvider, useUser } from './contexts/UserContext';
import { 
  User as UserIcon,
  LogOut,
  LogIn
} from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, profile, login, logout, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-cyan-500 font-black uppercase tracking-widest text-xs">Initializing Labs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 glass-sidebar flex flex-col z-20">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Printer className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight accent-gradient-text">SWIFT.STL</h1>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[2px] text-white/40 font-bold px-4">Interface</p>
                <nav className="space-y-1">
                  <NavItem 
                    icon={<LayoutDashboard size={18} />} 
                    label="Dashboard" 
                    active={activeTab === "dashboard"} 
                    onClick={() => setActiveTab("dashboard")} 
                  />
                  <NavItem 
                    icon={<Search size={18} />} 
                    label="Explore" 
                    active={activeTab === "explore"} 
                    onClick={() => setActiveTab("explore")} 
                  />
                  <NavItem 
                    icon={<Scissors size={18} />} 
                    label="Slicer" 
                    active={activeTab === "slicer"} 
                    onClick={() => setActiveTab("slicer")} 
                  />
                  <NavItem 
                    icon={<History size={18} />} 
                    label="Tracking" 
                    active={activeTab === "tracking"} 
                    onClick={() => setActiveTab("tracking")} 
                  />
                  <NavItem 
                    icon={<UserIcon size={18} />} 
                    label="Profile" 
                    active={activeTab === "profile"} 
                    onClick={() => setActiveTab("profile")} 
                  />
                </nav>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[2px] text-white/40 font-bold px-4">Connected Labs</p>
                <div className="px-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Bambu Lab X1-C
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />
                    Ender 3 v2 (Local)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 border-t border-white/10">
            {user ? (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-white/80">X1-C Printing</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-white/40 uppercase font-bold">
                    <span>Progress</span>
                    <span>78%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 w-[78%] shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
                  </div>
                </div>
              </div>
            ) : (
              <Button 
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl"
                onClick={login}
              >
                <LogIn size={18} className="mr-2" /> Login to Sync
              </Button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <header className="h-20 glass-header flex items-center justify-between px-10 z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white capitalize">{activeTab}</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30">X1-C ONLINE</Badge>
                <div className="text-sm text-white/40 font-medium self-center">09:42 AM</div>
              </div>
              <Separator orientation="vertical" className="h-6 bg-white/10" />
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="text-white/40 hover:text-white hover:bg-white/5">
                  <Settings size={20} />
                </Button>
                {user ? (
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 shadow-inner overflow-hidden"
                  >
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon size={20} className="m-auto text-white/40" />
                    )}
                  </button>
                ) : (
                  <Button 
                    size="sm" 
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg"
                    onClick={login}
                  >
                    Login
                  </Button>
                )}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "explore" && <Explore />}
            {activeTab === "slicer" && <Slicer />}
            {activeTab === "tracking" && <Tracking />}
            {activeTab === "profile" && <Profile />}
          </div>
        </main>

        {/* AI Assistant Sidebar */}
        <aside className="w-80 glass-sidebar flex flex-col">
          <ChatAssistant />
        </aside>
      </div>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ErrorBoundary>
  );
}
