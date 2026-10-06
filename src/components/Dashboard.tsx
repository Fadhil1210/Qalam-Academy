import React, { useState } from "react";
import { 
  BookOpen, 
  Award, 
  Flame, 
  Clock, 
  Calendar, 
  Sparkles, 
  CreditCard, 
  Bell, 
  CheckCircle, 
  Video, 
  ShieldCheck,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { AppState, Booking, Subscription } from "../types";
import { useLanguage } from "../lib/LanguageContext";

interface DashboardProps {
  state: AppState;
  onSubscribe: (plan: "monthly" | "yearly") => void;
  onCancelSubscription: () => void;
  setActiveTab: (tab: string) => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export default function Dashboard({ 
  state, 
  onSubscribe, 
  onCancelSubscription, 
  setActiveTab,
  onShowToast
}: DashboardProps) {
  const { subscription, progress, bookings, notifications } = state;
  const [pushEnabled, setPushEnabled] = useState(false);
  const { language, t, isRtl } = useLanguage();

  const handlePushToggle = () => {
    if (!pushEnabled) {
      setPushEnabled(true);
      onShowToast(
        language === "ar" 
          ? "🔔 تم تفعيل إشعارات التذكير! ستصلك تنبيهات قبل بدء الدروس." 
          : language === "en" 
            ? "🔔 Push notifications enabled! You will receive reminders before your classes." 
            : "🔔 Notifications push activées ! Vous recevrez des rappels avant vos cours.", 
        "success"
      );
      setTimeout(() => {
        onShowToast(
          language === "ar"
            ? "📅 تذكير بالدرس: حصة التجويد مع الشيخ أحمد تبدأ بعد 15 دقيقة!"
            : language === "en"
              ? "📅 Class Reminder: Your Tajweed class with Sheikh Ahmed starts in 15 minutes!"
              : "📅 Rappel de Cours : Votre cours de Tajwid avec Sheikh Ahmed commence dans 15 minutes !",
          "info"
        );
      }, 8000);
    } else {
      setPushEnabled(false);
      onShowToast(
        language === "ar" ? "تم إلغاء تفعيل الإشعارات." : language === "en" ? "Push notifications disabled." : "Notifications push désactivées.",
        "info"
      );
    }
  };

  const handleSubscribeClick = (plan: "monthly" | "yearly") => {
    onSubscribe(plan);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div id="welcome-banner" className="bg-linear-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6">
          <BookOpen className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 bg-white/15 px-3 py-1 rounded-full text-xs font-medium w-fit">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{t("tutor.title")}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("db.welcome")}</h1>
          <p className="text-emerald-100 mb-4">{t("db.subtitle")}</p>
          
          <div className="flex flex-wrap gap-3">
            <button 
              id="start-learning-btn"
              onClick={() => setActiveTab("courses")} 
              className="bg-white text-emerald-800 px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-sm text-sm cursor-pointer"
            >
              {language === "ar" ? "مواصلة دروسي" : language === "en" ? "Continue Learning" : "Continuer mes leçons"}
            </button>
            <button 
              id="book-teacher-btn"
              onClick={() => setActiveTab("teachers")} 
              className="bg-emerald-500/30 text-white border border-white/20 px-5 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition-colors text-sm cursor-pointer"
            >
              {t("db.booking.book_now")}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Metrics Grid */}
      <div id="progress-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 text-orange-500">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t("status.streak")}</div>
            <div className="text-2xl font-bold text-slate-800">{progress.streakDays} {t("status.streak_days")}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t("db.stats.hours")}</div>
            <div className="text-2xl font-bold text-slate-800">{progress.hoursStudied} h</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t("student.lessons")}</div>
            <div className="text-2xl font-bold text-slate-800">{progress.completedLessons.length} {language === "ar" ? "درسًا" : "lessons"}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">{t("status.points")}</div>
            <div className="text-2xl font-bold text-slate-800">{progress.points} pts</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Left - Subscriptions & Course Booking reminders */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Subscription Status Bento */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-800">{t("db.active_subscription")}</h2>
              </div>
              {subscription.status === "premium" ? (
                <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {language === "ar" ? "متميز نشط" : language === "en" ? "Premium Active" : "Premium Actif"}
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-medium">
                  {language === "ar" ? "الباقة المجانية" : language === "en" ? "Free Tier" : "Formule Gratuite"}
                </span>
              )}
            </div>

            {subscription.status === "premium" ? (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {language === "ar" ? "باقة القلم اللامحدودة" : language === "en" ? "Qalam Unlimited Plan" : "Plan Qalam Illimité"} - {subscription.plan === "monthly" ? (language === "ar" ? "شهري" : language === "en" ? "Monthly" : "Mensuel") : (language === "ar" ? "سنوي" : language === "en" ? "Yearly" : "Annuel")}
                    </h3>
                    <p className="text-xs text-slate-500">{t("db.sub_renewal")} : {subscription.expiryDate}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-emerald-600">{subscription.plan === "monthly" ? "13 000 FCFA" : "97 500 FCFA"}</span>
                    <span className="text-xs text-slate-400">/{subscription.plan === "monthly" ? (language === "ar" ? "شهر" : language === "en" ? "mo" : "mois") : (language === "ar" ? "سنة" : language === "en" ? "yr" : "an")}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-600 space-y-1.5 mb-4">
                  <p>✓ {t("db.plan.feature2")}</p>
                  <p>✓ {t("db.plan.feature1")}</p>
                  <p>✓ {t("db.plan.feature3")}</p>
                  <p>✓ {t("db.plan.feature4")}</p>
                </div>
                <button 
                  id="cancel-sub-btn"
                  onClick={onCancelSubscription} 
                  className="text-xs text-red-500 hover:text-red-700 font-medium underline cursor-pointer"
                >
                  {t("db.sub_cancel")}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {t("db.premium_desc")}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-md">{t("db.monthly_plan")}</div>
                      <div className="text-xs text-slate-500 mb-2">{t("db.monthly_desc")}</div>
                      <ul className="text-xs text-slate-600 space-y-1 mb-4">
                        <li>• {t("db.plan.feature2")}</li>
                        <li>• {t("db.plan.feature1")}</li>
                        <li>• {t("db.plan.feature3")}</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-emerald-700 mb-2">13 000 FCFA <span className="text-xs text-slate-400">/{language === "ar" ? "شهر" : language === "en" ? "mo" : "mois"}</span></div>
                      <button 
                        id="monthly-sub-btn"
                        onClick={() => handleSubscribeClick("monthly")} 
                        className="w-full bg-emerald-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        {t("db.subscribe_btn")}
                      </button>
                    </div>
                  </div>

                  <div className="border border-teal-100 rounded-xl p-4 bg-teal-50/20 hover:bg-teal-50/40 transition-colors flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-teal-600 text-white text-[9px] px-2 py-0.5 rounded-bl font-semibold uppercase">
                      {language === "ar" ? "توفير ٣٧٪" : language === "en" ? "-37% Savings" : "-37% Économie"}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-md">{t("db.yearly_plan")}</div>
                      <div className="text-xs text-slate-500 mb-2">{t("db.yearly_desc")}</div>
                      <ul className="text-xs text-slate-600 space-y-1 mb-4">
                        <li>• {language === "ar" ? "كل ميزات الخطة الشهرية" : language === "en" ? "All Monthly features" : "Tous les avantages du Mensuel"}</li>
                        <li>• {language === "ar" ? "شهور مجانية مشمولة" : language === "en" ? "2 Free months included" : "2 mois gratuits inclus"}</li>
                        <li>• {language === "ar" ? "أولوية الدعم الفني" : language === "en" ? "Priority Academic Support" : "Support prioritaire"}</li>
                      </ul>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-teal-700 mb-2">97 500 FCFA <span className="text-xs text-slate-400">/{language === "ar" ? "سنة" : language === "en" ? "yr" : "an"}</span></div>
                      <button 
                        id="yearly-sub-btn"
                        onClick={() => handleSubscribeClick("yearly")} 
                        className="w-full bg-teal-600 text-white py-2 rounded-xl text-xs font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
                      >
                        {t("db.subscribe_btn")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Booked Classes & Live reminders (italki style) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-800">{t("db.recent_bookings")}</h2>
              </div>
              <button 
                id="view-teachers-tab-btn"
                onClick={() => setActiveTab("teachers")} 
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
              >
                + {language === "ar" ? "حجز" : language === "en" ? "Book" : "Réserver"}
              </button>
            </div>

            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{booking.teacherName}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span>📅 {booking.date}</span>
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          <span className="text-emerald-600 font-medium">
                            {language === "ar" ? "مؤكد" : language === "en" ? "Confirmed" : "Confirmé"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <a 
                        href={booking.link} 
                        target="_blank" 
                        rel="noreferrer"
                        onClick={() => onShowToast(language === "ar" ? "جاري تشغيل الفصل المباشر!" : "🎥 Lancement de la visioconférence privée !", "success")}
                        className="flex-1 md:flex-none text-center bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        {t("db.booking.join")}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-sm text-slate-500 mb-3">{t("db.booking.no_bookings")}</p>
                <button 
                  id="book-first-lesson-btn"
                  onClick={() => setActiveTab("teachers")} 
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  {language === "ar" ? "حجز أول درس لي" : language === "en" ? "Book My First Lesson" : "Réserver ma première leçon"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Push Notifications & Community activity */}
        <div className="space-y-6">
          {/* Push Notification Box */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-800">
                {language === "ar" ? "التنبيهات المباشرة" : language === "en" ? "Class Reminders" : "Rappels de cours"}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              {language === "ar" 
                ? "فعل إشعارات التذكير المباشرة لتصلك تنبيهات سريعة على جهازك قبل ١٥ دقيقة من بدء حصتك مع المعلم."
                : language === "en"
                  ? "Enable push notifications to be notified on your device 15 minutes before your private lesson starts."
                  : "Activez les rappels push de Qalam pour être averti instantanément sur votre appareil 15 minutes avant le début de votre cours."}
            </p>
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-xs font-medium text-slate-700">
                {language === "ar" ? "تفعيل الإشعارات" : language === "en" ? "Push Notifications" : "Notifications Push"}
              </span>
              <button 
                id="push-toggle-btn"
                onClick={handlePushToggle}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  pushEnabled ? "bg-emerald-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    pushEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Activity Logs & Notifications Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-md font-bold text-slate-800">{t("db.recent_notifs")}</h2>
              {notifications.some(n => !n.read) && (
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
              )}
            </div>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    notif.read 
                      ? "bg-slate-50/50 border-slate-100 text-slate-600" 
                      : "bg-emerald-50/30 border-emerald-100 text-slate-800 font-medium"
                  }`}
                >
                  <p className="mb-1">
                    {language === "ar" 
                      ? notif.text
                          .replace("Nouveau message sur le projet", "رسالة جديدة في مشروع")
                          .replace("Votre réservation avec", "تم تأكيد حجزك مع")
                          .replace("est confirmée.", "بنجاح.")
                          .replace("Nouveau manuel disponible", "كتاب تعليمي جديد متاح")
                      : language === "en"
                        ? notif.text
                            .replace("Nouveau message sur le projet", "New message on project")
                            .replace("Votre réservation avec", "Your booking with")
                            .replace("est confirmée.", "is confirmed.")
                            .replace("Nouveau manuel disponible", "New study textbook available")
                        : notif.text}
                  </p>
                  <span className="text-[10px] text-slate-400">{notif.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Islamic Quote/Inspiration Bento */}
          <div className="bg-emerald-950 text-emerald-200 p-5 rounded-2xl relative overflow-hidden shadow-xs">
            <div className="absolute top-0 right-0 opacity-10 translate-x-2 -translate-y-2">
              <Sparkles className="w-24 h-24 text-white" />
            </div>
            <p className="text-sm italic font-light mb-3 relative z-10 leading-relaxed">
              {language === "ar" 
                ? "« مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ »"
                : language === "en"
                  ? '"Whoever takes a path upon which he seeks knowledge, Allah will make a path to Paradise easy for him."'
                  : '« Celui qui emprunte un chemin par lequel il recherche une science, Allah lui facilite un chemin vers le Paradis. »'}
            </p>
            <div className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
              {language === "ar" ? "حديث شريف • رواه الترمذي" : language === "en" ? "Hadith • Al-Tirmidhi" : "Hadith • Al-Tirmidhi"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
