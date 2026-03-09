
"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, Keyboard, X, Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VoiceButtonProps {
  language: "hi-IN" | "en-IN";
  privateMode: boolean;
  onTransactionSuccess: (details: any) => void;
  onSummaryRequested?: () => void;
  salesHistory?: any[];
  compact?: boolean;
  businessType?: string;
  stock?: any[];
}

const MAPPINGS_KEY = "bolvyapar_product_mappings";

export default function VoiceButton({
  language,
  privateMode,
  onTransactionSuccess,
  onSummaryRequested,
  salesHistory = [],
  compact,
  businessType = "kirana",
  stock = [],
}: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textQuery, setTextQuery] = useState("");
  const [learnedMappings, setLearnedMappings] = useState<Record<string, { category: string, count: number }>>({});
  
  // States for confirmation card & auto-confirm
  const [pendingTxn, setPendingTxn] = useState<any>(null);
  const [autoConfirmTimer, setAutoConfirmTimer] = useState<number | null>(null);
  
  // State for clarifying question
  const [isAskingClarification, setIsAskingClarification] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Load learned mappings
    const saved = localStorage.getItem(MAPPINGS_KEY);
    if (saved) {
      try { setLearnedMappings(JSON.parse(saved)); } catch (e) { console.error(e); }
    }

    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = (e: any) => {
          const query = e.results[0][0].transcript;
          if (isAskingClarification) {
            handleClarificationResponse(query);
          } else {
            processQuery(query);
          }
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      } else {
        setShowTextInput(true);
      }
    }
  }, [language, isAskingClarification]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (isListening || isProcessing) return;
    if (!isAskingClarification) speak(language === "hi-IN" ? "बोलिए" : "Go ahead");
    setIsListening(true);
    try {
      if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
      }
    } catch {
      setShowTextInput(true);
      setIsListening(false);
    }
  };

  const getSystemPrompt = () => {
    const stockCategories = stock.map(s => s.name).join(", ");
    let bizSpecifics = "";
    switch (businessType) {
      case 'tailor':
        bizSpecifics = "For TAILORS: Map input to 'productName' (item), 'customerName', 'price' (advance amount), and 'metadata' containing 'deliveryDate' (date).";
        break;
      case 'repair':
        bizSpecifics = "For REPAIR SHOPS: Map input to 'productName' (device), 'customerName', 'price' (estimated cost), and 'metadata' containing 'problem' (the issue).";
        break;
      case 'dhaba':
        bizSpecifics = "For DHABA: Map input to 'productName' (items), 'price', and 'metadata' containing 'tableNumber'.";
        break;
      case 'milk':
        bizSpecifics = "For MILK DELIVERY: Map input to 'customerName', 'quantity', and 'unit' (litres). Handle subscription updates.";
        break;
      default:
        bizSpecifics = `For KIRANA: Map input to 'productName', 'quantity', 'unit', and 'price'. Existing categories: ${stockCategories}`;
    }

    return `You are BolVyapar AI. Parse voice input.
    INTENTS: Sale/Order, Expense, Credit, Payment.
    ${bizSpecifics}
    Return ONLY JSON:
    {
      "spokenResponse": "1-sentence confirmation",
      "productName": "Item name",
      "quantity": number,
      "unit": "kg/L/etc",
      "customerName": "Name",
      "price": number,
      "isExpense": boolean,
      "isCredit": boolean,
      "isPayment": boolean,
      "suggestedCategory": "Stock Category Name based on fuzzy matching product",
      "confidence": number (0 to 1)
    }`;
  };

  const processQuery = async (query: string) => {
    if (!query.trim()) return;
    setIsProcessing(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage: query, systemPrompt: getSystemPrompt() }),
      });

      const data = await response.json();
      const rawReply = data.reply || "";
      const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        handleTransactionResult(parsed);
      }
    } catch (err) {
      console.error(err);
      speak(language === "hi-IN" ? "गड़बड़ हो गई।" : "Error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransactionResult = (txn: any) => {
    const productName = txn.productName?.toLowerCase();
    const mapping = learnedMappings[productName];

    // Case 1: Already learned permanently (count >= 3)
    if (mapping && mapping.count >= 3) {
      txn.matchedCategory = mapping.category;
      finalizeTransaction(txn);
      return;
    }

    // Case 2: Low confidence or new mapping -> Clarify
    if (!mapping || txn.confidence < 0.7) {
      const categoryToAsk = mapping?.category || txn.suggestedCategory;
      if (categoryToAsk) {
        setPendingTxn(txn);
        setSuggestedCategory(categoryToAsk);
        setIsAskingClarification(true);
        const question = language === "hi-IN" 
          ? `${txn.productName} ${categoryToAsk} में से गया क्या?` 
          : `Did ${txn.productName} come from ${categoryToAsk}?`;
        speak(question);
        // Start listening for haan/nahin after speaking
        setTimeout(() => startListening(), 1500);
      } else {
        finalizeTransaction(txn);
      }
    } else {
      // High confidence but not yet permanent
      txn.matchedCategory = mapping.category;
      finalizeTransaction(txn);
    }
  };

  const handleClarificationResponse = (query: string) => {
    const resp = query.toLowerCase();
    const isYes = resp.includes("haan") || resp.includes("han") || resp.includes("yes") || resp.includes("sahi");
    
    if (isYes && pendingTxn && suggestedCategory) {
      const productName = pendingTxn.productName?.toLowerCase();
      const currentMapping = learnedMappings[productName] || { category: suggestedCategory, count: 0 };
      const updatedMapping = { ...currentMapping, count: currentMapping.count + 1 };
      
      const newMappings = { ...learnedMappings, [productName]: updatedMapping };
      setLearnedMappings(newMappings);
      localStorage.setItem(MAPPINGS_KEY, JSON.stringify(newMappings));
      
      pendingTxn.matchedCategory = suggestedCategory;
      finalizeTransaction(pendingTxn);
    } else {
      speak(language === "hi-IN" ? "माफ कीजिये, रद्द कर दिया।" : "Sorry, cancelled.");
    }
    setIsAskingClarification(false);
    setPendingTxn(null);
    setSuggestedCategory(null);
  };

  const finalizeTransaction = (txn: any) => {
    setPendingTxn(txn);
    speak(txn.spokenResponse);
    // Start auto-confirm timer
    let timeLeft = 5;
    setAutoConfirmTimer(timeLeft);
    const interval = setInterval(() => {
      timeLeft -= 1;
      setAutoConfirmTimer(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(interval);
        confirmTransaction(txn);
      }
    }, 1000);
    (window as any)._pendingInterval = interval;
  };

  const confirmTransaction = (txn: any) => {
    clearInterval((window as any)._pendingInterval);
    onTransactionSuccess(txn);
    setPendingTxn(null);
    setAutoConfirmTimer(null);
  };

  const cancelTransaction = () => {
    clearInterval((window as any)._pendingInterval);
    setPendingTxn(null);
    setAutoConfirmTimer(null);
    speak(language === "hi-IN" ? "हटा दिया।" : "Removed.");
  };

  if (pendingTxn && !isAskingClarification) {
    return (
      <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
        <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10">
          <div className="p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center text-5xl">
                {pendingTxn.suggestedCategory?.toLowerCase().includes('milk') ? '🥛' : 
                 pendingTxn.suggestedCategory?.toLowerCase().includes('grain') ? '🌾' : '🛍️'}
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#0D2240]">{pendingTxn.productName}</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                  {pendingTxn.quantity} {pendingTxn.unit} • {pendingTxn.suggestedCategory}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-5xl font-black text-secondary">₹{pendingTxn.price || '---'}</div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary transition-all duration-1000 ease-linear"
                  style={{ width: `${(autoConfirmTimer || 0) * 20}%` }}
                />
              </div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Auto Confirming in {autoConfirmTimer}s...</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={cancelTransaction}
                className="h-20 rounded-3xl bg-red-50 text-red-600 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all border border-red-100"
              >
                <X size={24} />
                <span className="text-[10px] font-black uppercase">{language === 'hi-IN' ? 'गलत' : 'Wrong'}</span>
              </button>
              <button 
                onClick={() => confirmTransaction(pendingTxn)}
                className="h-20 rounded-3xl bg-secondary text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all shadow-xl shadow-secondary/20"
              >
                <Check size={24} />
                <span className="text-[10px] font-black uppercase">{language === 'hi-IN' ? 'सही है' : 'Sahi Hai'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showTextInput) {
    return (
      <div className="fixed inset-x-0 bottom-24 px-4 z-[70] animate-in slide-in-from-bottom-4">
        <div className="bg-white border border-slate-200 p-4 rounded-[24px] shadow-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-black text-[#C45000] uppercase tracking-[0.2em]">{language === "hi-IN" ? "लिख कर बताएं" : "Type Command"}</h3>
            <button onClick={() => setShowTextInput(false)} className="text-slate-400 p-2"><X size={20} /></button>
          </div>
          <Input value={textQuery} onChange={(e) => setTextQuery(e.target.value)} placeholder={language === "hi-IN" ? "जैसे: रमेश को 200 का उधार दिया..." : "e.g. Give 200 credit to Ramesh..."} className="h-14 text-sm rounded-2xl bg-slate-50 border-slate-100" />
          <Button onClick={() => processQuery(textQuery)} disabled={isProcessing || !textQuery.trim()} className="w-full h-14 rounded-2xl bg-[#C45000] text-white font-bold">{isProcessing ? <Loader2 className="animate-spin" /> : "Send"}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-4">
        <button onClick={startListening} disabled={isProcessing} className={cn("h-20 w-20 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(196,80,0,0.3)] transition-all active:scale-90 border-4 border-white", isListening ? "bg-red-500 animate-pulse" : "bg-[#C45000]", isProcessing && "bg-slate-400")}>
          {isProcessing ? <Loader2 className="text-white animate-spin" size={32} /> : <Mic className="text-white" size={32} />}
        </button>
        <button onClick={() => setShowTextInput(true)} className="h-12 w-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400 shadow-sm"><Keyboard size={20} /></button>
      </div>
      <p className="mt-2 text-[10px] font-black text-[#C45000] uppercase tracking-tighter">
        {isListening ? (isAskingClarification ? "Haan ya Nahin?" : "सुन रहा हूँ...") : "बोलिए"}
      </p>
    </div>
  );
}
