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
}

export default function VoiceButton({ language, privateMode, onTransactionSuccess, onLessonGenerated }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textQuery, setTextQuery] = useState("");
  const recognitionRef = useRef<any>(null);
  const audioUnlocked = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setBrowserSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        processQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setShowTextInput(true);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const unlockAudio = () => {
    if (audioUnlocked.current) return;
    const silent = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(silent);
    audioUnlocked.current = true;
  };

  const startListening = () => {
    if (isListening || isProcessing) return;

    if (!browserSupported) {
      setShowTextInput(true);
      return;
    }

    unlockAudio();
    speak(language === "hi-IN" ? "बोलिए" : "Go ahead");
    setIsListening(true);

    try {
      if (recognitionRef.current) {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
      }
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setIsListening(false);
      setShowTextInput(true);
    }
  };

  const processQuery = async (query: string) => {
    if (!query.trim()) return;
    setIsProcessing(true);
    try {
      const systemPrompt = language === "hi-IN"
          ? "You are DukaanSaathi AI. Parse user sold items. Confirm warmly in 1-2 sentences in Hindi. Respond ONLY with valid JSON: {\"reply\": \"...\", \"lesson\": \"...\", \"product\": \"...\"}"
          : "You are DukaanSaathi AI. Parse user sold items. Confirm warmly in 1-2 sentences in English. Respond ONLY with valid JSON: {\"reply\": \"...\", \"lesson\": \"...\", \"product\": \"...\"}";

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: query,
          systemPrompt: systemPrompt,
        }),
      });

      if (!response.ok) throw new Error("API Route Failed");

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
        speak(parsed.reply);
        onTransactionSuccess({ productName: parsed.product || query, amount: 0 });
        if (parsed.lesson) onLessonGenerated(parsed.lesson);
      } catch (e) {
        speak(content);
        onTransactionSuccess({ productName: query, amount: 0 });
      }

      setTextQuery("");
      setShowTextInput(false);
    } catch (err) {
      console.error("Voice AI Error:", err);
      speak(language === "hi-IN" ? "माफ कीजिये, कुछ गड़बड़ हो गई।" : "Sorry, something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processQuery(textQuery);
  };

  if (showTextInput) {
    return (
      <div className="w-full max-w-sm px-4 animate-in slide-in-from-bottom-4">
        <form
          onSubmit={handleTextSubmit}
          className="space-y-3 bg-card/90 backdrop-blur-md p-4 rounded-3xl border border-primary/20 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-primary">
              {language === "hi-IN" ? "लिख कर बताएं" : "Type Command"}
            </h3>
            <button
              type="button"
              onClick={() => setShowTextInput(false)}
              className="p-2 text-muted-foreground"
            >
              <X size={20} />
            </button>
          </div>
          <Input
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            placeholder={language === "hi-IN" ? "५ किलो आटा बेचा..." : "Sold 5kg flour..."}
            className="h-10 text-sm bg-background border-border rounded-xl px-4"
            autoFocus
          />
          <Button
            disabled={isProcessing || !textQuery.trim()}
            className="w-full h-10 text-sm font-bold rounded-xl flex items-center gap-2 bg-primary text-white"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Send size={18} />
                {language === "hi-IN" ? "भेजें" : "Send"}
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-4">
        <button
          onClick={startListening}
          disabled={isProcessing}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 relative overflow-hidden",
            isProcessing ? "bg-muted cursor-wait" : "bg-primary",
            isListening && "voice-pulse ring-4 ring-primary/30"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
          {isListening && (
            <span className="absolute inset-0 bg-white/20 animate-ping rounded-full pointer-events-none" />
          )}
        </button>

        <button
          onClick={() => setShowTextInput(true)}
          className="w-14 h-14 rounded-full bg-card/50 border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors active:scale-90"
        >
          <Keyboard size={24} />
        </button>
      </div>

      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider opacity-60">
        {isListening
          ? language === "hi-IN" ? "सुन रहा हूँ..." : "Listening..."
          : language === "hi-IN" ? "टैप करें" : "Tap"}
      </p>
    </div>
  );
}
