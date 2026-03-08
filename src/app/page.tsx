"use client";

import { useState, useEffect } from "react";
import PinLock from "@/components/PinLock";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"owner" | "helper" | null>(null);
  const [language, setLanguage] = useState<"hi-IN" | "en-IN">("hi-IN");

  useEffect(() => {
    const savedLang = localStorage.getItem("dukaansaathi_lang") as "hi-IN" | "en-IN";
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const handleAuth = (role: "owner" | "helper") => {
    setUserRole(role);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUserRole(null);
  };

  const handleLanguageChange = (lang: "hi-IN" | "en-IN") => {
    setLanguage(lang);
    localStorage.setItem("dukaansaathi_lang", lang);
  };

  if (!authenticated) {
    return (
      <PinLock 
        onAuth={handleAuth} 
        language={language} 
        onLanguageChange={handleLanguageChange} 
      />
    );
  }

  return (
    <Dashboard 
      role={userRole!} 
      language={language} 
      onLogout={handleLogout} 
    />
  );
}
