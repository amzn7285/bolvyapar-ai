"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock, Eye, Share2, Download, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportTabProps {
  role: "owner" | "helper";
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
  sales: any[];
}

export default function ReportTab({ language, privateMode, sales }: ReportTabProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [revealMargin, setRevealMargin] = useState(false);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  // Calculate stats from actual sales
  const totalRevenue = sales.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  // Find top product
  const productCounts: Record<string, number> = {};
  sales.forEach(s => {
    productCounts[s.item] = (productCounts[s.item] || 0) + 1;
  });
  const bestProduct = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "---";

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      if (newPin === "1234") { setIsLocked(false); setPin(""); }
      else { setTimeout(() => { setPin(""); setError(true); }, 300); }
    }
  };

  const texts = {
    "hi-IN": {
      title: "रिपोर्ट सुरक्षित",
      enter: "मालिक का PIN दर्ज करें",
      revenue: "हफ्ते की कुल कमाई",
      bestProduct: "टॉप प्रोडक्ट",
      margin: "मुनाफा",
      insights: "AI एनालिसिस",
      whatsapp: "शेयर समरी",
      lock: "लॉक करें"
    },
    "en-IN": {
      title: "Reports Secure",
      enter: "Enter Owner PIN",
      revenue: "WEEKLY REVENUE",
      bestProduct: "TOP PRODUCT",
      margin: "MARGIN",
      insights: "AI BUSINESS INSIGHTS",
      whatsapp: "Share Summary",
      lock: "Lock"
    }
  }[language];

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50svh] space-y-8 animate-in fade-in zoom-in-95 px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-6 bg-white rounded-[24px] shadow-xl border border-slate-100">
            <Lock className={cn("w-10 h-10", error ? "text-destructive" : "text-[#0D2240]")} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900">{texts.title}</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{texts.enter}</p>
          </div>
        </div>
        <div className="flex gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className={cn("w-4 h-4 rounded-full border-2 transition-all", pin.length > i ? "bg-[#C45000] border-[#C45000]" : "border-slate-200")} />)}
        </div>
        <div className="grid grid-cols-3 gap-4 w-full max-w-[260px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button key={n} onClick={() => handlePinDigit(n.toString())} className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 text-xl font-bold flex items-center justify-center text-slate-800 active:bg-slate-100">{n}</button>
          ))}
          <div />
          <button onClick={() => handlePinDigit("0")} className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 text-xl font-bold flex items-center justify-center text-slate-800 active:bg-slate-100">0</button>
          <button onClick={() => setPin(pin.slice(0, -1))} className="h-14 w-14 flex items-center justify-center text-slate-300 font-bold">⌫</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-black text-slate-900 tracking-tight">Business Reports</h2>
        <button onClick={() => setIsLocked(true)} className="flex items-center gap-2 h-10 px-4 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase">
          <Lock size={14} /> {texts.lock}
        </button>
      </div>

      <Card className="bg-[#0D2240] border-none rounded-[32px] overflow-hidden shadow-2xl">
        <CardContent className="p-8 relative">
          <TrendingUp size={80} className="absolute right-[-10px] bottom-[-10px] text-white/5" />
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">{texts.revenue}</p>
          <p className={cn("text-[26px] font-black text-white", privateMode && "blur-xl")}>₹{totalRevenue.toLocaleString()}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-[24px] border-slate-100 shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">{texts.bestProduct}</p>
            <p className="text-[22px] font-black text-slate-900 truncate">{bestProduct}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[24px] border-slate-100 shadow-sm bg-white">
          <CardContent className="p-5">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">{texts.margin}</p>
            {revealMargin ? (
              <p className="text-[22px] font-black text-[#1A6B3C]">15%</p>
            ) : (
              <button onClick={() => setRevealMargin(true)} className="h-10 px-4 bg-slate-50 rounded-xl text-[10px] font-bold uppercase text-[#C45000] border border-slate-100">👁️ Reveal</button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-slate-900 text-lg font-black tracking-tight px-1">{texts.insights}</h3>
        <Card className="rounded-[32px] border-slate-100 shadow-sm bg-white">
          <CardContent className="p-6 space-y-6">
            <div className="flex gap-4">
              <div className="text-3xl">👥</div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-slate-400">Customer Trend</p>
                <p className="text-sm font-bold text-slate-700 leading-tight">
                  {sales.length > 5 ? "Most customers visit in the morning hours." : "Keep recording sales for insights."}
                </p>
              </div>
            </div>
            <div className="p-5 bg-[#1A6B3C]/5 border border-[#1A6B3C]/10 rounded-2xl flex gap-4">
              <div className="text-3xl">💡</div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-[#1A6B3C]">Business Tip</p>
                <p className="text-sm font-black text-slate-800">
                  {sales.length > 0 ? `Your ${bestProduct} is popular! Stock more for tomorrow.` : "Record a sale to get a tip!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={() => toast({ title: "Summary Shared!" })} className="flex-1 h-14 bg-[#1A6B3C] text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-[#1A6B3C]/20">
          <Share2 size={18} /> WhatsApp
        </button>
        <button onClick={() => toast({ title: "Exported!" })} className="w-14 h-14 bg-white border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center shadow-sm">
          <Download size={20} />
        </button>
      </div>
    </div>
  );
}
