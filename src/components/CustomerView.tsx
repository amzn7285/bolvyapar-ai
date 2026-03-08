"use client";

import { ChevronLeft } from "lucide-react";

interface CustomerViewProps {
  transaction: any;
  onBack: () => void;
  language: "hi-IN" | "en-IN";
}

export default function CustomerView({ transaction, onBack, language }: CustomerViewProps) {
  const texts = {
    "hi-IN": { back: "वापस", amount: "कुल कीमत", waiting: "अगले ग्राहक का इंतज़ार..." },
    "en-IN": { back: "Back", amount: "Total Price", waiting: "Waiting for next customer..." }
  }[language];

  return (
    <div className="fixed inset-0 bg-white text-[#0D2240] z-[100] flex flex-col p-6 animate-in fade-in zoom-in-95">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        {transaction ? (
          <>
            <div className="space-y-2">
              <span className="text-5xl block">
                {transaction.productName?.toLowerCase().includes('milk') ? '🥛' : 
                 transaction.productName?.toLowerCase().includes('grain') ? '🌾' : '🛍️'}
              </span>
              <h2 className="text-2xl font-bold text-[#0D2240]">{transaction.productName}</h2>
              <p className="text-lg text-muted-foreground">{transaction.quantity} {transaction.unit}</p>
            </div>
            
            <div className="w-full h-px bg-border max-w-[200px]" />
            
            <div className="space-y-2">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{texts.amount}</p>
              <p className="text-5xl font-black text-secondary leading-none">₹{transaction.price || '---'}</p>
            </div>
          </>
        ) : (
          <div className="space-y-4 opacity-40">
            <span className="text-6xl block">🏪</span>
            <p className="text-xl font-bold italic">{texts.waiting}</p>
          </div>
        )}
      </div>

      <button 
        onClick={onBack}
        className="w-full py-4 bg-[#0D2240] text-white rounded-2xl flex items-center justify-center gap-2 text-xl font-bold active:scale-95 transition-all shadow-xl"
      >
        <ChevronLeft size={24} />
        {texts.back}
      </button>
    </div>
  );
}
