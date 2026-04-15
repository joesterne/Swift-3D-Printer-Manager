import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { STLViewer } from './STLViewer';
import { 
  Scissors, 
  Layers, 
  Box, 
  Clock, 
  Zap, 
  Settings2, 
  Sparkles,
  Play,
  Download,
  List,
  Trash2,
  ArrowUp,
  ArrowDown,
  Send,
  Plus,
  Cpu,
  Thermometer,
  Wind,
  User,
  ShieldCheck,
  Save
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { getSmartSlicingInfo } from '../lib/gemini';
import { toast } from 'sonner';
import { useUser } from '../contexts/UserContext';
import { InfoCard } from './InfoCard';
import { handleFirestoreError, OperationType, handleAIError } from '../lib/error-handling';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QueueItem, PrinterProfile } from '../types';
import { DEFAULT_PROFILES } from '../constants';

export function Slicer() {
  const { user } = useUser();
  const [printTech, setPrintTech] = useState<'FDM' | 'SLA'>('FDM');
  const [infill, setInfill] = useState([15]);
  const [layerHeight, setLayerHeight] = useState([0.2]);
  const [layerHeightMicrons, setLayerHeightMicrons] = useState([50]);
  const [exposureTime, setExposureTime] = useState([2.5]);
  const [resinType, setResinType] = useState('Standard');
  const [supports, setSupports] = useState(false);
  const [brim, setBrim] = useState(true);
  const [loading, setLoading] = useState(false);
  const [aiInfo, setAiInfo] = useState<any>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  
  // Profile State
  const [profiles, setProfiles] = useState<PrinterProfile[]>(DEFAULT_PROFILES);
  const [selectedProfileId, setSelectedProfileId] = useState('1');
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<Omit<PrinterProfile, 'id'>>({
    name: '',
    nozzleSize: 0.4,
    bedTemp: 55,
    fanSpeed: 100
  });

  // Sync Profiles from Firestore
  useEffect(() => {
    if (!user) {
      setProfiles(DEFAULT_PROFILES);
      setSelectedProfileId('1');
      return;
    }

    const profilesRef = collection(db, 'users', user.uid, 'printer_profiles');
    const q = query(profilesRef, orderBy('name'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProfiles = snapshot.docs.map(doc => doc.data() as PrinterProfile);
      if (fetchedProfiles.length > 0) {
        setProfiles(fetchedProfiles);
        // If current selected profile is not in the new list, select the first one
        if (!fetchedProfiles.find(p => p.id === selectedProfileId)) {
          setSelectedProfileId(fetchedProfiles[0].id);
        }
      } else {
        setProfiles(DEFAULT_PROFILES);
        setSelectedProfileId('1');
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/printer_profiles`);
    });

    return () => unsubscribe();
  }, [user, selectedProfileId]);

  // Sync Queue from Firestore
  useEffect(() => {
    if (!user) {
      setQueue([]);
      return;
    }

    const queueRef = collection(db, 'users', user.uid, 'print_queue');
    const q = query(queueRef, orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedQueue = snapshot.docs.map(doc => doc.data() as QueueItem);
      setQueue(fetchedQueue);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/print_queue`);
    });

    return () => unsubscribe();
  }, [user]);

  // Bambu Auth State
  const [isBambuAuthenticated, setIsBambuAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [bambuEmail, setBambuEmail] = useState('');
  const [bambuPassword, setBambuPassword] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId) || profiles[0];

  const handleSmartOptimize = async () => {
    setIsOptimizing(true);
    try {
      const info = await getSmartSlicingInfo(
        "Benchy_v2.stl", 
        `Tech: ${printTech}, Profile: ${selectedProfile.name}, Current Infill: ${infill}%, Layer Height: ${layerHeight}mm`
      );
      
      if (info.suggested_infill !== undefined) setInfill([info.suggested_infill]);
      if (info.suggested_layer_height !== undefined) {
        if (printTech === 'FDM') {
          setLayerHeight([info.suggested_layer_height]);
        } else {
          setLayerHeightMicrons([info.suggested_layer_height * 1000]);
        }
      }
      if (info.suggested_supports !== undefined) setSupports(info.suggested_supports);
      
      setAiInfo(info);
      toast.success("AI Optimization applied!");
    } catch (error) {
      handleAIError(error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleSlice = async () => {
    setLoading(true);
    try {
      const settings = printTech === 'FDM' 
        ? `Infill: ${infill}%, Layer Height: ${layerHeight}mm, Supports: ${supports}, Brim: ${brim}`
        : `Exposure: ${exposureTime}s, Layer Height: ${layerHeightMicrons}um, Resin: ${resinType}, Supports: ${supports}`;
      
      const info = await getSmartSlicingInfo(
        "Benchy_v2.stl", 
        `Tech: ${printTech}, ${settings}, Profile: ${selectedProfile.name}`
      );
      setAiInfo(info);
      toast.success(`AI ${printTech} Slicing analysis complete!`);
    } catch (error) {
      handleAIError(error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profileForm.name) {
      toast.error("Profile name is required");
      return;
    }

    if (!user) {
      toast.error("Please login to save profiles");
      return;
    }

    const path = `users/${user.uid}/printer_profiles`;
    try {
      if (editingProfileId) {
        const profileRef = doc(db, path, editingProfileId);
        await setDoc(profileRef, { ...profileForm, id: editingProfileId, userId: user.uid }, { merge: true });
        toast.success("Profile updated!");
      } else {
        const newId = Math.random().toString(36).substr(2, 9);
        const profileRef = doc(db, path, newId);
        await setDoc(profileRef, { ...profileForm, id: newId, userId: user.uid });
        setSelectedProfileId(newId);
        toast.success("New profile saved!");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    
    setIsNewProfileModalOpen(false);
    setEditingProfileId(null);
    setProfileForm({ name: '', nozzleSize: 0.4, bedTemp: 55, fanSpeed: 100 });
  };

  const deleteProfile = async (id: string) => {
    if (profiles.length <= 1) {
      toast.error("Cannot delete the last profile");
      return;
    }
    if (!user) return;

    const path = `users/${user.uid}/printer_profiles/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'printer_profiles', id));
      toast.success("Profile deleted");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleBambuAuth = () => {
    if (!bambuEmail || !bambuPassword) {
      toast.error("Please enter credentials");
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsBambuAuthenticated(true);
      setIsAuthModalOpen(false);
      setLoading(false);
      toast.success("Successfully connected to Bambu Lab Cloud");
    }, 1500);
  };

  const addToQueue = async () => {
    if (!aiInfo) {
      toast.error("Please slice the model first");
      return;
    }
    if (!user) {
      toast.error("Please login to add to queue");
      return;
    }

    const path = `users/${user.uid}/print_queue`;
    try {
      const newId = Math.random().toString(36).substr(2, 9);
      const queueRef = doc(db, path, newId);
      const newItem: QueueItem = {
        id: newId,
        name: "Benchy_v2.stl",
        time: aiInfo.print_time || "1h 45m",
        filament: aiInfo.filament_usage || "12.4g",
        status: 'queued'
      };
      await setDoc(queueRef, { ...newItem, userId: user.uid, createdAt: new Date().toISOString() });
      toast.success("Added to print queue");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const removeFromQueue = async (id: string) => {
    if (!user) return;
    const path = `users/${user.uid}/print_queue/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'print_queue', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const moveInQueue = (index: number, direction: 'up' | 'down') => {
    // Note: Reordering in Firestore would require a 'position' field.
    // For this demo, we'll keep it simple and not implement reordering yet.
    toast.info("Queue reordering is disabled in Cloud mode for now.");
  };

  const sendNextToPrinter = async () => {
    if (queue.length === 0) {
      toast.error("Queue is empty");
      return;
    }
    if (!user) return;

    const nextItem = queue.find(item => item.status === 'queued');
    if (!nextItem) {
      toast.info("All items in queue are processed");
      return;
    }

    const path = `users/${user.uid}/print_queue/${nextItem.id}`;
    try {
      const itemRef = doc(db, 'users', user.uid, 'print_queue', nextItem.id);
      await updateDoc(itemRef, { status: 'printing' });
      
      toast.success(`Sending ${nextItem.name} to X1-C...`);
      
      // Simulate print process
      setTimeout(async () => {
        const isSuccess = Math.random() > 0.1; // 90% success rate
        
        try {
          await updateDoc(itemRef, { status: isSuccess ? 'completed' : 'failed' });
          if (isSuccess) {
            toast.success(`${nextItem.name} print completed successfully!`);
          } else {
            toast.error(`${nextItem.name} print failed: Spaghetti detected!`);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, path);
        }
      }, 5000);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="lg:col-span-2 space-y-8">
        <div className="glass-card overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Benchy_v2.stl</h3>
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">6.4MB • 12,450 Triangles</p>
            </div>
            <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white/60 hover:text-white rounded-xl">
              <Download size={14} className="mr-2" /> Export G-Code
            </Button>
          </div>
          <div className="p-0 bg-black/40">
            <STLViewer url="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/stl/binary/colored.stl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard icon={<Clock size={20} />} label="EST. TIME" value={aiInfo?.print_time || "1h 45m"} />
          <InfoCard icon={<Box size={20} />} label="FILAMENT" value={aiInfo?.filament_usage || "12.4g"} />
          <InfoCard icon={<Zap size={20} />} label="COST EST." value="$0.45" />
        </div>

        {/* Print Queue Section */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-cyan-400/10 rounded-lg text-cyan-400">
                <List size={20} />
              </div>
              Print Queue
            </h3>
            <Button 
              onClick={sendNextToPrinter} 
              disabled={queue.length === 0 || queue.some(i => i.status === 'printing')}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl px-6"
            >
              <Send size={16} className="mr-2" /> Process Queue
            </Button>
          </div>

          <ScrollArea className="h-[300px] pr-4">
            {queue.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4 border-2 border-dashed border-white/5 rounded-2xl">
                <List size={48} />
                <p className="font-medium">Queue is empty</p>
                <p className="text-xs">Slice a model and add it to start</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        item.status === 'printing' ? 'bg-cyan-500 text-black animate-pulse' : 
                        item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 
                        item.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-white/5 text-white/40'
                      }`}>
                        <Box size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{item.name}</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">{item.time} • {item.filament}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => moveInQueue(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-white/20 hover:text-white disabled:opacity-0"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button 
                          onClick={() => moveInQueue(index, 'down')}
                          disabled={index === queue.length - 1}
                          className="p-1 text-white/20 hover:text-white disabled:opacity-0"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                      <Badge className={`text-[9px] font-bold uppercase ${
                        item.status === 'printing' ? 'bg-cyan-500 text-black' : 
                        item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 
                        item.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-white/10 text-white/40'
                      }`}>
                        {item.status}
                      </Badge>
                      <button 
                        onClick={() => removeFromQueue(item.id)}
                        className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      <div className="space-y-8">
        {/* Bambu Lab Authentication */}
        <div className={`glass-card p-6 border-2 transition-all duration-500 ${isBambuAuthenticated ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isBambuAuthenticated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/40'}`}>
                {isBambuAuthenticated ? <ShieldCheck size={24} /> : <User size={24} />}
              </div>
              <div>
                <h4 className="font-bold text-white">Bambu Lab Cloud</h4>
                <p className="text-xs text-white/40 font-medium">
                  {isBambuAuthenticated ? `Connected as ${bambuEmail}` : 'Connect to sync printers & files'}
                </p>
              </div>
            </div>
            {!isBambuAuthenticated ? (
              <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
                <DialogTrigger render={<Button size="sm" className="bg-white/10 hover:bg-white/20 text-white rounded-xl" />}>
                  Connect
                </DialogTrigger>
                <DialogContent className="glass-card border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">Bambu Lab Login</DialogTitle>
                    <DialogDescription className="text-white/40">Enter your Bambu Lab credentials to sync your devices.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Email Address</label>
                      <Input 
                        type="email" 
                        placeholder="email@example.com" 
                        className="bg-white/5 border-white/10 focus:ring-cyan-500"
                        value={bambuEmail}
                        onChange={(e) => setBambuEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Password</label>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        className="bg-white/5 border-white/10 focus:ring-cyan-500"
                        value={bambuPassword}
                        onChange={(e) => setBambuPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black"
                      onClick={handleBambuAuth}
                      disabled={loading}
                    >
                      {loading ? 'Authenticating...' : 'Login to Cloud'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/20 hover:text-red-400"
                onClick={() => setIsBambuAuthenticated(false)}
              >
                Disconnect
              </Button>
            )}
          </div>
        </div>

        <div className="glass-card p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-cyan-400/10 rounded-lg text-cyan-400">
                <Settings2 size={20} />
              </div>
              Slice Settings
            </h3>
            
            {/* Profile Selector */}
            <div className="flex items-center gap-2">
              <select 
                value={selectedProfileId}
                onChange={(e) => setSelectedProfileId(e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {profiles.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#0a0a0a]">{p.name}</option>
                ))}
              </select>
              
              <Button 
                size="icon" 
                variant="outline" 
                className="w-8 h-8 rounded-lg bg-white/5 border-white/10 text-white/40 hover:text-cyan-400"
                onClick={() => {
                  const p = profiles.find(p => p.id === selectedProfileId);
                  if (p) {
                    setProfileForm({
                      name: p.name,
                      nozzleSize: p.nozzleSize,
                      bedTemp: p.bedTemp,
                      fanSpeed: p.fanSpeed
                    });
                    setEditingProfileId(p.id);
                    setIsNewProfileModalOpen(true);
                  }
                }}
              >
                <Settings2 size={14} />
              </Button>

              <Button 
                size="icon" 
                variant="outline" 
                className="w-8 h-8 rounded-lg bg-white/5 border-white/10 text-white/40 hover:text-red-400"
                onClick={() => deleteProfile(selectedProfileId)}
              >
                <Trash2 size={14} />
              </Button>
              
              <Dialog open={isNewProfileModalOpen} onOpenChange={(open) => {
                setIsNewProfileModalOpen(open);
                if (!open) {
                  setEditingProfileId(null);
                  setProfileForm({ name: '', nozzleSize: 0.4, bedTemp: 55, fanSpeed: 100 });
                }
              }}>
                <DialogTrigger render={<Button size="icon" variant="outline" className="w-8 h-8 rounded-lg bg-white/5 border-white/10 text-white/40 hover:text-cyan-400" />}>
                  <Plus size={16} />
                </DialogTrigger>
                <DialogContent className="glass-card border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                      {editingProfileId ? 'Edit Printer Profile' : 'New Printer Profile'}
                    </DialogTitle>
                    <DialogDescription className="text-white/40">
                      {editingProfileId ? 'Update your hardware parameters.' : 'Define custom hardware parameters for your printer.'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Profile Name</label>
                      <Input 
                        placeholder="e.g. My Custom X1C" 
                        className="bg-white/5 border-white/10"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Nozzle Size (mm)</label>
                        <Input 
                          type="number" 
                          step="0.1"
                          className="bg-white/5 border-white/10"
                          value={profileForm.nozzleSize}
                          onChange={(e) => setProfileForm({...profileForm, nozzleSize: parseFloat(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Bed Temp (°C)</label>
                        <Input 
                          type="number" 
                          className="bg-white/5 border-white/10"
                          value={profileForm.bedTemp}
                          onChange={(e) => setProfileForm({...profileForm, bedTemp: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">Cooling Fan Speed (%)</label>
                      <Input 
                        type="number" 
                        max="100"
                        className="bg-white/5 border-white/10"
                        value={profileForm.fanSpeed}
                        onChange={(e) => setProfileForm({...profileForm, fanSpeed: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black" onClick={saveProfile}>
                      <Save size={18} className="mr-2" /> {editingProfileId ? 'Update Profile' : 'Save Profile'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="FDM" onValueChange={(v) => setPrintTech(v as 'FDM' | 'SLA')}>
            <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-xl p-1">
              <TabsTrigger value="FDM" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-bold text-xs">FDM (Filament)</TabsTrigger>
              <TabsTrigger value="SLA" className="rounded-lg data-[state=active]:bg-cyan-500 data-[state=active]:text-black font-bold text-xs">SLA (Resin)</TabsTrigger>
            </TabsList>

            <TabsContent value="FDM" className="space-y-8 mt-8">
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/40">
                  <span>Infill Density</span>
                  <span className="text-cyan-400">{infill[0]}%</span>
                </div>
                <Slider value={infill} onValueChange={(val) => setInfill(val as number[])} max={100} step={1} className="py-2" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/40">
                  <span>Layer Height</span>
                  <span className="text-cyan-400">{layerHeight[0]}mm</span>
                </div>
                <Slider value={layerHeight} onValueChange={(val) => setLayerHeight(val as number[])} min={0.05} max={0.4} step={0.05} className="py-2" />
              </div>
            </TabsContent>

            <TabsContent value="SLA" className="space-y-8 mt-8">
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/40">
                  <span>Exposure Time</span>
                  <span className="text-cyan-400">{exposureTime[0]}s</span>
                </div>
                <Slider value={exposureTime} onValueChange={(val) => setExposureTime(val as number[])} min={1} max={10} step={0.1} className="py-2" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/40">
                  <span>Layer Height</span>
                  <span className="text-cyan-400">{layerHeightMicrons[0]}μm</span>
                </div>
                <Slider value={layerHeightMicrons} onValueChange={(val) => setLayerHeightMicrons(val as number[])} min={10} max={100} step={10} className="py-2" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Resin Type</label>
                <select 
                  value={resinType}
                  onChange={(e) => setResinType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="Standard" className="bg-[#0a0a0a]">Standard Resin</option>
                  <option value="Tough" className="bg-[#0a0a0a]">Tough / ABS-Like</option>
                  <option value="Clear" className="bg-[#0a0a0a]">Clear Resin</option>
                  <option value="Flexible" className="bg-[#0a0a0a]">Flexible / Elastic</option>
                </select>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Active Profile Info (Only for FDM) */}
          {printTech === 'FDM' && (
            <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <Cpu size={14} className="text-cyan-400 mb-1" />
                <span className="text-[9px] font-bold text-white/30 uppercase">Nozzle</span>
                <span className="text-xs font-black text-white">{selectedProfile.nozzleSize}mm</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 text-center border-x border-white/5">
                <Thermometer size={14} className="text-cyan-400 mb-1" />
                <span className="text-[9px] font-bold text-white/30 uppercase">Bed</span>
                <span className="text-xs font-black text-white">{selectedProfile.bedTemp}°C</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 text-center">
                <Wind size={14} className="text-cyan-400 mb-1" />
                <span className="text-[9px] font-bold text-white/30 uppercase">Fan</span>
                <span className="text-xs font-black text-white">{selectedProfile.fanSpeed}%</span>
              </div>
            </div>
          )}

          <div className="space-y-8">
            <Separator className="bg-white/10" />

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-white/80 uppercase tracking-tight">Supports</label>
                  <p className="text-[10px] text-white/30 font-medium">Generate structures</p>
                </div>
                <Switch 
                  checked={supports} 
                  onCheckedChange={setSupports}
                  className="data-[state=checked]:bg-cyan-400" 
                />
              </div>
              {printTech === 'FDM' && (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-white/80 uppercase tracking-tight">Brim</label>
                    <p className="text-[10px] text-white/30 font-medium">Improve adhesion</p>
                  </div>
                  <Switch 
                    checked={brim} 
                    onCheckedChange={setBrim}
                    className="data-[state=checked]:bg-cyan-400" 
                  />
                </div>
              )}
            </div>

            {/* Visual Slice Summary */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-cyan-400/5 border border-cyan-400/10">
              <div className="flex flex-col items-center gap-1">
                <Layers size={14} className="text-cyan-400" />
                <span className="text-[9px] font-black text-white/40 uppercase">Layer</span>
                <span className="text-xs font-bold text-white">
                  {printTech === 'FDM' ? `${layerHeight[0]}mm` : `${layerHeightMicrons[0]}μm`}
                </span>
              </div>
              <div className="h-8 w-px bg-white/5" />
              <div className="flex flex-col items-center gap-1">
                {printTech === 'FDM' ? <Box size={14} className="text-cyan-400" /> : <Clock size={14} className="text-cyan-400" />}
                <span className="text-[9px] font-black text-white/40 uppercase">
                  {printTech === 'FDM' ? 'Infill' : 'Exposure'}
                </span>
                <span className="text-xs font-bold text-white">
                  {printTech === 'FDM' ? `${infill[0]}%` : `${exposureTime[0]}s`}
                </span>
              </div>
              <div className="h-8 w-px bg-white/5" />
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={14} className={supports ? "text-cyan-400" : "text-white/20"} />
                <span className="text-[9px] font-black text-white/40 uppercase">Supports</span>
                <span className="text-xs font-bold text-white">{supports ? "ON" : "OFF"}</span>
              </div>
              <div className="h-8 w-px bg-white/5" />
              <div className="flex flex-col items-center gap-1">
                {printTech === 'FDM' ? (
                  <>
                    <Zap size={14} className={brim ? "text-cyan-400" : "text-white/20"} />
                    <span className="text-[9px] font-black text-white/40 uppercase">Brim</span>
                    <span className="text-xs font-bold text-white">{brim ? "ON" : "OFF"}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-cyan-400" />
                    <span className="text-[9px] font-black text-white/40 uppercase">Resin</span>
                    <span className="text-xs font-bold text-white truncate max-w-[40px]">{resinType}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-400/20 font-bold h-14 rounded-2xl uppercase tracking-wider" 
                onClick={handleSmartOptimize} 
                disabled={loading || isOptimizing}
              >
                {isOptimizing ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="animate-spin" size={20} /> Optimizing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={20} /> Smart Optimize
                  </span>
                )}
              </Button>

              <Button className="flex-[2] bg-cyan-500 hover:bg-cyan-400 text-black font-black h-14 rounded-2xl shadow-lg shadow-cyan-500/20 uppercase tracking-wider" onClick={handleSlice} disabled={loading || isOptimizing}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="animate-spin" size={20} /> Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play size={20} /> Slice Model
                  </span>
                )}
              </Button>
            </div>

            {aiInfo && (
              <Button 
                onClick={addToQueue}
                variant="outline"
                className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 h-14 rounded-2xl uppercase tracking-wider font-bold"
              >
                <Plus size={20} className="mr-2" /> Add to Queue
              </Button>
            )}
          </div>
        </div>

        {aiInfo && (
          <div className="glass-card p-6 bg-cyan-400/5 border-cyan-400/20 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-cyan-400" />
              <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest">AI Recommendations</h4>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Orientation</p>
                <p className="text-xs text-white/80 font-medium leading-relaxed">{aiInfo.recommended_orientation}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Potential Issues</p>
                <p className="text-xs text-white/80 font-medium leading-relaxed">{aiInfo.potential_print_issues}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
