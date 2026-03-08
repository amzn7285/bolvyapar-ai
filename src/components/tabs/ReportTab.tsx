"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Lock, Eye, Share2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportTabProps {
  role: "owner" | "helper";
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
}

export default function ReportTab({ language, privateMode }: ReportTabProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [revealMargin, setRevealMargin] = useState(false);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === "1234") {
        setIsLocked(false);
        setPin("");
      } else {
        setTimeout(() => {
          setPin("");
          setError(true);
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const texts = {
    "hi-IN": {
      title: "रिपोर्ट लॉक",
      enter: "मालिक का PIN",
      error: "गलत PIN",
      revenue: "हफ्ते की कमाई",
      bestProduct: "सबसे अच्छा सामान",
      margin: "मुनाफा",
      reveal: "👁️ देखें",
      insights: "AI की सलाह",
      customerPattern: "ग्राहक का तरीका",
      salesPattern: "बिक्री का तरीका",
      tip: "टिप",
      whatsapp: "WhatsApp",
      export: "Export",
      privacy: "सुरक्षा",
      lockReport: "लॉक करें"
    },
    "en-IN": {
      title: "Report Locked",
      enter: "Enter PIN",
      error: "Wrong PIN",
      revenue: "WEEKLY REVENUE",
      bestProduct: "BEST PRODUCT",
      margin: "MARGIN",
      reveal: "👁️ Reveal",
      insights: "AI INSIGHTS",
      customerPattern: "Customer Pattern",
      salesPattern: "Sales Pattern",
      tip: "Tip",
      whatsapp: "WhatsApp",
      export: "Export",
      privacy: "PRIVACY",
      lockReport: "Lock"
    }
  }[language];

  const reports = {
    weekly: 24500,
    bestProduct: language === 'hi-IN' ? 'अनाज 🌾' : 'Grains 🌾',
    bestMargin: "15%",
    customerPattern: language === 'hi-IN' ? 'लोग सुबह 9 बजे सबसे ज्यादा दूध खरीदते हैं।' : 'Customers buy milk most at 9 AM.',
    salesPattern: language === 'hi-IN' ? 'शनिवार को बिक्री 20% बढ़ जाती है।' : 'Sales increase by 20% on Saturdays.',
    tip: language === 'hi-IN' ? 'अगले हफ्ते साबुन पर ऑफर चलाएं!' : 'Run an offer on Soaps next week!'
  };

  const handleWhatsAppSummary = () => {
    const summary = `${language === 'hi-IN' ? 'व्यापार अपडेट' : 'Business Update'}: 
${texts.bestProduct}: ${reports.bestProduct}
${texts.customerPattern}: ${reports.customerPattern}
${texts.salesPattern}: ${reports.salesPattern}
${texts.tip}: ${reports.tip}`;

    toast({ 
      title: "Summary Shared!",
      description: "Financials excluded." 
    });
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60svh] space-y-6 animate-in fade-in zoom-in-95 px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-4 bg-card rounded-full border border-border">
            <Lock className={cn("w-8 h-8", error ? "text-destructive animate-shake" : "text-primary")} />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold">{texts.title}</h2>
            <p className="text-muted-foreground text-[10px] uppercase tracking-widest">{texts.enter}</p>
          </div>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full border transition-all duration-300",
                pin.length > i ? "bg-primary border-primary scale-110" : "border-border"
              )}
            />
          ))}
        </div>

        {error && <p className="text-destructive text-[10px] font-bold uppercase">{texts.error}</p>}

        <div className="grid grid-cols-3 gap-4 w-full max-w-[240px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handlePinDigit(n.toString())}
              className="h-12 w-12 rounded-full bg-card active:bg-primary transition-all text-xl font-bold flex items-center justify-center border border-border mx-auto"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handlePinDigit("0")}
            className="h-12 w-12 rounded-full bg-card active:bg-primary transition-all text-xl font-bold flex items-center justify-center border border-border mx-auto"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-12 w-12 rounded-full bg-card/50 text-xs flex items-center justify-center text-muted-foreground mx-auto"
          >
            ⌫
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold">{language === 'hi-IN' ? 'व्यापार रिपोर्ट' : 'Business Report'}</h2>
        <button 
          onClick={() => {
            setIsLocked(true);
            setRevealMargin(false);
          }}
          className="flex items-center gap-1 h-8 px-3 bg-destructive/10 text-destructive rounded-lg text-[10px] font-bold uppercase"
        >
          <Lock size={12} />
          {texts.lockReport}
        </button>
      </div>

      <Card className="bg-gradient-to-br from-secondary/10 to-primary/10 border-none rounded-2xl overflow-hidden shadow-md">
        <CardContent className="p-6">
          <p className="text-[10px] font-bold uppercase opacity-60 mb-1">{texts.revenue}</p>
          <p className={cn("text-3xl font-black", privateMode && "blur-lg")}>
            ₹{reports.weekly.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        <Card className="rounded-xl border-border bg-card">
          <CardContent className="p-4">
            <p className="text-[8px] font-bold uppercase text-muted-foreground mb-1">{texts.bestProduct}</p>
            <p className="text-lg font-black">{reports.bestProduct}</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-xl border-border bg-card">
          <CardContent className="p-4">
            <p className="text-[8px] font-bold uppercase text-muted-foreground mb-1">{texts.margin}</p>
            {revealMargin ? (
              <p className="text-lg font-black text-secondary">{reports.bestMargin}</p>
            ) : (
              <button 
                onClick={() => setRevealMargin(true)} 
                className="flex items-center gap-1 h-8 px-3 bg-muted rounded-lg text-[10px] font-bold uppercase text-primary"
              >
                <Eye size={12} /> {texts.reveal}
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] font-bold uppercase text-muted-foreground px-1">{texts.insights}</h3>
        <Card className="rounded-2xl border-border bg-card">
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-3">
              <div className="text-2xl">👥</div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-bold uppercase text-muted-foreground">{texts.customerPattern}</p>
                <p className="text-xs font-bold leading-tight">{reports.customerPattern}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">📈</div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-bold uppercase text-muted-foreground">{texts.salesPattern}</p>
                <p className="text-xs font-bold leading-tight">{reports.salesPattern}</p>
              </div>
            </div>
            <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl flex gap-3">
              <div className="text-xl">💡</div>
              <div className="space-y-0.5">
                <p className="text-[8px] font-bold uppercase text-secondary">{texts.tip}</p>
                <p className="text-xs font-black">{reports.tip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button 
          onClick={handleWhatsAppSummary}
          className="w-full h-12 bg-[#1A6B3C] text-white rounded-xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-all"
        >
          <Share2 size={16} />
          {texts.whatsapp}
        </button>
        <button 
          onClick={() => toast({ title: "Exported!" })}
          className="w-full h-12 bg-card border border-border text-white rounded-xl flex items-center justify-center gap-2 font-bold text-sm active:scale-95 transition-all"
        >
          <Download size={16} />
          {texts.export}
        </button>
      </div>
    </div>
  );
}
