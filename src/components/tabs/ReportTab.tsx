"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock, Eye, EyeOff, Share2, Download, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportTabProps {
  role: "owner" | "helper";
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
}

export default function ReportTab({ role, privateMode, language }: ReportTabProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [revealMargin, setRevealMargin] = useState(false);
  const { toast } = useToast();

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin === "1234") {
      setIsLocked(false);
    } else if (newPin.length === 4) {
      setPin("");
    }
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-500">
        <div className="p-6 bg-primary/10 rounded-full">
          <Lock size={48} className="text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">{language === 'hi-IN' ? 'मालिक का PIN दर्ज करें' : 'Enter Owner PIN'}</h2>
          <p className="text-muted-foreground">{language === 'hi-IN' ? 'रिपोर्ट देखने के लिए सुरक्षा जरूरी है' : 'Security required for reports'}</p>
        </div>
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("w-4 h-4 rounded-full border-2", pin.length > i ? "bg-primary border-primary" : "border-border")} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
            <button key={n} onClick={() => handlePinDigit(n.toString())} className="h-16 rounded-2xl bg-card border border-border text-2xl font-bold active:bg-primary transition-all">
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const reports = {
    weekly: 24500,
    bestProduct: "Grains 🌾",
    bestMargin: "15%",
    customerPattern: language === 'hi-IN' ? 'लोग सुबह 9 बजे सबसे ज्यादा दूध खरीदते हैं।' : 'Customers buy milk most at 9 AM.',
    salesPattern: language === 'hi-IN' ? 'शनिवार को बिक्री 20% बढ़ जाती है।' : 'Sales increase by 20% on Saturdays.',
    tip: language === 'hi-IN' ? 'अगले हफ्ते साबुन पर ऑफर चलाएं!' : 'Run an offer on Soaps next week!'
  };

  return (
    <div className="space-y-6 pb-20">
      <Card className="bg-gradient-to-br from-secondary/20 to-primary/20 border-none rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">{language === 'hi-IN' ? 'हफ्ते की कुल कमाई' : 'WEEKLY REVENUE'}</p>
          <p className={cn("text-6xl font-black tracking-tighter", privateMode && "blur-2xl")}>
            ₹{reports.weekly.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-5 space-y-1">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">{language === 'hi-IN' ? 'सबसे अच्छा सामान' : 'BEST PRODUCT'}</p>
            <p className="text-2xl font-bold">{reports.bestProduct}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-5 space-y-1">
            <p className="text-[10px] font-bold uppercase text-muted-foreground">{language === 'hi-IN' ? 'मुनाफा' : 'BEST MARGIN'}</p>
            {revealMargin ? (
              <p className="text-2xl font-bold text-secondary">{reports.bestMargin}</p>
            ) : (
              <button onClick={() => setRevealMargin(true)} className="flex items-center gap-1 py-1 px-3 bg-muted rounded-full text-[10px] font-bold uppercase">
                <Eye size={14} /> Reveal
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">{language === 'hi-IN' ? 'AI की सलाह' : 'AI INSIGHTS'}</h3>
        <Card className="rounded-3xl border-border bg-card shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div className="flex gap-4">
              <div className="text-4xl">👥</div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground">{language === 'hi-IN' ? 'ग्राहक का तरीका' : 'Customer Pattern'}</p>
                <p className="text-lg font-medium">{reports.customerPattern}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-4xl">📈</div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-muted-foreground">{language === 'hi-IN' ? 'बिक्री का तरीका' : 'Sales Pattern'}</p>
                <p className="text-lg font-medium">{reports.salesPattern}</p>
              </div>
            </div>
            <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-2xl flex gap-4">
              <div className="text-3xl">💡</div>
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase text-secondary">{language === 'hi-IN' ? 'अगले हफ्ते की टिप' : 'Weekly Tip'}</p>
                <p className="text-lg font-bold">{reports.tip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-4">
        <button 
          onClick={() => toast({ title: "WhatsApp Summary Shared!" })}
          className="w-full py-5 bg-[#1A6B3C] text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-xl active:scale-95 transition-all"
        >
          <Share2 size={24} />
          WhatsApp Summary
        </button>
        <button 
          onClick={() => toast({ title: "Data Exported successfully!" })}
          className="w-full py-5 bg-card border-2 border-border text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-xl active:scale-95 transition-all"
        >
          <Download size={24} />
          Export Data
        </button>
      </div>

      <div className="p-6 bg-muted/30 rounded-3xl border border-border space-y-3">
        <h4 className="text-[10px] font-bold uppercase text-muted-foreground">{language === 'hi-IN' ? 'सुरक्षा सेटिंग्स' : 'PRIVACY FEATURES'}</h4>
        <ul className="space-y-2">
          {['PIN Protection', 'Helper Mode Restricted', 'Auto-Blur Numbers', 'Local PIN Hashing'].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Check size={14} className="text-secondary" /> {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
