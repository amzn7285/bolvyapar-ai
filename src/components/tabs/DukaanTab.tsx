
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, TrendingUp, BarChart2, Loader2, Wallet, Scissors, Wrench, Utensils, Truck, ShoppingBasket } from "lucide-react";

interface DukaanTabProps {
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
  sales: any[];
  profile: any;
  totalOutstanding: number;
  onGenerateSummary: () => void;
  isGeneratingSummary?: boolean;
}

export default function DukaanTab({ privateMode, language, sales, profile, totalOutstanding, onGenerateSummary, isGeneratingSummary }: DukaanTabProps) {
  const [revealedSales, setRevealedSales] = useState<Set<number>>(new Set());
  
  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.timestamp).toDateString() === today);
  const totalAmount = todaySales.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const count = todaySales.length;

  const texts = {
    "hi-IN": {
      todaySales: language === 'hi-IN' ? "आज की बिक्री" : "Today's Sales",
      recentSales: "हाल की गतिविधियां",
      outstanding: "उधार बाकी",
      txns: "लेन-देन",
      tapToReveal: "टैप करें",
      empty: "अभी तक कोई रिकॉर्ड नहीं",
      summary: "आज का हिसाब"
    },
    "en-IN": {
      todaySales: "Today's Activity",
      recentSales: "Recent Activity",
      outstanding: "Total Outstanding",
      txns: "txns",
      tapToReveal: "Tap to reveal",
      empty: "No records yet",
      summary: "Summary"
    }
  }[language];

  const getBizIcon = () => {
    switch (profile?.businessType) {
      case 'tailor': return <Scissors size={20} />;
      case 'repair': return <Wrench size={20} />;
      case 'dhaba': return <Utensils size={20} />;
      case 'milk': return <Truck size={20} />;
      default: return <ShoppingBasket size={20} />;
    }
  };

  const getTransactionLabel = (sale: any) => {
    if (profile?.businessType === 'dhaba' && sale.metadata?.tableNumber) {
      return `Table ${sale.metadata.tableNumber}`;
    }
    if (profile?.businessType === 'tailor' && sale.metadata?.deliveryDate) {
      return `Delivery: ${sale.metadata.deliveryDate}`;
    }
    if (profile?.businessType === 'repair' && sale.metadata?.problem) {
      return `Fix: ${sale.metadata.problem}`;
    }
    return sale.qty;
  };

  return (
    <div className="space-y-4">
      <Card className={cn(
        "rounded-2xl shadow-sm border-2 transition-all",
        totalOutstanding > 0 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
      )}>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
              totalOutstanding > 0 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
            )}>
              <Wallet size={32} />
            </div>
            <div>
              <p className={cn(
                "text-[10px] font-black uppercase tracking-widest mb-1",
                totalOutstanding > 0 ? "text-red-500" : "text-emerald-500"
              )}>
                {texts.outstanding}
              </p>
              <p className={cn(
                "text-3xl font-black transition-all",
                totalOutstanding > 0 ? "text-red-700" : "text-emerald-700",
                privateMode && "blur-md"
              )}>
                ₹{totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0D2240] border-none rounded-[32px] overflow-hidden shadow-xl">
        <CardContent className="p-8 relative">
          <TrendingUp size={100} className="absolute right-[-20px] bottom-[-20px] text-white/5 rotate-12" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">{texts.todaySales}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#C45000]">₹</span>
                <span className={cn("text-5xl font-black text-white transition-all", privateMode && "blur-xl")}>
                  {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
            <button 
              onClick={onGenerateSummary}
              disabled={isGeneratingSummary || count === 0}
              className="flex items-center gap-2 px-4 py-3 bg-[#C45000] text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-xl active:scale-95 transition-all disabled:opacity-50"
            >
              {isGeneratingSummary ? <Loader2 size={16} className="animate-spin" /> : <BarChart2 size={16} />}
              {texts.summary}
            </button>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[#1A6B3C]" />
            <p className="text-white/60 font-black text-sm">{count} {texts.txns}</p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 pt-2">
        <h3 className="text-slate-900 text-xl font-black tracking-tight px-1">{texts.recentSales}</h3>
        <div className="space-y-2">
          {sales.length === 0 ? (
            <div className="text-center py-16 opacity-40">
              <span className="text-6xl block mb-4">📋</span>
              <p className="text-lg font-bold">{texts.empty}</p>
            </div>
          ) : (
            sales.slice(0, 10).map((sale) => (
              <div 
                key={sale.id} 
                onClick={() => setRevealedSales(prev => {
                  const n = new Set(prev);
                  n.has(sale.id) ? n.delete(sale.id) : n.add(sale.id);
                  return n;
                })}
                className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm active:bg-slate-50 transition-all"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl">
                    {getBizIcon()}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-800">{sale.item}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {getTransactionLabel(sale)} • {sale.customer}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {revealedSales.has(sale.id) ? (
                    <span className="text-xl font-black text-[#C45000]">₹{sale.amount}</span>
                  ) : (
                    <div className="text-[10px] font-black text-slate-300 flex items-center gap-1 uppercase"><Eye size={12} /> {texts.tapToReveal}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
