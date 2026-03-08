"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface PinLockProps {
  onAuth: (role: "owner" | "helper") => void;
  language: "hi-IN" | "en-IN";
  onLanguageChange: (lang: "hi-IN" | "en-IN") => void;
}

const LANGUAGES = [
  { code: "hi-IN", label: "🇮🇳 हिंदी", active: true },
  { code: "en-IN", label: "🇬🇧 English", active: true },
  { code: "te-IN", label: "తెలుగు", active: false },
  { code: "ta-IN", label: "தமிழ்", active: false },
  { code: "bn-IN", label: "বাংলা", active: false },
  { code: "mr-IN", label: "मराठी", active: false },
];

export default function PinLock({ onAuth, language, onLanguageChange }: PinLockProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError(false);

    if (newPin.length === 4) {
      if (newPin === "1234") {
        onAuth("owner");
      } else if (newPin === "5678") {
        onAuth("helper");
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
      title: "दुकान साथी AI 🇮🇳",
      select: "भाषा चुनें",
      enter: "PIN दर्ज करें",
      error: "गलत PIN",
    },
    "en-IN": {
      title: "DukaanSaathi AI 🇮🇳",
      select: "Select Language",
      enter: "Enter PIN",
      error: "Wrong PIN",
    }
  }[language];

  return (
    <div className="flex flex-col items-center justify-between h-full p-4 text-center bg-background overflow-y-auto">
      <div className="w-full max-w-sm space-y-6 mt-2">
        <h1 className="text-xl font-black text-white">{texts.title}</h1>
        
        <div className="space-y-3">
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">{texts.select}</p>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                disabled={!lang.active}
                onClick={() => lang.active && onLanguageChange(lang.code as any)}
                className={cn(
                  "relative flex flex-col items-center justify-center h-14 rounded-xl border transition-all",
                  language === lang.code 
                    ? "border-primary bg-primary/10 scale-105 z-10" 
                    : "border-border bg-card/50",
                  !lang.active && "opacity-50 grayscale cursor-not-allowed"
                )}
              >
                <span className="text-lg leading-none">{lang.label.split(' ')[0]}</span>
                <span className="text-[10px] font-bold">{lang.label.split(' ')[1]}</span>
                {!lang.active && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 scale-75 whitespace-nowrap bg-muted text-[8px] px-1 h-3">
                    Soon
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-6 my-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 bg-card rounded-full shadow-inner border border-border flex items-center justify-center">
            <Lock className={cn("w-6 h-6", error ? "text-destructive animate-shake" : "text-primary")} />
          </div>
          <div className="flex gap-3">
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
          {error && <p className="text-destructive text-sm font-bold uppercase">{texts.error}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleDigit(n.toString())}
              className="h-14 w-14 rounded-full bg-card active:bg-primary transition-all text-xl font-bold flex items-center justify-center border border-border mx-auto"
            >
              {n}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit("0")}
            className="h-14 w-14 rounded-full bg-card active:bg-primary transition-all text-xl font-bold flex items-center justify-center border border-border mx-auto"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 w-14 rounded-full bg-card/50 flex items-center justify-center text-muted-foreground mx-auto"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
