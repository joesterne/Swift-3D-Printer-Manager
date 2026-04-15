import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InfoCard } from './InfoCard';
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Calendar, 
  LogOut, 
  Camera,
  Save,
  Printer,
  History,
  Shield
} from 'lucide-react';

export function Profile() {
  const { profile, logout, updateProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    location: profile?.location || ''
  });

  if (!profile) return null;

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Profile Card */}
      <div className="glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
        
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 p-1 shadow-2xl shadow-cyan-500/20">
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-900 flex items-center justify-center">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <UserIcon size={48} className="text-white/20" />
                )}
              </div>
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={16} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h2 className="text-4xl font-black text-white tracking-tight">{profile.displayName || 'Anonymous Maker'}</h2>
                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 w-fit mx-auto md:mx-0">PRO MAKER</Badge>
              </div>
              <p className="text-white/40 font-medium flex items-center justify-center md:justify-start gap-2">
                <Mail size={14} /> {profile.email}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-widest">
                <MapPin size={14} className="text-cyan-400" /> {profile.location || 'Earth'}
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-white/60 uppercase tracking-widest">
                <Calendar size={14} className="text-cyan-400" /> Joined {new Date(profile.createdAt || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>

            <p className="text-white/60 leading-relaxed max-w-2xl">
              {profile.bio || "No bio provided yet. Add one to tell the community about your 3D printing journey!"}
            </p>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button 
                variant="ghost" 
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl"
                onClick={logout}
              >
                <LogOut size={18} className="mr-2" /> Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <Card className="glass-card border-white/10 text-white animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-black uppercase tracking-tight">Update Profile</CardTitle>
            <CardDescription className="text-white/40">Personalize your maker identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Display Name</label>
                <Input 
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="bg-white/5 border-white/10 focus:ring-cyan-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Location</label>
                <Input 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="bg-white/5 border-white/10 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Bio</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                placeholder="Tell us about your printers and projects..."
              />
            </div>
            <Button className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black h-12 rounded-xl" onClick={handleSave}>
              <Save size={18} className="mr-2" /> Save Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard icon={<Printer size={20} />} label="PRINTERS" value="2" size="2xl" />
        <InfoCard icon={<History size={20} />} label="TOTAL PRINTS" value="142" size="2xl" />
        <InfoCard icon={<Shield size={20} />} label="MAKER RANK" value="#42" size="2xl" />
      </div>
    </div>
  );
}
