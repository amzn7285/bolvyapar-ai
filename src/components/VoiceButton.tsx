
"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Loader2, AlertCircle } from "lucide-react";
import { processVoiceSaleTransaction } from "@/ai/flows/process-voice-sale-transaction";
import { cn } from "@/lib/utils";

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
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setBrowserSupported(false);
        return;
      }

      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        processQuery(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  const speak = (text: string) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!browserSupported || isListening || isProcessing) return;

    // IMPORTANT: Warm up the speech synthesis engine on user interaction.
    // This "unlocks" audio for the delayed AI response.
    const warmup = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(warmup);

    setIsListening(true);
    speak(language === 'hi-IN' ? "बोलिए" : "Go ahead");
    
    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
      setIsListening(false);
    }
  };

  const processQuery = async (query: string) => {
    setIsProcessing(true);
    try {
      const result = await processVoiceSaleTransaction({
        userQuery: query,
        languageCode: language,
        privateMode: privateMode
      });

      if (result) {
        // Auto-play the confirmation response
        speak(result.spokenResponse);
        onTransactionSuccess(result.transactionDetails);
        onLessonGenerated(result.lessonText);
      }
    } catch (err) {
      console.error("Transaction processing error:", err);
      speak(language === 'hi-IN' ? "माफ कीजिये, समझ नहीं आया।" : "Sorry, I didn't catch that.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!browserSupported) {
    return (
      <div className="bg-destructive/20 p-4 rounded-2xl flex items-center gap-3 border border-destructive/30">
        <AlertCircle className="text-destructive" size={24} />
        <p className="text-xs font-bold text-destructive uppercase">
          {language === 'hi-IN' ? 'आपका ब्राउज़र वॉयस सपोर्ट नहीं करता' : 'Voice not supported in this browser'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={startListening}
        disabled={isProcessing}
        className={cn(
          "w-32 h-32 rounded-full flex items-center justify-center shadow-[0_20px_70px_-15px_rgba(196,80,0,0.6)] transition-all active:scale-90 relative overflow-hidden",
          isProcessing ? "bg-muted cursor-wait" : "bg-primary",
          isListening && "voice-pulse ring-[12px] ring-primary/30"
        )}
      >
        {isProcessing ? (
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        ) : (
          <Mic className="w-12 h-12 text-white" />
        )}
        
        {isListening && (
          <span className="absolute inset-0 bg-white/20 animate-ping rounded-full pointer-events-none" />
        )}
      </button>
      <p className="text-sm font-bold text-muted-foreground uppercase tracking-tighter opacity-60">
        {isListening ? (language === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening...') : (language === 'hi-IN' ? 'टैप करके बोलें' : 'Tap to speak')}
      </p>
    </div>
  );
}
