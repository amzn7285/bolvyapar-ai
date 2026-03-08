"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Volume2 } from "lucide-react";

interface StockTabProps {
  language: "hi-IN" | "en-IN";
}

export default function StockTab({ language }: StockTabProps) {
  const [stock] = useState([
    { id: 'grains', emoji: '🌾', name: language === 'hi-IN' ? 'अनाज' : 'Grains', qty: 25, unit: language === 'hi-IN' ? 'kg' : 'kg', level: 80 },
    { id: 'dairy', emoji: '🥛', name: language === 'hi-IN' ? 'डेयरी' : 'Dairy', qty: 15, unit: language === 'hi-IN' ? 'L' : 'L', level: 25 },
    { id: 'essentials', emoji: '🧼', name: language === 'hi-IN' ? 'ज़रूरी सामान' : 'Essentials', qty: 30, unit: language === 'hi-IN' ? 'units' : 'units', level: 12 },
  ]);

  const speakStock = (item: any) => {
    const text = `${item.name} stock is ${item.qty} ${item.unit}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-slate-900 text-lg font-black tracking-tight mb-4 px-1">Inventory Status</h3>
      <div className="grid grid-cols-1 gap-4">
        {stock.map((item) => (
          <Card key={item.id} className="bg-white border-slate-100 rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4 items-center">
                  <span className="text-4xl">{item.emoji}</span>
                  <div>
                    <h3 className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{item.name}</h3>
                    <p className="text-[22px] font-black text-slate-900">{item.qty}<span className="text-xs ml-1 font-bold text-slate-400 uppercase">{item.unit}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => speakStock(item)}
                  className="h-12 w-12 flex items-center justify-center bg-[#1A6B3C]/10 rounded-2xl text-[#1A6B3C]"
                >
                  <Volume2 size={20} />
                </button>
              </div>
              <div className="space-y-2">
                <Progress value={item.level} className="h-2.5 rounded-full" />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Critical</span>
                  <span>Healthy</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
