import React, { useState, useEffect } from "react";
import { 
  Home, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Download, 
  Sparkles, 
  Bell, 
  Menu, 
  X, 
  Wifi, 
  Flame, 
  LogOut,
  Moon,
  Sun,
  Laptop,
  Compass,
  Globe
} from "lucide-react";
import { AppState, Subscription } from "./types";
import Dashboard from "./components/Dashboard";
import Courses from "./components/Courses";
import Teachers from "./components/Teachers";
import ChatForum from "./components/ChatForum";
import Resources from "./components/Resources";
import AITutor from "./components/AITutor";
import Pratique from "./components/Pratique";
import { useLanguage } from "./lib/LanguageContext";


export default function App() {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [state, setState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Custom toast notification states
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  // Fetch initial database state on load
  useEffect(() => {
    fetchInitialState();
  }, []);

  const fetchInitialState = async () => {
    try {
      const res = await fetch("/api/state");
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (err) {
      console.error("Error fetching initial state:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToastMessage = (message: string, type: "success" | "info" | "warning" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Subscribe operation
  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    try {
      const res = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      if (res.ok) {
        const data = await res.json();
        if (state) {
          setState({
            ...state,
            subscription: data.subscription,
            notifications: data.notifications
          });
        }
        showToastMessage(`🎉 Félicitations ! Vous êtes désormais membre Qalam Premium !`, "success");
      }
    } catch (err) {
      console.error(err);
      showToastMessage("Une erreur s'est produite lors de la validation de l'abonnement.", "warning");
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const res = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: null })
      });
      if (res.ok) {
        const data = await res.json();
        if (state) {
          setState({
            ...state,
            subscription: data.subscription,
            notifications: data.notifications
          });
        }
        showToastMessage("Abonnement Premium résilié. Vous êtes repassé en formule gratuite.", "info");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 2. Complete Lesson operation
  const handleCompleteLesson = async (lessonId: string) => {
    try {
      const res = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId })
      });
      if (res.ok) {
        const data = await res.json();
        if (state) {
          setState({
            ...state,
            progress: data.progress,
            notifications: data.notifications
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Book a Teacher slot operation
  const handleBookTeacher = async (teacherId: string, slot: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, slot })
      });
      if (res.ok) {
        const data = await res.json();
        if (state) {
          setState({
            ...state,
            bookings: data.bookings,
            notifications: data.notifications
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. Ask a teacher a question
  const handleAskQuestion = async (teacherId: string, content: string) => {
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId, content })
      });
      if (res.ok) {
        const data = await res.json();
        if (state) {
          setState({
            ...state,
            questions: data.questions,
            notifications: data.notifications
          });
        }
        showToastMessage("La question a été posée avec succès au professeur !", "success");
      }
    } catch (err) {
      console.error(err);
      showToastMessage("Une erreur s'est produite lors de l'envoi.", "warning");
    }
  };

  // 5. General student Chat messages
  const handlePostChatMessage = async (text: string) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const data = await res.json();
        if (state) {
          setState({
            ...state,
            chatMessages: data.chatMessages
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Collaborative Project forum messages/posts
  const handlePostForumPost = async (
    projectId: string | null, 
    title?: string, 
    description?: string, 
    category?: string, 
    content?: string
  ) => {
    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title, description, category, content })
      });
      if (res.ok) {
        const data = await res.json();
        if (state) {
          setState({
            ...state,
            forumProjects: data.forumProjects,
            notifications: data.notifications
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Read all notifications
  const handleReadAllNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (state) {
          setState({
            ...state,
            notifications: data.notifications
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !state) {
    return (
      <div id="loading-screen" className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-slate-700">
            {language === "ar" ? "جاري تحميل أكاديمية القلم..." : language === "en" ? "Loading Qalam Academy..." : "Chargement de Qalam Academy..."}
          </span>
          <span className="text-xs text-slate-400">
            {language === "ar" ? "تهيئة بيئة تعلم اللغة العربية والعلوم الشرعية" : language === "en" ? "Initializing your Arabic learning environment" : "Initialisation de votre environnement d'apprentissage d'arabe"}
          </span>
        </div>
      </div>
    );
  }

  // Navigation tabs helper
  const tabs = [
    { id: "dashboard", label: t("nav.dashboard"), icon: Home },
    { id: "courses", label: t("nav.courses"), icon: BookOpen },
    { id: "teachers", label: t("nav.teachers"), icon: Users },
    { id: "pratique", label: t("nav.pratique"), icon: Compass },
    { id: "chat", label: t("nav.chat"), icon: MessageSquare },
    { id: "resources", label: t("nav.resources"), icon: Download },
    { id: "tutor", label: t("nav.tutor"), icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Toast Notification overlay inside application */}
      {toast && (
        <div id="app-toast" className={`fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-3 max-w-sm p-4 rounded-2xl shadow-xl transition-all duration-300 transform translate-y-0 border animate-bounce ${
          toast.type === "success" 
            ? "bg-emerald-900 text-emerald-100 border-emerald-700" 
            : toast.type === "warning" 
              ? "bg-amber-900 text-amber-100 border-amber-700"
              : "bg-slate-900 text-slate-100 border-slate-700"
        }`}>
          <div className="text-sm font-medium leading-relaxed">{toast.message}</div>
          <button 
            onClick={() => setToast(null)}
            className="text-[10px] uppercase font-bold tracking-widest text-white/50 hover:text-white cursor-pointer"
          >
            {language === "ar" ? "إغلاق" : language === "en" ? "Close" : "Fermer"}
          </button>
        </div>
      )}

      {/* Primary Top Header bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl font-bold flex items-center justify-center">
              <span>ق</span>
            </div>
            <div>
              <div className="font-extrabold text-slate-800 tracking-tight text-lg flex items-center gap-1.5">
                <span>{t("brand.title")}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-100">
                  العربية
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium">{t("brand.subtitle")}</span>
            </div>
          </div>

          {/* Center Info/Status info */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{t("status.streak")} : <strong>{state.progress.streakDays} {t("status.streak_days")}</strong></span>
            </div>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
              <span>{t("status.points")} : <strong>{state.progress.points} pts</strong></span>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            
            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 border border-slate-200/50 rounded-xl p-0.5 gap-0.5">
              {(["fr", "en", "ar"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    showToastMessage(
                      lang === "ar" 
                        ? "تم تغيير اللغة إلى العربية" 
                        : lang === "en" 
                          ? "Language switched to English" 
                          : "Langue changée en Français", 
                      "success"
                    );
                  }}
                  className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg uppercase transition-all cursor-pointer ${
                    language === lang
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Quick checkout status indicator */}
            <div className="hidden md:flex items-center gap-2">
              {state.subscription.status === "premium" ? (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1">
                  <span>{t("status.premium_member")}</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    showToastMessage(t("status.toast_premium_info"), "info");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t("status.subscribe_premium")}
                </button>
              )}
            </div>

            {/* Notifications panel shortcut */}
            <button 
              onClick={() => {
                handleReadAllNotifications();
                setActiveTab("dashboard");
                showToastMessage(t("status.toast_notifications_read"), "success");
              }}
              title="Notifications"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl relative transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {state.notifications.some(n => !n.read) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl md:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Left Side Navigation Sidebar (Desktop only) */}
        <aside className="hidden md:block w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-1 shadow-xs">
            {tabs.map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? "bg-emerald-600 text-white shadow-xs" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Student Profile Quick card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs text-center space-y-3">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face" 
              alt="Student Avatar" 
              className="w-12 h-12 rounded-full mx-auto object-cover border border-slate-100"
            />
            <div>
              <div className="font-bold text-slate-800 text-xs">Amina El-Fihri</div>
              <span className="text-[10px] text-slate-400 font-medium">{t("student.level")}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded-xl text-slate-600 border border-slate-100/50">
              <div>
                <span className="block font-bold text-slate-800">{state.progress.completedLessons.length}</span>
                <span>{t("student.lessons")}</span>
              </div>
              <div>
                <span className="block font-bold text-slate-800">{state.progress.streakDays}{language === "ar" ? "ي" : "j"}</span>
                <span>{t("student.attendance")}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content View Routing Area */}
        <main className="flex-1 min-w-0">
          {activeTab === "dashboard" && (
            <Dashboard 
              state={state} 
              onSubscribe={handleSubscribe} 
              onCancelSubscription={handleCancelSubscription}
              setActiveTab={setActiveTab}
              onShowToast={showToastMessage}
            />
          )}

          {activeTab === "courses" && (
            <Courses 
              state={state} 
              onCompleteLesson={handleCompleteLesson} 
              onShowToast={showToastMessage}
            />
          )}

          {activeTab === "teachers" && (
            <Teachers 
              state={state} 
              onBookTeacher={handleBookTeacher} 
              onAskQuestion={handleAskQuestion} 
              onShowToast={showToastMessage}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "chat" && (
            <ChatForum 
              state={state} 
              onPostChatMessage={handlePostChatMessage} 
              onPostForumPost={handlePostForumPost} 
              onShowToast={showToastMessage}
            />
          )}

          {activeTab === "resources" && (
            <Resources 
              state={state} 
              onShowToast={showToastMessage}
            />
          )}

          {activeTab === "tutor" && (
            <AITutor 
              state={state} 
              onShowToast={showToastMessage}
            />
          )}

          {activeTab === "pratique" && (
            <Pratique 
              onShowToast={showToastMessage}
            />
          )}
        </main>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 md:hidden flex justify-end">
          <div className="bg-white w-64 h-full p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-800 text-sm">{t("nav.mobile.title")}</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {tabs.map((tab) => {
                  const IconComp = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? "bg-emerald-600 text-white" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick responsive bottom block */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center text-[11px] text-slate-500">
              <p>{t("brand.title")} Mobile</p>
              <p className="font-semibold text-emerald-600 mt-1">{t("nav.mobile.footer")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation for convenient mobile experience */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 md:hidden z-30 px-3 py-1 flex justify-around items-center h-16 shadow-lg">
        {tabs.slice(0, 5).map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
                isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <IconComp className="w-5 h-5" />
              <span className="text-[8px] font-bold mt-1 tracking-tight">{tab.label.split(" ")[0]}</span>
            </button>
          );
        })}
        {/* Mobile quick shortcut to AI Tutor */}
        <button
          onClick={() => setActiveTab("tutor")}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${
            activeTab === "tutor" ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Sparkles className="w-5 h-5 fill-current" />
          <span className="text-[8px] font-bold mt-1 tracking-tight">{language === "ar" ? "المعلم" : language === "en" ? "AI Tutor" : "IA Tutor"}</span>
        </button>
      </nav>

      {/* Footer containing credentials guidelines & offline status warning */}
      <footer className="bg-white border-t border-slate-100 py-6 mb-16 md:mb-0 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <p className="font-semibold">{t("footer.rights")}</p>
            <p className="mt-0.5">{t("footer.desc")}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t("footer.sync")}</span>
            </span>
            <div className="h-3 w-px bg-slate-200"></div>
            <span>{t("footer.partner")}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
