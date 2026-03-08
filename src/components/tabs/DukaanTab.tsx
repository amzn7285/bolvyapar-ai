"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, TrendingUp } from "lucide-react";

interface DukaanTabProps {
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
}

export default function DukaanTab({ privateMode, language }: DukaanTabProps) {
  const [salesData] = useState({ total: 1450, count: 12 });
  const [revealedSales, setRevealedSales] = useState<Set<number>>(new Set());
  
  const [recentSales] = useState([
    { id: 1, item: language === 'hi-IN' ? 'आटा' : 'Aata', qty: '5kg', customer: 'Rahul', amount: 240 },
    { id: 2, item: language === 'hi-IN' ? 'दूध' : 'Milk', qty: '2L', customer: 'Sita', amount: 120 },
    { id: 3, item: language === 'hi-IN' ? 'साबुन' : 'Soap', qty: '3 units', customer: 'Amit', amount: 300 },
  ]);

  const texts = {
    "hi-IN": {
      todaySales: "आज की बिक्री",
      recentSales: "हाल की बिक्री",
      txns: "लेन-देन",
      tapToReveal: "कीमत देखने के लिए टैप करें"
    },
    "en-IN": {
      todaySales: "Today's Sales",
      recentSales: "Recent Sales",
      txns: "txns",
      tapToReveal: "Tap sale to reveal privately"
    }
  }[language];

  return (
    <div className="space-y-6">
      {/* Today's Sales Card */}
      <Card className="bg-[#0D2240] border-none rounded-[24px] overflow-hidden shadow-xl">
        <CardContent className="p-6 relative">
          <TrendingUp size={64} className="absolute right-[-10px] bottom-[-10px] text-white/5 rotate-12" />
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">{texts.todaySales}</p>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-xl font-bold text-[#C45000]">₹</span>
            <span className={cn("text-[32px] font-black text-white transition-all", privateMode && "blur-xl")}>
              {salesData.total.toLocaleString()}
            </span>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1A6B3C]" />
            <p className="text-white/60 font-bold text-xs">{salesData.count} {texts.txns}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales List */}
      <div className="space-y-4">
        <div className="px-1 flex justify-between items-baseline">
          <h3 className="text-slate-900 text-lg font-black tracking-tight">{texts.recentSales}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{texts.tapToReveal}</p>
        </div>
        
        <div className="space-y-3">
          {recentSales.map((sale) => (
            <div 
              key={sale.id} 
              onClick={() => {
                setRevealedSales(prev => {
                  const next = new Set(prev);
                  next.has(sale.id) ? next.delete(sale.id) : next.add(sale.id);
                  return next;
                });
              }}
              className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm active:bg-slate-50 transition-all cursor-pointer"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl">
                  {sale.item.includes('आटा') || sale.item === 'Aata' ? '🌾' : sale.item.includes('दूध') || sale.item === 'Milk' ? '🥛' : '🧼'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{sale.item}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">{sale.qty} • {sale.customer}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                {revealedSales.has(sale.id) ? (
                  <span className="text-[22px] font-black text-[#C45000] animate-in zoom-in-95">₹{sale.amount}</span>
                ) : (
                  <div className="flex items-center gap-2 h-10 px-4 bg-slate-50 rounded-xl text-[10px] font-bold uppercase text-slate-400 border border-slate-100">
                    <Eye size={14} /> Reveal
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
