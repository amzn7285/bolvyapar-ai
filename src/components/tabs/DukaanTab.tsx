"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Volume2, Eye } from "lucide-react";

interface DukaanTabProps {
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
  onTransaction?: (t: any) => void;
}

export default function DukaanTab({ privateMode, language }: DukaanTabProps) {
  const [salesData] = useState({ total: 1450, count: 12 });
  const [revealedSales, setRevealedSales] = useState<Set<number>>(new Set());
  
  const [stock] = useState([
    { id: 'grains', emoji: '🌾', name: language === 'hi-IN' ? 'अनाज' : 'Grains', qty: 25, unit: language === 'hi-IN' ? 'किलो' : 'kg', level: 80 },
    { id: 'dairy', emoji: '🥛', name: language === 'hi-IN' ? 'डेयरी' : 'Dairy', qty: 15, unit: language === 'hi-IN' ? 'लीटर' : 'L', level: 25 },
    { id: 'essentials', emoji: '🧼', name: language === 'hi-IN' ? 'ज़रूरी सामान' : 'Essentials', qty: 30, unit: language === 'hi-IN' ? 'यूनिट' : 'units', level: 12 },
  ]);
  
  const [recentSales] = useState([
    { id: 1, item: language === 'hi-IN' ? 'आटा' : 'Aata', qty: '5kg', customer: 'Rahul', time: '2m ago', amount: 240 },
    { id: 2, item: language === 'hi-IN' ? 'दूध' : 'Milk', qty: '2L', customer: 'Sita', time: '15m ago', amount: 120 },
    { id: 3, item: language === 'hi-IN' ? 'साबुन' : 'Soap', qty: '3 units', customer: 'Amit', time: '1h ago', amount: 300 },
  ]);

  const texts = {
    "hi-IN": {
      todaySales: "आज की बिक्री",
      stockStatus: "स्टॉक की स्थिति",
      recentSales: "हाल की बिक्री",
      transactions: "लेन-देन",
      itemsLow: "सामान कम है!",
      reveal: "👁️ टैप",
      revealNote: "कीमतें छिपी हैं — देखने के लिए टैप करें",
      profitHint: "📊 मुनाफा रिपोर्ट में है 🔐"
    },
    "en-IN": {
      todaySales: "Today's Sales",
      stockStatus: "Stock Status",
      recentSales: "Recent Sales",
      transactions: "txns",
      itemsLow: "items low!",
      reveal: "👁️ Tap",
      revealNote: "Amounts hidden — tap sale to reveal",
      profitHint: "📊 Profit in Report 🔐"
    }
  }[language];

  const toggleSaleReveal = (id: number) => {
    setRevealedSales(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const speakStock = (item: any) => {
    const text = language === 'hi-IN' 
      ? `${item.name} का स्टॉक ${item.qty} ${item.unit} है।`
      : `${item.name} stock is ${item.qty} ${item.unit}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const lowStockCount = stock.filter(s => s.level < 30).length;

  return (
    <div className="space-y-4">
      {lowStockCount > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center justify-between animate-pulse">
          <p className="text-destructive font-bold text-sm">
            ⚠️ {lowStockCount} {texts.itemsLow}
          </p>
          <button 
            onClick={() => speakStock(stock.find(s => s.level < 30))} 
            className="h-8 w-8 flex items-center justify-center text-destructive bg-destructive/10 rounded-full"
          >
            <Volume2 size={16} />
          </button>
        </div>
      )}

      {/* Today's Sales Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-none overflow-hidden rounded-2xl shadow-md">
        <CardContent className="p-4">
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mb-1">
            {texts.todaySales}
          </p>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-lg font-bold text-primary">₹</span>
            <span className={cn("text-3xl font-black transition-all duration-300", privateMode && "blur-lg")}>
              {salesData.total.toLocaleString()}
            </span>
          </div>
          <p className="text-secondary font-bold text-sm">
            {salesData.count} {texts.transactions}
          </p>
        </CardContent>
      </Card>

      {/* Stock Cards */}
      <div className="space-y-3">
        <h3 className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider px-1">
          {texts.stockStatus}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {stock.map((item) => (
            <Card key={item.id} className="bg-card border-border overflow-hidden rounded-xl">
              <CardContent className="p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex gap-3 items-center">
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                      <h3 className="text-muted-foreground text-[10px] uppercase font-bold">{item.name}</h3>
                      <p className="text-2xl font-black">{item.qty}<span className="text-xs ml-0.5 font-normal opacity-60">{item.unit}</span></p>
                    </div>
                  </div>
                  <button 
                    onClick={() => speakStock(item)}
                    className="h-8 w-8 flex items-center justify-center bg-secondary/10 rounded-full text-secondary"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                <div className="space-y-1">
                  <Progress value={item.level} className="h-2" />
                  <p className="text-[8px] text-muted-foreground text-center font-bold uppercase">
                    {texts.profitHint}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Sales */}
      <div className="space-y-3">
        <div className="px-1">
          <h3 className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
            {texts.recentSales}
          </h3>
          <p className="text-[8px] text-primary/70 font-bold uppercase">
            ℹ️ {texts.revealNote}
          </p>
        </div>
        
        <div className="space-y-2">
          {recentSales.map((sale) => (
            <div 
              key={sale.id} 
              onClick={() => toggleSaleReveal(sale.id)}
              className="bg-card/30 border border-border p-3 rounded-xl flex items-center justify-between active:bg-card/50 transition-all cursor-pointer group"
            >
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                  {sale.item.includes('आटा') || sale.item === 'Aata' ? '🌾' : sale.item.includes('दूध') || sale.item === 'Milk' ? '🥛' : '🧼'}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{sale.item}</h4>
                  <p className="text-[10px] text-muted-foreground">{sale.qty} • {sale.customer}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {revealedSales.has(sale.id) ? (
                  <span className="text-xl font-black text-primary animate-in zoom-in-95">
                    ₹{sale.amount}
                  </span>
                ) : (
                  <div className="flex items-center gap-1 h-8 px-3 bg-primary/10 rounded-lg text-[10px] font-bold uppercase text-primary">
                    <Eye size={12} /> {texts.reveal}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
