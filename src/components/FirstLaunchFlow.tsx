"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mic, Loader2, CheckCircle2, AlertCircle, ArrowRight, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface FirstLaunchFlowProps {
  onComplete: () => void;
  language: "hi-IN" | "en-IN";
}

const BUSINESS_TYPES = [
  { id: 'kirana', emoji: '🏪', en: "Kirana General Store", hi: "किराना जनरल स्टोर" },
  { id: 'dhaba', emoji: '🍵', en: "Dhaba Food Stall", hi: "ढाबा फूड स्टाल" },
  { id: 'tailor', emoji: '✂️', en: "Tailor Boutique", hi: "दर्जी बुटीक" },
  { id: 'repair', emoji: '🔧', en: "Repair Shop", hi: "रिपेयर शॉप" },
  { id: 'milk', emoji: '🥛', en: "Milk Delivery", hi: "दूध की डिलीवरी" },
  { id: 'medical', emoji: '💊', en: "Medical Store", hi: "मेडिकल स्टोर" },
  { id: 'salon', emoji: '💇', en: "सैलून ब्यूटी", hi: "सैलून ब्यूटी" },
  { id: 'other', emoji: '📦', en: "Other Business", hi: "अन्य व्यापार" },
];

export default function FirstLaunchFlow({ onComplete, language }: FirstLaunchFlowProps) {
  const [step, setStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [micError, setMicError] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [formData, setFormData] = useState({
    shopName: "",
    ownerPhone: "",
    businessType: "",
    firstStock: null as any,
    firstSale: null as any
  });

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setMicError(true); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setMicError(false);
      setTranscript("");
      transcriptRef.current = "";
    };

    recognition.onresult = (e: any) => {
      let current = "";
      for (let i = 0; i < e.results.length; i++) {
        current += e.results[i][0].transcript;
      }
      setTranscript(current);
      transcriptRef.current = current;
    };

    recognition.onend = () => {
      setIsListening(false);
      const captured = transcriptRef.current.trim();
      if (captured) saveItem(captured);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') setMicError(true);
    };

    recognitionRef.current = recognition;
  }, [language, step]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    window.speechSynthesis.speak(utterance);
  };

  const saveItem = (text: string) => {
    if (!text.trim()) return;

    if (step === 3) {
      const qtyMatch = text.match(/(\d+(\.\d+)?)\s*(kg|kilo|किलो|litre|liter|लीटर|piece|pcs|पीस|meter|मीटर|bottle|बोतल|tablet|tablet)/i);
      const qty = qtyMatch ? parseFloat(qtyMatch[1]) : 1;
      const unit = qtyMatch ? qtyMatch[3] : (language === 'hi-IN' ? "यूनिट" : "units");
      const name = text.replace(/\d+(\.\d+)?\s*(kg|kilo|किलो|litre|liter|लीटर|piece|pcs|पीस|meter|मीटर|bottle|बोतल|tablet)/gi, "")
                       .replace(/I have|hai|है|mera|mere|paas/gi, "")
                       .trim() || text.trim();

      const stockItem = { name, qty, unit, emoji: "📦", price: 0 };
      setFormData(prev => ({ ...prev, firstStock: stockItem }));
      speak(language === 'hi-IN' ? `${name} जोड़ दिया गया` : `${name} added`);
    } else if (step === 4) {
      const priceMatch = text.match(/(\d+)\s*(rupay|rupee|रुपये|रुपए|rs|₹)/i);
      const qtyMatch = text.match(/(\d+)\s*(kg|kilo|किलो|piece|pcs|लीटर|litre)/i);
      const price = priceMatch ? parseInt(priceMatch[1]) : 0;
      const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
      const productName = text.replace(/(\d+)\s*(rupay|rupee|रुपये|रुपए|rs|₹)/gi, "")
                               .replace(/becha|diya|sold|बेचा|दिया/gi, "")
                               .trim() || text.trim();

      const saleItem = { productName, price, quantity: qty };
      setFormData(prev => ({ ...prev, firstSale: saleItem }));
      speak(language === 'hi-IN' ? "बिक्री दर्ज हो गई" : "Sale recorded");
    }

    setTranscript("");
    transcriptRef.current = "";
    setManualInput("");
  };

  const startListening = () => {
    if (isListening) { recognitionRef.current?.stop(); return; }
    setTranscript("");
    transcriptRef.current = "";
    try { recognitionRef.current?.start(); }
    catch (e) { setMicError(true); }
  };

  const handleNext = () => {
    if (step < 5) setStep(prev => prev + 1);
    else finishSetup();
  };

  const finishSetup = () => {
    const finalProfile = {
      ...formData,
      ownerName: "Owner",
      businessType: formData.businessType || 'kirana'
    };
    localStorage.setItem("bolvyaapar_profile", JSON.stringify(finalProfile));

    if (formData.firstStock) {
      const stockItem = {
        ...formData.firstStock,
        id: Date.now(),
        level: 100,
        maxQty: formData.firstStock.qty || 10,
        lowStockLevel: Math.max(1, Math.floor((formData.firstStock.qty || 10) * 0.1)),
      };
      localStorage.setItem("bolvyaapar_stock_data", JSON.stringify([stockItem]));
    }

    if (formData.firstSale) {
      const saleItem = {
        ...formData.firstSale,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        customer: language === 'hi-IN' ? "ग्राहक" : "Customer",
        item: formData.firstSale.productName,
        amount: formData.firstSale.price,
        qty: `${formData.firstSale.quantity || 1} units`
      };
      localStorage.setItem("bolvyaapar_sales_history", JSON.stringify([saleItem]));
    }

    onComplete();
  };

  const getStep3Strings = () => {
    const biz = formData.businessType;
    const isHi = language === 'hi-IN';
    const config: Record<string, any> = {
      tailor: { title: isHi ? "कपड़ा और सामान" : "Add Fabric/Materials", sub: isHi ? "पहला थान बोलकर जोड़ें" : "Add first material by voice", instr: isHi ? "जैसे: '50 मीटर सूती कपड़ा है'" : "e.g. '50 meters cotton fabric'" },
      repair: { title: isHi ? "पार्ट्स इन्वेंट्री" : "Add Parts Inventory", sub: isHi ? "पहला पुर्जा बोलकर जोड़ें" : "Add first part by voice", instr: isHi ? "जैसे: '20 मोबाइल स्क्रीन हैं'" : "e.g. '20 mobile screens'" },
      dhaba: { title: isHi ? "सामग्री जोड़ें" : "Add Ingredients", sub: isHi ? "पहली सामग्री बोलकर जोड़ें" : "Add first ingredient by voice", instr: isHi ? "जैसे: '10 किलो आटा है'" : "e.g. '10kg Atta'" },
      milk: { title: isHi ? "उत्पाद जोड़ें" : "Add Products", sub: isHi ? "दूध की मात्रा बोलकर जोड़ें" : "Add quantity by voice", instr: isHi ? "जैसे: '50 लीटर दूध'" : "e.g. '50 Litres milk'" },
      medical: { title: isHi ? "दवाइयां जोड़ें" : "Add Medicines", sub: isHi ? "पहली दवा बोलकर जोड़ें" : "Add first medicine by voice", instr: isHi ? "जैसे: '100 पैरासिटामोल टैबलेट'" : "e.g. '100 Paracetamol tablets'" },
      salon: { title: isHi ? "प्रोडक्ट्स जोड़ें" : "Add Products", sub: isHi ? "पहला सामान बोलकर जोड़ें" : "Add first product by voice", instr: isHi ? "जैसे: '5 बोतल शैम्पू'" : "e.g. '5 bottles shampoo'" },
      kirana: { title: isHi ? "स्टॉक जोड़ें" : "Add Stock", sub: isHi ? "पहला सामान बोलकर जोड़ें" : "Add your first item by voice", instr: isHi ? "जैसे: '10 किलो चावल है'" : "e.g. '10kg Rice'" },
      other: { title: isHi ? "स्टॉक जोड़ें" : "Add Stock", sub: isHi ? "पहला सामान बोलकर जोड़ें" : "Add first item by voice", instr: isHi ? "जैसे: '100 पीस माल है'" : "e.g. '100 units stock'" }
    };
    return config[biz] || config['kirana'];
  };

  const isHi = language === 'hi-IN';
  const currentSavedItem = step === 3 ? formData.firstStock : formData.firstSale;

  return (
    <div className="fixed inset-0 bg-[#0D2240] z-[100] flex flex-col p-6 overflow-y-auto">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center space-y-8 py-12">

        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tight">{isHi ? "दुकान की जानकारी" : "Shop Details"}</h1>
              <p className="text-white/60 font-medium">{isHi ? "अपने व्यापार की शुरुआत करें" : "Let's start your digital journey"}</p>
            </div>
            <Card className="bg-white/5 border-white/10 rounded-[32px]">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">{isHi ? "दुकान का नाम" : "Shop Name"}</Label>
                  <Input
                    value={formData.shopName}
                    onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                    placeholder="e.g. Rahul General Store"
                    className="h-16 rounded-2xl bg-white/5 border-white/10 text-white text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">{isHi ? "आपका WhatsApp नंबर" : "Your WhatsApp Number"}</Label>
                  <Input
                    value={formData.ownerPhone}
                    onChange={e => setFormData({ ...formData, ownerPhone: e.target.value })}
                    placeholder="91XXXXXXXXXX"
                    type="tel"
                    className="h-16 rounded-2xl bg-white/5 border-white/10 text-white text-lg"
                  />
                </div>
                <Button
                  disabled={!formData.shopName}
                  onClick={() => setStep(2)}
                  className="w-full h-16 rounded-2xl bg-[#C45000] text-white font-black text-lg"
                >
                  {isHi ? "अगला" : "Next"} <ArrowRight className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tight">{isHi ? "व्यापार का प्रकार" : "Business Type"}</h1>
              <p className="text-white/60 font-medium">{isHi ? "एक विकल्प चुनें" : "Select your category"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => { setFormData({ ...formData, businessType: type.id }); setStep(3); }}
                  className="flex flex-col items-center justify-center p-6 rounded-[32px] border bg-white/5 border-white/10 transition-all active:scale-95 hover:bg-white/10"
                >
                  <span className="text-4xl mb-3">{type.emoji}</span>
                  <span className="text-[11px] font-black text-white uppercase text-center leading-tight">
                    {language === 'hi-IN' ? type.hi : type.en}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {(step === 3 || step === 4) && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {step === 3 ? getStep3Strings().title : (isHi ? "पहली बिक्री" : "First Sale")}
              </h1>
              <p className="text-white/60 font-medium">
                {step === 3 ? getStep3Strings().sub : (isHi ? "बोलकर पहली बिक्री दर्ज करें" : "Record your first sale by voice")}
              </p>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <button
                onClick={startListening}
                className={cn(
                  "h-32 w-32 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90",
                  isListening ? "bg-red-500 animate-pulse" : "bg-[#C45000]"
                )}
              >
                {currentSavedItem ? <CheckCircle2 className="text-white" size={48} /> : <Mic className="text-white" size={48} />}
              </button>

              {isListening && (
                <p className="text-[#38BDF8] font-black text-sm animate-pulse text-center px-4">
                  "{transcript || "..."}"
                </p>
              )}

              <p className="text-white/40 text-sm italic text-center px-4">
                {step === 3 ? getStep3Strings().instr : (isHi ? "जैसे: '2 किलो चावल बेचा 100 रुपये में'" : "e.g. 'Sold 2kg Rice for 100 rupees'")}
              </p>

              <div className="w-full flex gap-2">
                <Input
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && manualInput.trim()) saveItem(manualInput); }}
                  placeholder={isHi ? "यहाँ लिखें (वैकल्पिक)" : "Type here (Optional)"}
                  className="h-14 rounded-2xl bg-white/5 border-white/10 text-white flex-1"
                />
                <Button
                  onClick={() => saveItem(manualInput)}
                  disabled={!manualInput.trim()}
                  className="h-14 bg-[#38BDF8] text-[#0D2240] font-black px-5 rounded-2xl"
                >
                  {isHi ? "सहेजें" : "Save"}
                </Button>
              </div>

              {micError && (
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase justify-center">
                  <AlertCircle size={14} /> {isHi ? "माइक की अनुमति चाहिए" : "Mic permission needed"}
                </div>
              )}

              {currentSavedItem && (
                <div className="w-full bg-emerald-500/10 border border-emerald-500/40 p-5 rounded-[24px] flex items-center justify-between animate-in zoom-in-95">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl">
                      {step === 3 ? (currentSavedItem.emoji || "📦") : "🛒"}
                    </div>
                    <div>
                      <p className="text-emerald-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={10} /> {isHi ? "सुरक्षित किया गया" : "Saved"}
                      </p>
                      <h4 className="text-lg font-black text-white">
                        {step === 3 ? currentSavedItem.name : currentSavedItem.productName}
                      </h4>
                      <p className="text-white/40 text-sm">
                        {step === 3
                          ? `${currentSavedItem.qty} ${currentSavedItem.unit}`
                          : `₹${currentSavedItem.price} • ${currentSavedItem.quantity || 1} ${isHi ? "पीस" : "units"}`}
                      </p>
                    </div>
                  </div>
                  <CheckCircle2 className="text-emerald-500" size={28} />
                </div>
              )}

              <Button
                onClick={handleNext}
                className="w-full h-16 rounded-2xl bg-[#38BDF8] text-[#0D2240] font-black text-lg shadow-xl"
              >
                {isHi ? "अगला" : "Next"} <ArrowRight className="ml-2" />
              </Button>

              <button
                onClick={handleNext}
                className="text-white/30 text-sm font-bold flex items-center gap-1 hover:text-white/60 transition-colors"
              >
                <SkipForward size={14} /> {isHi ? "अभी छोड़ें — बाद में जोड़ें" : "Skip for now"}
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 animate-in zoom-in-95 text-center flex flex-col items-center">
            <div className="h-32 w-32 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl">
              <CheckCircle2 size={64} className="text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-white tracking-tight">{isHi ? "बधाई हो! 🎉" : "Congratulations! 🎉"}</h1>
              <p className="text-white/60 font-medium">{isHi ? "आपका सेटअप पूरा हो गया है" : "Your setup is complete"}</p>
              <p className="text-white/40 text-sm">{formData.shopName}</p>
            </div>
            <Button
              onClick={finishSetup}
              className="w-full h-20 rounded-[32px] bg-[#C45000] text-white font-black text-xl shadow-2xl"
            >
              {isHi ? "शुरू करें 🚀" : "Get Started 🚀"}
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
