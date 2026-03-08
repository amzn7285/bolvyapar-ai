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
    <div className="fixed inset-0 bg-white text-navy-900 z-[100] flex flex-col p-8 animate-in fade-in zoom-in-95">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
        {transaction ? (
          <>
            <div className="space-y-4">
              <span className="text-8xl block">
                {transaction.productName?.toLowerCase().includes('milk') ? '🥛' : 
                 transaction.productName?.toLowerCase().includes('grain') ? '🌾' : '🛍️'}
              </span>
              <h2 className="text-6xl font-bold text-[#0D2240]">{transaction.productName}</h2>
              <p className="text-4xl text-muted-foreground">{transaction.quantity} {transaction.unit}</p>
            </div>
            
            <div className="w-full h-px bg-border max-w-md" />
            
            <div className="space-y-4">
              <p className="text-3xl font-bold uppercase tracking-widest text-muted-foreground">{texts.amount}</p>
              <p className="text-[120px] font-black text-secondary leading-none">₹{transaction.price || '---'}</p>
            </div>
          </>
        ) : (
          <div className="space-y-8 opacity-40">
            <span className="text-9xl block">🏪</span>
            <p className="text-4xl font-bold italic">{texts.waiting}</p>
          </div>
        )}
      </div>

      <button 
        onClick={onBack}
        className="w-full py-8 bg-[#0D2240] text-white rounded-3xl flex items-center justify-center gap-4 text-4xl font-bold active:scale-95 transition-all shadow-2xl"
      >
        <ChevronLeft size={48} />
        {texts.back}
      </button>
    </div>
  );
}
