"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, ShoppingBag, Bell, MessageCircle, CheckCircle2, Package, Sparkles, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isSameDay, parseISO } from "date-fns";

interface ReportTabProps {
  role: "owner" | "helper";
  privateMode: boolean;
  language: "hi-IN" | "en-IN";
  sales: any[];
  expenses: any[];
  profile: any;
  reminders?: any[];
  onUpdateReminders?: (updated: any[]) => void;
}

export default function ReportTab({ language, privateMode, sales, expenses, profile, reminders = [], onUpdateReminders }: ReportTabProps) {
  const [revealProfit, setRevealProfit] = useState(false);
  const { toast } = useToast();
  const isHi = language === 'hi-IN';

  const today = new Date().toDateString();
  const todaySales = sales.filter(s => new Date(s.timestamp).toDateString() === today);
  const todayExpenses = expenses.filter(e => new Date(e.timestamp).toDateString() === today);

  const totalRevenue = todaySales.reduce((acc, s) => acc + (s.amount || 0), 0);
  const totalExp = todayExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const netProfit = totalRevenue - totalExp;

  const topItems = useMemo(() => {
    const itemMap: Record<string, { name: string, count: number, revenue: number }> = {};
    sales.forEach(s => {
      const name = s.item || (isHi ? 'अज्ञात सामान' : 'Unknown Item');
      if (!itemMap[name]) itemMap[name] = { name, count: 0, revenue: 0 };
      itemMap[name].count += 1;
      itemMap[name].revenue += s.amount || 0;
    });
    return Object.values(itemMap).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [sales, isHi]);

  const todaysReminders = reminders.filter(r => {
    try { return isSameDay(parseISO(r.date), new Date()); }
    catch { return false; }
  });

  const handleReminderWhatsApp = (reminder: any) => {
    const shopName = profile?.shopName || "BolVyaapar Shop";
    const msg = isHi
      ? `नमस्ते ${reminder.customerName}, ${shopName} से रिमाइंडर: ${reminder.message}. धन्यवाद!`
      : `Hi ${reminder.customerName}, reminder from ${shopName}: ${reminder.message}. Thanks!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDeleteReminder = (id: number) => {
    if (onUpdateReminders) {
      onUpdateReminders(reminders.filter(r => r.id !== id));
      toast({ title: isHi ? "हटा दिया गया" : "Removed" });
    }
  };

  const texts = {
    "hi-IN": {
      title: "रिपोर्ट",
      todaySales: "आज की बिक्री",
      profit: "आज का मुनाफा",
      totalSales: "कुल बिक्री (अब तक)",
      topSelling: "सबसे ज़्यादा बिकने वाला सामान",
      reminders: "आज के रिमाइंडर",
      noReminders: "आज कोई रिमाइंडर नहीं",
      noSales: "अभी कोई बिक्री नहीं हुई है",
      noSalesSub: "बिक्री दर्ज करने के लिए 'बोलिए' बटन का उपयोग करें",
      reveal: "देखें",
      hide: "छिपाएं",
      txns: "लेनदेन",
      timesSold: "बार बेचा",
      task: "मेरा काम"
    },
    "en-IN": {
      title: "Report",
      todaySales: "Today's Sales",
      profit: "Net Profit",
      totalSales: "Total Sales (All Time)",
      topSelling: "Top Selling Items",
      reminders: "Today's Reminders",
      noReminders: "No reminders for today",
      noSales: "No sales recorded yet",
      noSalesSub: "Use the 'Boliye' button to record your first sale",
      reveal: "Reveal",
      hide: "Hide",
      txns: "transactions",
      timesSold: "times sold",
      task: "Owner Task"
    }
  }[language];

  return (
    <div className="space-y-6 pb-48">
      <h2 className="text-2xl font-black text-[#0D2240] tracking-tight px-1">
        {texts.title}
      </h2>

      {/* Today's Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-[#0D2240] border-none rounded-[32px] shadow-xl overflow-hidden relative">
          <TrendingUp size={60} className="absolute -right-4 -bottom-4 text-white/5 rotate-12" />
          <CardContent className="p-6">
            <TrendingUp size={20} className="text-[#38BDF8] mb-3" />
            <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">
              {texts.todaySales}
            </p>
            <p className={cn("text-2xl font-black text-white", privateMode && "blur-md")}>
              ₹{totalRevenue.toLocaleString()}
            </p>
            <p className="text-white/40 text-[10px] font-bold mt-1 uppercase tracking-tight">
              {todaySales.length} {texts.txns}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-slate-100 rounded-[32px] shadow-sm overflow-hidden relative">
          <ShoppingBag size={60} className="absolute -right-4 -bottom-4 text-slate-50 rotate-12" />
          <CardContent className="p-6">
            <ShoppingBag size={20} className="text-[#C45000] mb-3" />
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">
              {texts.profit}
            </p>
            {revealProfit ? (
              <p className={cn("text-2xl font-black", netProfit >= 0 ? "text-emerald-600" : "text-red-600", privateMode && "blur-md")}>
                ₹{netProfit.toLocaleString()}
              </p>
            ) : (
              <p className="text-2xl font-black text-slate-200">₹•••</p>
            )}
            <button
              onClick={() => setRevealProfit(!revealProfit)}
              className="text-[9px] font-black uppercase text-[#C45000] mt-1 hover:underline"
            >
              {revealProfit ? texts.hide : texts.reveal}
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Total Sales Count Card */}
      <Card className="rounded-[32px] border-slate-100 bg-white shadow-sm overflow-hidden border-l-8 border-l-[#38BDF8]">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {texts.totalSales}
            </p>
            <p className="text-4xl font-black text-[#0D2240] mt-1">{sales.length}</p>
          </div>
          <div className="h-16 w-16 rounded-[24px] bg-[#38BDF8]/10 flex items-center justify-center">
            <Package size={32} className="text-[#38BDF8]" />
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Items */}
      {sales.length > 0 && topItems.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sparkles size={18} className="text-[#FFB300]" />
            <h3 className="text-lg font-black text-[#0D2240] uppercase tracking-tight">
              {texts.topSelling}
            </h3>
          </div>
          <div className="space-y-3">
            {topItems.map((item, idx) => (
              <Card key={idx} className="rounded-[24px] border-slate-100 bg-white shadow-sm overflow-hidden active:scale-[0.98] transition-all">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-[18px] flex items-center justify-center font-black text-lg",
                      idx === 0 ? "bg-[#FFB300] text-white" : "bg-slate-50 text-slate-300"
                    )}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-black text-[#0D2240] text-lg">{item.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                        {item.count} {texts.timesSold}
                      </p>
                    </div>
                  </div>
                  {item.revenue > 0 && (
                    <div className="text-right">
                      <p className={cn("text-xl font-black text-emerald-600", privateMode && "blur-md")}>
                        ₹{item.revenue.toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[40px] p-12 text-center flex flex-col items-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
            <BarChart3 size={40} className="text-slate-300" />
          </div>
          <div>
            <p className="text-[#0D2240] font-black text-xl">{texts.noSales}</p>
            <p className="text-slate-400 font-bold text-sm mt-1">{texts.noSalesSub}</p>
          </div>
        </div>
      )}

      {/* Reminders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#C45000]" />
            <h3 className="text-lg font-black text-[#0D2240] uppercase tracking-tight">
              {texts.reminders}
            </h3>
          </div>
        </div>

        {todaysReminders.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-[24px] p-6 text-center shadow-sm">
            <p className="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em]">
              {texts.noReminders}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysReminders.map((r) => (
              <Card key={r.id} className="rounded-[24px] border-slate-100 bg-white shadow-sm overflow-hidden">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-[18px] bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <Bell size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-[#0D2240] text-sm truncate">{r.customerName || texts.task}</p>
                      <p className="text-xs text-slate-400 font-medium truncate italic">"{r.message}"</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {r.customerName && (
                      <button onClick={() => handleReminderWhatsApp(r)} className="h-12 w-12 rounded-[16px] bg-emerald-50 text-emerald-600 flex items-center justify-center active:scale-90 transition-all border border-emerald-100">
                        <MessageCircle size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDeleteReminder(r.id)} className="h-12 w-12 rounded-[16px] bg-slate-50 text-slate-400 flex items-center justify-center active:scale-90 transition-all border border-slate-100">
                      <CheckCircle2 size={18} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
