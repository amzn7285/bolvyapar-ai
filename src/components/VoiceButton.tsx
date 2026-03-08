"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, Send, Keyboard, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VoiceButtonProps {
  language: "hi-IN" | "en-IN";
  privateMode: boolean;
  onTransactionSuccess: (details: any) => void;
  onLessonGenerated: (lessonText: string) => void;
  compact?: boolean;
}

export default function VoiceButton({ language, privateMode, onTransactionSuccess, onLessonGenerated, compact }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textQuery, setTextQuery] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.onresult = (e: any) => {
          const query = e.results[0][0].transcript;
          processQuery(query);
        };
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (isListening || isProcessing) return;
    speak(language === "hi-IN" ? "बोलिए" : "Boliye");
    setIsListening(true);
    try {
      recognitionRef.current?.start();
    } catch {
      setShowTextInput(true);
      setIsListening(false);
    }
  };

  const processQuery = async (query: string) => {
    if (!query.trim()) return;
    setIsProcessing(true);
    try {
      const systemPrompt = `You are BolLedger AI. Task: Parse the user's voice sale transaction query into structured JSON. 
Output format: {"reply": "A warm voice confirmation", "lesson": "A short business lesson", "product": "Extracted product name", "price": number}. 
Privacy: Never mention the exact profit margin aloud.
Mode: ${privateMode ? 'Private' : 'Normal'}. Language: ${language}.`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: query, systemPrompt }),
      });
      const data = await response.json();
      const content = data.choices[0].message.content;
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanContent);
      
      speak(parsed.reply);
      onTransactionSuccess({ productName: parsed.product || query, price: parsed.price || 0 });
      if (parsed.lesson) onLessonGenerated(parsed.lesson);
      
      setTextQuery("");
      setShowTextInput(false);
    } catch (err) {
      console.error(err);
      speak(language === "hi-IN" ? "माफ कीजिये, कुछ गड़बड़ हो गई।" : "Sorry, an error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (showTextInput) {
    return (
      <div className="fixed inset-x-0 bottom-24 px-4 z-[70] animate-in slide-in-from-bottom-4">
        <div className="bg-white border border-slate-200 p-4 rounded-[24px] shadow-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-[#C45000] uppercase tracking-[0.2em]">Manual Entry</h3>
            <button onClick={() => setShowTextInput(false)} className="text-slate-400 p-2"><X size={20} /></button>
          </div>
          <Input 
            value={textQuery} 
            onChange={e => setTextQuery(e.target.value)} 
            placeholder={language === 'hi-IN' ? "जैसे: 5 किलो आटा बेचा..." : "e.g. Sold 5kg flour..."}
            className="h-16 text-sm border-slate-100 rounded-2xl bg-slate-50" 
            autoFocus 
          />
          <Button onClick={() => processQuery(textQuery)} disabled={isProcessing || !textQuery.trim()} className="w-full h-16 rounded-2xl bg-[#C45000] text-white font-bold">
            {isProcessing ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        <button
          onClick={startListening}
          className={cn(
            "h-20 w-20 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(196,80,0,0.3)] transition-all active:scale-90 border-4 border-white",
            isListening ? "bg-red-500 animate-pulse" : "bg-[#C45000]",
            isProcessing && "bg-slate-400"
          )}
        >
          {isProcessing ? <Loader2 className="text-white animate-spin" size={32} /> : <Mic className="text-white" size={32} />}
        </button>
        <button 
          onClick={() => setShowTextInput(true)}
          className="absolute -right-8 h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm"
        >
          <Keyboard size={18} />
        </button>
      </div>
      <p className="mt-1 text-[10px] font-black text-[#C45000] uppercase tracking-tighter">
        {isListening ? "Sun Rahe Hai..." : "BolLedger"}
      </p>
    </div>
  );
}