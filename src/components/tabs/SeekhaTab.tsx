"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Volume2, Bot, Lock } from "lucide-react";

interface SeekhaTabProps {
  language: "hi-IN" | "en-IN";
}

const LESSONS = [
  { id: 'data', emoji: '📊', title: 'DATA', story: '📈 📱 🛒', unlocked: true, color: 'bg-blue-500' },
  { id: 'faida', emoji: '💰', title: 'FAIDA', story: '📉 ➡️ 📈', unlocked: true, color: 'bg-green-500' },
  { id: 'andaaza', emoji: '🔮', title: 'ANDAAZA', story: '📅 🥛 🛒', unlocked: false, color: 'bg-purple-500' },
  { id: 'ai-wale', emoji: '🤖', title: 'AI WALE!', story: '✨ 🧠 ⚡', unlocked: false, color: 'bg-saffron-500' },
];

export default function SeekhaTab({ language }: SeekhaTabProps) {
  const speak = (id: string, type: 'lesson' | 'ai') => {
    const text = type === 'lesson' 
      ? (language === 'hi-IN' ? "डाटा का मतलब है आपकी दुकान की पूरी जानकारी।" : "Data means all information about your shop.")
      : (language === 'hi-IN' ? "एआई ने आपके पिछले 100 बिलों को देखकर यह बताया है।" : "AI analyzed your last 100 bills to find this.");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 justify-center mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={cn("w-2 h-2 rounded-full", i <= 2 ? "bg-primary" : "bg-muted")} 
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {LESSONS.map((lesson) => (
          <Card 
            key={lesson.id} 
            className={cn(
              "overflow-hidden rounded-2xl border-none shadow-md relative",
              lesson.unlocked ? "bg-card" : "bg-card/20 grayscale opacity-50"
            )}
          >
            <CardContent className="p-0">
              {!lesson.unlocked && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <Lock size={32} className="text-white/50" />
                </div>
              )}
              
              <div className="p-6 flex flex-col items-center text-center space-y-4">
                <span className="text-5xl">{lesson.emoji}</span>
                <h2 className="text-2xl font-black tracking-tight text-white">{lesson.title}</h2>
                <div className="text-lg tracking-widest font-black opacity-80">{lesson.story}</div>
                
                {lesson.unlocked && (
                  <div className="grid grid-cols-2 gap-2 w-full pt-2">
                    <button 
                      onClick={() => speak(lesson.id, 'lesson')}
                      className="flex flex-col items-center justify-center gap-1 bg-secondary h-12 rounded-xl active:scale-95 transition-all shadow-md"
                    >
                      <Volume2 size={20} />
                      <span className="text-[8px] font-bold uppercase">{language === 'hi-IN' ? 'सुनो' : 'Suno'}</span>
                    </button>
                    <button 
                      onClick={() => speak(lesson.id, 'ai')}
                      className="flex flex-col items-center justify-center gap-1 bg-primary h-12 rounded-xl active:scale-95 transition-all shadow-md"
                    >
                      <Bot size={20} />
                      <span className="text-[8px] font-bold uppercase">{language === 'hi-IN' ? 'एआई क्या?' : 'AI Why?'}</span>
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
