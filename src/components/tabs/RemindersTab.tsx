"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, Bell, CheckCircle2, MessageCircle, Plus, X, Trash2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";

interface RemindersTabProps {
  language: "hi-IN" | "en-IN";
  reminders: any[];
  onUpdateReminders: (updated: any[]) => void;
  profile: any;
}

export default function RemindersTab({ language, reminders, onUpdateReminders, profile }: RemindersTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualText, setManualText] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [savedItem, setSavedItem] = useState<any>(null);
  const recognitionRef = useRef<any>(null);
  const isHi = language === 'hi-IN';

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = language;
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (e: any) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
      if (e.results[e.results.length - 1].isFinal) saveReminder(text, customerName);
    };
    r.onend = () => setIsListening(false);
    r.onerror = () => setIsListening(false);
    recognitionRef.current = r;
  }, [language, customerName]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language;
    window.speechSynthesis.speak(u);
  };

  const detectDate = (text: string): string => {
    const t = text.toLowerCase();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (/kal|tomorrow|agle din|अगले दिन|कल/.test(t)) return tomorrow.toISOString();
    return new Date().toISOString();
  };

  const saveReminder = (text: string, name: string) => {
    if (!text.trim()) return;
    const reminder = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      date: detectDate(text),
      message: text.trim(),
      customerName: name.trim() || null,
      completed: false,
    };
    const updated = [reminder, ...reminders];
    onUpdateReminders(updated);
    setSavedItem(reminder);
    speak(isHi ? "याद दिलाना सहेज लिया गया" : "Reminder saved");
    setTimeout(() => {
      setSavedItem(null);
      setTranscript("");
      setManualText("");
      setCustomerName("");
      setShowModal(false);
    }, 1500);
  };

  const startListening = () => {
    if (isListening) return;
    setTranscript("");
    setIsListening(true);
    try { recognitionRef.current?.start(); } catch { setIsListening(false); }
  };

  const handleComplete = (id: number) => {
    onUpdateReminders(reminders.filter(r => r.id !== id));
  };

  const handleWhatsApp = (r: any) => {
    const shopName = profile?.shopName || "BolVyaapar";
    const msg = isHi
      ? `नमस्ते ${r.customerName}, ${shopName} से एक रिमाइंडर: ${r.message}. धन्यवाद!`
      : `Hi ${r.customerName}, reminder from ${shopName}: ${r.message}. Thanks!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const todayReminders = reminders.filter(r => {
    try { return isSameDay(new Date(r.date), new Date()); } catch { return true; }
  });
  const otherReminders = reminders.filter(r => {
    try { return !isSameDay(new Date(r.date), new Date()); } catch { return false; }
  });

  const texts = {
    "hi-IN": {
      title: "रिमाइंडर",
      add: "जोड़ें",
      today: "आज के लिए",
      upcoming: "आगे के लिए",
      empty: "कोई रिमाइंडर नहीं — ऊपर जोड़ें बटन दबाएं",
      forWhom: "किसके लिए? (वैकल्पिक)",
      exampleName: "जैसे: रमेश, सप्लायर...",
      sayExample: "जैसे: 'कल पैसे लेने हैं'",
      typeHere: "यहाँ लिखें...",
      saved: "सहेज लिया",
      close: "बंद करें"
    },
    "en-IN": {
      title: "Reminders",
      add: "Add",
      today: "Today",
      upcoming: "Upcoming",
      empty: "No reminders — tap Add above",
      forWhom: "For whom? (Optional)",
      exampleName: "e.g. Ramesh, Supplier...",
      sayExample: "e.g. 'Collect payment tomorrow'",
      typeHere: "Type here...",
      saved: "Saved",
      close: "Close"
    }
  }[language];

  return (
    <div className="space-y-6 pb-48 px-1">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
          {texts.title}
        </h3>
        <button
          onClick={() => { setShowModal(true); setSavedItem(null); setTranscript(""); }}
          className="h-14 px-6 bg-[#C45000] text-white rounded-[24px] flex items-center gap-2 text-sm font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all"
        >
          <Plus size={22} /> {texts.add}
        </button>
      </div>

      {/* Empty state */}
      {reminders.length === 0 && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-16 text-center flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
            <Bell size={48} className="text-slate-300" />
          </div>
          <p className="text-slate-400 font-bold text-lg max-w-[200px]">
            {texts.empty}
          </p>
        </div>
      )}

      {/* Today's reminders */}
      {todayReminders.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-[#C45000] px-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#C45000] animate-pulse" />
            {texts.today}
          </p>
          {todayReminders.map(r => (
            <Card key={r.id} className="rounded-[32px] border-2 border-[#C45000]/20 bg-white shadow-md overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-14 w-14 rounded-[22px] bg-orange-50 text-[#C45000] flex items-center justify-center shrink-0">
                  <Bell size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  {r.customerName && (
                    <p className="font-black text-[#0D2240] text-lg leading-tight mb-0.5">{r.customerName}</p>
                  )}
                  <p className="text-base text-slate-600 leading-tight">"{r.message}"</p>
                  <p className="text-[10px] text-slate-400 font-black mt-1.5 uppercase tracking-widest">
                    {format(new Date(r.timestamp), 'hh:mm a')}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {r.customerName && (
                    <button
                      onClick={() => handleWhatsApp(r)}
                      className="h-14 w-14 rounded-[20px] bg-emerald-50 text-emerald-600 flex items-center justify-center active:scale-90 transition-all border border-emerald-100"
                    >
                      <MessageCircle size={24} />
                    </button>
                  )}
                  <button
                    onClick={() => handleComplete(r.id)}
                    className="h-14 w-14 rounded-[20px] bg-emerald-500 text-white flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 size={24} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upcoming reminders */}
      {otherReminders.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">
            {texts.upcoming}
          </p>
          {otherReminders.map(r => (
            <Card key={r.id} className="rounded-[32px] border-slate-100 bg-white shadow-sm overflow-hidden">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="h-14 w-14 rounded-[22px] bg-slate-50 text-slate-300 flex items-center justify-center shrink-0">
                  <Bell size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  {r.customerName && (
                    <p className="font-black text-slate-800 text-lg leading-tight mb-0.5">{r.customerName}</p>
                  )}
                  <p className="text-base text-slate-400 leading-tight">"{r.message}"</p>
                  <p className="text-[10px] text-slate-400 font-black mt-1.5 uppercase tracking-widest">
                    {format(new Date(r.date), 'dd MMM')}
                  </p>
                </div>
                <button
                  onClick={() => handleComplete(r.id)}
                  className="h-14 w-14 rounded-[20px] bg-slate-50 text-slate-300 flex items-center justify-center shrink-0 active:scale-90 transition-all"
                >
                  <Trash2 size={24} />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-[#0D2240] w-full max-w-md rounded-[40px] shadow-2xl p-8 pb-12 space-y-8 animate-in slide-in-from-bottom-4 duration-300">

            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white tracking-tight">
                {isHi ? "नया रिमाइंडर" : "New Reminder"}
              </h2>
              <button onClick={() => setShowModal(false)} className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center text-white/40"><X size={28} /></button>
            </div>

            {savedItem ? (
              <div className="bg-emerald-500/10 border-2 border-emerald-500/40 p-10 rounded-[32px] text-center animate-in zoom-in-95">
                <div className="h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
                <p className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em] mb-2">
                  {texts.saved}
                </p>
                <p className="text-white font-black text-2xl leading-tight">"{savedItem.message}"</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Customer Name Input */}
                <div className="space-y-3">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <User size={14} /> {texts.forWhom}
                  </p>
                  <Input
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder={texts.exampleName}
                    className="h-16 rounded-[24px] bg-white/5 border-white/10 text-white text-xl placeholder:text-white/20 px-6 focus:ring-2 focus:ring-[#38BDF8]"
                  />
                </div>

                {/* Mic Section */}
                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={startListening}
                    className={cn(
                      "h-32 w-32 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 border-4",
                      isListening ? "bg-red-500 animate-pulse border-red-400" : "bg-[#C45000] border-white/10"
                    )}
                  >
                    <Mic size={56} className="text-white" />
                  </button>
                  {transcript ? (
                    <div className="bg-white/5 rounded-2xl p-4 w-full">
                      <p className="text-[#38BDF8] font-black text-lg text-center italic">"{transcript}"</p>
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm font-bold text-center italic">
                      {texts.sayExample}
                    </p>
                  )}
                </div>

                {/* Manual Text Fallback */}
                <div className="flex gap-3">
                  <Input
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && manualText.trim()) saveReminder(manualText, customerName); }}
                    placeholder={texts.typeHere}
                    className="h-16 rounded-[24px] bg-white/5 border-white/10 text-white flex-1 text-lg placeholder:text-white/20 px-6"
                  />
                  <button
                    onClick={() => { if (manualText.trim()) saveReminder(manualText, customerName); }}
                    disabled={!manualText.trim()}
                    className="h-16 px-8 bg-[#38BDF8] text-[#0D2240] font-black rounded-[24px] disabled:opacity-20 active:scale-95 transition-all uppercase text-sm tracking-widest"
                  >
                    {texts.add}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
