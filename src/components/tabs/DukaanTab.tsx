"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Volume2, Eye } from "lucide-react";

interface DukaanTabProps {
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
  onTransaction: (t: any) => void;
}

export default function DukaanTab({ privateMode, language }: DukaanTabProps) {
  const [salesData, setSalesData] = useState({ total: 1450, count: 12 });
  const [stock, setStock] = useState([
    { id: 'grains', emoji: '🌾', name: 'Grains', qty: 25, unit: 'kg', level: 80 },
    { id: 'dairy', emoji: '🥛', name: 'Dairy', qty: 15, unit: 'L', level: 25 },
    { id: 'essentials', emoji: '🧼', name: 'Essentials', qty: 30, unit: 'units', level: 12 },
  ]);
  const [recentSales, setRecentSales] = useState([
    { id: 1, item: 'Aata', qty: '5kg', customer: 'Rahul', time: '2m ago', amount: 240, revealed: false },
    { id: 2, item: 'Milk', qty: '2L', customer: 'Sita', time: '15m ago', amount: 120, revealed: false },
    { id: 3, item: 'Soap', qty: '3 units', customer: 'Amit', time: '1h ago', amount: 300, revealed: false },
  ]);

  const speakStock = (item: any) => {
    const text = language === 'hi-IN' 
      ? `${item.name} का स्टॉक ${item.qty} ${item.unit} है।`
      : `${item.name} stock is ${item.qty} ${item.unit}.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const toggleReveal = (id: number) => {
    setRecentSales(recentSales.map(s => s.id === id ? { ...s, revealed: !s.revealed } : s));
  };

  const lowStockCount = stock.filter(s => s.level < 30).length;

  return (
    <div className="space-y-6">
      {lowStockCount > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center justify-between animate-pulse">
          <p className="text-destructive font-bold text-sm">
            {language === 'hi-IN' ? `⚠️ ${lowStockCount} चीजें कम हैं!` : `⚠️ ${lowStockCount} items low!`}
          </p>
          <button onClick={() => speakStock(stock.find(s => s.level < 30))} className="text-destructive">
            <Volume2 size={20} />
          </button>
        </div>
      )}

      {/* Today's Sales Card */}
      <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-none overflow-hidden rounded-3xl shadow-2xl">
        <CardContent className="p-8">
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-2">
            {language === 'hi-IN' ? 'आज की बिक्री' : "TODAY'S SALES"}
          </p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-bold text-primary">₹</span>
            <span className={cn("text-5xl font-bold tracking-tighter", privateMode && "blur-xl")}>
              {salesData.total.toLocaleString()}
            </span>
          </div>
          <p className="text-secondary font-medium">
            {salesData.count} {language === 'hi-IN' ? 'लेन-देन' : 'transactions'}
          </p>
        </CardContent>
      </Card>

      {/* Stock Cards */}
      <div className="grid grid-cols-1 gap-4">
        {stock.map((item) => (
          <Card key={item.id} className="bg-card border-border overflow-hidden rounded-2xl">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4 items-center">
                  <span className="text-5xl">{item.emoji}</span>
                  <div>
                    <h3 className="text-muted-foreground text-xs uppercase font-bold">{item.name}</h3>
                    <p className="text-3xl font-bold">{item.qty}<span className="text-lg ml-1 font-normal opacity-60">{item.unit}</span></p>
                  </div>
                </div>
                <button 
                  onClick={() => speakStock(item)}
                  className="p-4 bg-secondary/10 rounded-full text-secondary hover:bg-secondary/20 active:scale-90 transition-all"
                >
                  <Volume2 size={24} />
                </button>
              </div>
              <div className="space-y-2">
                <Progress 
                  value={item.level} 
                  className="h-3"
                  indicatorClassName={cn(
                    item.level < 15 ? "bg-destructive" : item.level < 30 ? "bg-yellow-500" : "bg-secondary"
                  )}
                />
                <p className="text-[10px] text-muted-foreground text-center font-bold uppercase tracking-tight">
                  📊 Profit details in Report tab only 🔐
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Sales */}
      <div className="space-y-4">
        <h3 className="text-muted-foreground text-xs uppercase font-bold tracking-wider px-1">
          {language === 'hi-IN' ? 'हाल की बिक्री' : 'RECENT SALES'}
        </h3>
        <div className="space-y-3">
          {recentSales.map((sale) => (
            <div key={sale.id} className="bg-card/30 border border-border p-4 rounded-2xl flex items-center justify-between">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                  {sale.item === 'Aata' ? '🌾' : sale.item === 'Milk' ? '🥛' : '🧼'}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{sale.item}</h4>
                  <p className="text-xs text-muted-foreground">{sale.qty} • {sale.customer} • {sale.time}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {sale.revealed && !privateMode ? (
                  <span className="text-2xl font-bold text-primary">₹{sale.amount}</span>
                ) : (
                  <button 
                    onClick={() => toggleReveal(sale.id)}
                    className="flex items-center gap-1 py-2 px-3 bg-muted rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-secondary/20 transition-all"
                  >
                    <Eye size={14} /> {language === 'hi-IN' ? 'देखें' : 'Reveal'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
