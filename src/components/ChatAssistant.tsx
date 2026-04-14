import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export function ChatAssistant() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: "Hello! I'm your SWIFT.STL AI assistant. How can I help you with your 3D prints today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: "You are a 3D printing expert assistant. You help users with slicing settings, troubleshooting print failures, finding models, and managing their Bambu Lab printers. Be concise and technical but helpful."
        }
      });

      const result = await chat.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'bot', content: result.text || "Sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      toast.error("Failed to get response from AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.1)]">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="font-black text-white text-sm uppercase tracking-widest">AI Assistant</h3>
          <p className="text-[10px] text-emerald-400 font-bold uppercase">Online • Gemini 3.1</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/10' 
                : 'bg-white/5 text-white/80 border border-white/10'
            }`}>
              <div className="markdown-body">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/10 bg-white/5">
        <div className="relative">
          <Input 
            placeholder="Ask anything..." 
            className="pr-12 bg-white/5 border-white/10 focus-visible:ring-cyan-500 rounded-xl text-white h-12"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            size="sm" 
            className="absolute right-1.5 top-1.5 h-9 w-9 p-0 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg"
            onClick={handleSend}
            disabled={loading}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
