import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Search, 
  Download, 
  ExternalLink, 
  Filter, 
  Globe, 
  MessageSquare, 
  ThumbsUp, 
  User as UserIcon, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { searchModels } from '../lib/gemini';
import { toast } from 'sonner';
import { Model } from '../types';
import { MOCK_MODELS } from '../constants';
import { handleAIError } from '../lib/error-handling';

export function Explore() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"none" | "likes" | "downloads">("none");
  const [results, setResults] = useState<Model[]>(MOCK_MODELS);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const parseCount = (count: string) => {
    const num = parseFloat(count);
    if (count.toLowerCase().includes('m')) return num * 1000000;
    if (count.toLowerCase().includes('k')) return num * 1000;
    return num;
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === "likes") {
      return parseCount(b.likes) - parseCount(a.likes);
    }
    if (sortBy === "downloads") {
      return parseCount(b.downloads) - parseCount(a.downloads);
    }
    return 0;
  });

  const displayResults = sortedResults.filter(model => 
    model.name.toLowerCase().includes(query.toLowerCase()) ||
    model.author.toLowerCase().includes(query.toLowerCase())
  );

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const aiResults = await searchModels(query);
      toast.success("Found new models using AI search!");
    } catch (error) {
      handleAIError(error);
    } finally {
      setLoading(false);
    }
  };

  const openModelDetails = (model: typeof MOCK_MODELS[0]) => {
    setSelectedModel(model);
    setActiveImageIndex(0);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
          <Input 
            placeholder="Search Thingiverse, Printables, and more..." 
            className="pl-12 h-14 bg-white/5 border-white/10 focus-visible:ring-cyan-500 rounded-2xl text-white placeholder:text-white/20"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 h-14">
            <Filter size={18} className="text-white/40" />
            <select 
              className="bg-transparent text-white text-sm font-bold focus:outline-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="none" className="bg-[#0a0a0a]">Sort By</option>
              <option value="likes" className="bg-[#0a0a0a]">Popularity</option>
              <option value="downloads" className="bg-[#0a0a0a]">Downloads</option>
            </select>
          </div>
          <Button className="h-14 px-8 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-2xl shadow-lg shadow-cyan-500/20" onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {displayResults.map((model) => (
          <div 
            key={model.id} 
            className="group glass-card overflow-hidden hover:border-cyan-500/50 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
            onClick={() => openModelDetails(model)}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={model.image} 
                alt={model.name} 
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3">
                <Badge className={`font-bold uppercase text-[9px] px-2 py-0.5 ${model.source === 'Printables' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                  {model.source}
                </Badge>
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="rounded-full w-12 h-12 bg-white text-black hover:bg-cyan-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    const downloadUrl = model.source === 'Thingiverse' 
                      ? `${model.url}/zip` 
                      : `${model.url}/files`;
                    window.open(downloadUrl, "_blank");
                    toast.success("Download shortcut opened!");
                  }}
                >
                  <Download size={20} />
                </Button>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="rounded-full w-12 h-12 bg-white text-black hover:bg-cyan-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(model.url, "_blank");
                  }}
                >
                  <ExternalLink size={20} />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <h4 className="font-bold text-white truncate mb-1 text-lg">{model.name}</h4>
              <p className="text-xs text-white/40 mb-4 font-medium">by {model.author}</p>
              <div className="flex items-center justify-between text-[10px] text-white/60 uppercase tracking-[1px] font-black">
                <div className="flex items-center gap-1.5">
                  <Download size={12} className="text-cyan-400" /> {model.downloads}
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe size={12} className="text-cyan-400" /> {model.likes}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Model Detail Modal */}
      <Dialog open={!!selectedModel} onOpenChange={(open) => !open && setSelectedModel(null)}>
        <DialogContent className="max-w-4xl glass-card border-white/10 p-0 overflow-hidden text-white">
          {selectedModel && (
            <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px]">
              {/* Image Section */}
              <div className="w-full md:w-3/5 relative bg-black/40 flex items-center justify-center group">
                <img 
                  src={selectedModel.images[activeImageIndex]} 
                  alt={selectedModel.name}
                  className="max-w-full max-h-full object-contain transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {selectedModel.images.length > 1 && (
                  <>
                    <button 
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500 hover:text-black"
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? selectedModel.images.length - 1 : prev - 1))}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-500 hover:text-black"
                      onClick={() => setActiveImageIndex((prev) => (prev === selectedModel.images.length - 1 ? 0 : prev + 1))}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {selectedModel.images.map((_, idx) => (
                    <button 
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIndex ? 'bg-cyan-400 w-6' : 'bg-white/30'}`}
                      onClick={() => setActiveImageIndex(idx)}
                    />
                  ))}
                </div>
              </div>

              {/* Info Section */}
              <div className="w-full md:w-2/5 flex flex-col p-8 bg-white/5 backdrop-blur-md overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                  <Badge className={`mb-4 font-bold uppercase text-[10px] px-3 py-1 ${selectedModel.source === 'Printables' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                    {selectedModel.source}
                  </Badge>
                  <h2 className="text-3xl font-black text-white leading-tight mb-2">{selectedModel.name}</h2>
                  <p className="text-sm text-white/40 font-medium">by <span className="text-cyan-400">{selectedModel.author}</span></p>
                </div>

                <div className="flex items-center gap-6 mb-8 py-4 border-y border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Downloads</span>
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Download size={16} className="text-cyan-400" /> {selectedModel.downloads}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Likes</span>
                    <div className="flex items-center gap-2 text-white font-bold">
                      <ThumbsUp size={16} className="text-cyan-400" /> {selectedModel.likes}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div>
                    <h4 className="text-xs font-black text-white/30 uppercase tracking-widest mb-3">Description</h4>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {selectedModel.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MessageSquare size={14} className="text-cyan-400" /> Comments ({selectedModel.comments.length})
                    </h4>
                    <div className="space-y-4">
                      {selectedModel.comments.map((comment, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <UserIcon size={12} />
                              </div>
                              <span className="text-xs font-bold text-white/80">{comment.user}</span>
                            </div>
                            <span className="text-[10px] text-white/30 font-medium">{comment.date}</span>
                          </div>
                          <p className="text-xs text-white/60 leading-relaxed">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 flex flex-col gap-3">
                  <Button 
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-black h-12 rounded-xl shadow-lg shadow-cyan-500/20"
                    onClick={() => {
                      const downloadUrl = selectedModel.source === 'Thingiverse' 
                        ? `${selectedModel.url}/zip` 
                        : `${selectedModel.url}/files`;
                      window.open(downloadUrl, "_blank");
                    }}
                  >
                    <Download size={18} className="mr-2" /> Download STL
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl font-bold"
                    onClick={() => window.open(selectedModel.url, "_blank")}
                  >
                    <ExternalLink size={18} className="mr-2" /> View on {selectedModel.source}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
