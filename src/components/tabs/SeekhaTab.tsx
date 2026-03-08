"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Volume2, Bot, Lock } from "lucide-react";

interface SeekhaTabProps {
  language: "hi-IN" | "en-IN";
}

const LESSONS = [
  { id: 'data', emoji: '📊', title: 'DATA POWER', story: '📈 📱 🛒', unlocked: true },
  { id: 'faida', emoji: '💰', title: 'FAIDA FOCUS', story: '📉 ➡️ 📈', unlocked: true },
  { id: 'andaaza', emoji: '🔮', title: 'FUTURE VIEW', story: '📅 🥛 🛒', unlocked: false },
];

export default function SeekhaTab({ language }: SeekhaTabProps) {
  const speak = (type: 'lesson' | 'ai') => {
    const text = type === 'lesson' ? "Data is the key to your business." : "AI analyzed your last 100 sales.";
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-slate-900 text-lg font-black tracking-tight">Seekha Hua</h3>
        <p className="text-[10px] font-bold text-[#1A6B3C] uppercase bg-[#1A6B3C]/10 px-3 py-1 rounded-full">2/4 Unlocked</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {LESSONS.map((lesson) => (
          <Card key={lesson.id} className={cn("overflow-hidden rounded-[32px] border-none shadow-sm relative transition-all", lesson.unlocked ? "bg-white" : "bg-slate-100 grayscale")}>
            <CardContent className="p-8">
              {!lesson.unlocked && <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[2px]"><Lock size={40} className="text-slate-300" /></div>}
              <div className="flex flex-col items-center text-center space-y-6">
                <span className="text-6xl">{lesson.emoji}</span>
                <div className="space-y-1">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">{lesson.title}</h2>
                  <div className="text-2xl tracking-[0.5em] font-black text-slate-200">{lesson.story}</div>
                </div>
                {lesson.unlocked && (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button onClick={() => speak('lesson')} className="flex flex-col items-center justify-center gap-1 bg-slate-50 h-16 rounded-2xl border border-slate-100 active:bg-slate-100">
                      <Volume2 size={24} className="text-[#1A6B3C]" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Suno</span>
                    </button>
                    <button onClick={() => speak('ai')} className="flex flex-col items-center justify-center gap-1 bg-slate-50 h-16 rounded-2xl border border-slate-100 active:bg-slate-100">
                      <Bot size={24} className="text-[#C45000]" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Why?</span>
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