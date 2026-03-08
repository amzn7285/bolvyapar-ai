"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Home, BookOpen, BarChart3, Lock, Users, Eye, EyeOff, Volume2, X } from "lucide-react";
import DukaanTab from "./tabs/DukaanTab";
import SeekhaTab from "./tabs/SeekhaTab";
import ReportTab from "./tabs/ReportTab";
import CustomerView from "./CustomerView";
import VoiceButton from "./VoiceButton";

interface DashboardProps {
  role: "owner" | "helper";
  language: "hi-IN" | "en-IN";
  onLogout: () => void;
}

const SNOOZE_KEY = "dukaansaathi_lesson_snooze";
const SNOOZE_DURATION = 3600000; // 1 hour

export default function Dashboard({ role, language, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("dukaan");
  const [privateMode, setPrivateMode] = useState(false);
  const [showCustomerView, setShowCustomerView] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [showLessonCard, setShowLessonCard] = useState(false);

  const handleTransaction = (details: any) => {
    setLastTransaction(details);
  };

  const handleLessonGenerated = (lesson: string) => {
    const snoozeTime = localStorage.getItem(SNOOZE_KEY);
    if (snoozeTime && Date.now() - parseInt(snoozeTime) < SNOOZE_DURATION) {
      return;
    }

    setCurrentLesson(lesson);
    setTimeout(() => {
      setShowLessonCard(true);
    }, 3000);
  };

  const handleDismissLesson = () => {
    localStorage.setItem(SNOOZE_KEY, Date.now().toString());
    setShowLessonCard(false);
  };

  const speakLesson = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  if (showCustomerView) {
    return <CustomerView transaction={lastTransaction} onBack={() => setShowCustomerView(false)} language={language} />;
  }

  const texts = {
    "hi-IN": {
      dukaan: "दुकान",
      seekha: "सीखा",
      report: "रिपोर्ट",
      newLesson: "नया सबक",
      listen: "सुनो",
      later: "बाद में",
      privateModeOn: "प्राइवेट मोड चालू"
    },
    "en-IN": {
      dukaan: "Dukaan",
      seekha: "Seekha",
      report: "Report",
      newLesson: "NEW LESSON",
      listen: "Listen",
      later: "Later",
      privateModeOn: "Private Mode ON"
    }
  }[language];

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Header */}
      <header className="bg-[#0D2240] px-4 py-2 flex items-center justify-between shadow-lg z-20 h-16 shrink-0">
        <div className="flex items-center gap-1">
          <span className="text-xl font-black text-white">दुकान साथी 🇮🇳</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setPrivateMode(!privateMode);
              if (!privateMode) setShowLessonCard(false);
            }}
            className={`h-10 w-10 flex items-center justify-center rounded-full transition-all ${privateMode ? 'bg-accent text-white' : 'bg-card/50 text-muted-foreground'}`}
          >
            {privateMode ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <button 
            onClick={() => setShowCustomerView(true)}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-card/50 text-muted-foreground"
          >
            <Users size={20} />
          </button>
          <button 
            onClick={onLogout}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-card/50 text-muted-foreground"
          >
            <Lock size={20} />
          </button>
        </div>
      </header>

      {privateMode && (
        <div className="bg-accent/20 border-b border-accent/30 py-1.5 px-4 text-center shrink-0">
          <p className="text-accent-foreground text-[10px] font-bold uppercase tracking-wider">
            {texts.privateModeOn}
          </p>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-40">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="dukaan" className="m-0 p-3 animate-in fade-in slide-in-from-right-4">
            <DukaanTab privateMode={privateMode} language={language} onTransaction={handleTransaction} />
          </TabsContent>
          <TabsContent value="seekha" className="m-0 p-3 animate-in fade-in slide-in-from-right-4">
            <SeekhaTab language={language} />
          </TabsContent>
          <TabsContent value="report" className="m-0 p-3 animate-in fade-in slide-in-from-right-4">
            <ReportTab role={role} privateMode={privateMode} language={language} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Passive Lesson Card */}
      {showLessonCard && !privateMode && !showCustomerView && currentLesson && (
        <div className="fixed bottom-24 left-3 right-3 bg-card border border-primary/20 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-full duration-500 z-[60] flex items-center gap-4">
          <div className="text-4xl select-none">📚</div>
          <div className="flex-1 space-y-2">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              {texts.newLesson}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  speakLesson(currentLesson);
                  setShowLessonCard(false);
                }}
                className="bg-secondary text-white h-10 px-4 rounded-xl flex items-center gap-2 font-bold active:scale-95 transition-all text-sm flex-1 justify-center shadow-md"
              >
                <Volume2 size={16} />
                {texts.listen}
              </button>
              <button 
                onClick={handleDismissLesson}
                className="bg-muted text-muted-foreground h-10 px-4 rounded-xl flex items-center gap-2 font-bold active:scale-95 transition-all text-sm flex-1 justify-center"
              >
                <X size={16} />
                {texts.later}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Button Area */}
      <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <VoiceButton 
            language={language} 
            privateMode={privateMode} 
            onTransactionSuccess={handleTransaction} 
            onLessonGenerated={handleLessonGenerated}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-2 flex justify-between items-center z-40 pb-safe shadow-lg h-16 shrink-0">
        <button 
          onClick={() => setActiveTab("dukaan")}
          className={`flex flex-col items-center gap-0.5 transition-all ${activeTab === 'dukaan' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Home size={24} />
          <span className="text-[10px] font-bold uppercase">{texts.dukaan}</span>
        </button>
        
        <button 
          onClick={() => setActiveTab("seekha")}
          className={`flex flex-col items-center gap-0.5 transition-all ${activeTab === 'seekha' ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <BookOpen size={24} />
          <span className="text-[10px] font-bold uppercase">{texts.seekha}</span>
        </button>

        <button 
          onClick={() => setActiveTab("report")}
          className={`flex flex-col items-center gap-0.5 transition-all ${activeTab === 'report' ? 'text-primary' : 'text-muted-foreground'}`}
          disabled={role === 'helper'}
        >
          <BarChart3 size={24} className={role === 'helper' ? 'opacity-30' : ''} />
          <span className={`text-[10px] font-bold uppercase ${role === 'helper' ? 'opacity-30' : ''}`}>
            {texts.report}
          </span>
        </button>
      </nav>
    </div>
  );
}
