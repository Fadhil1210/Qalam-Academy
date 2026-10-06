import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Download, 
  FileText, 
  Video, 
  HelpCircle, 
  Lock, 
  Check, 
  Smartphone, 
  Wifi, 
  Award,
  ChevronRight
} from "lucide-react";
import { AppState, Course, Lesson } from "../types";
import { useLanguage } from "../lib/LanguageContext";

interface CoursesProps {
  state: AppState;
  onCompleteLesson: (lessonId: string) => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export default function Courses({ state, onCompleteLesson, onShowToast }: CoursesProps) {
  const { courses, subscription, progress } = state;
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<"all" | "arabe" | "islam" | "hadith" | "fiqh" | "dogme">("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [offlineLessons, setOfflineLessons] = useState<string[]>([]);
  
  // Quiz Simulation State
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Load offline lessons state from local storage just as a fallback
  useEffect(() => {
    const saved = localStorage.getItem("qalam_offline_lessons");
    if (saved) {
      try {
        setOfflineLessons(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const toggleOfflineDownload = (lessonId: string, title: string) => {
    let updated: string[];
    if (offlineLessons.includes(lessonId)) {
      updated = offlineLessons.filter(id => id !== lessonId);
      onShowToast(
        language === "ar" 
          ? `تمت إزالة الدرس "${title}" من وضع غير المتصل.` 
          : language === "en" 
            ? `Lesson "${title}" removed from offline mode.` 
            : `Leçon "${title}" retirée du mode hors-ligne.`, 
        "info"
      );
    } else {
      updated = [...offlineLessons, lessonId];
      onShowToast(
        language === "ar"
          ? `📥 تم تحميل الدرس "${title}" بنجاح للوضع غير المتصل بالإنترنت!`
          : language === "en"
            ? `📥 Lesson "${title}" downloaded successfully for offline mode!`
            : `📥 Leçon "${title}" téléchargée avec succès pour le mode hors-ligne !`,
        "success"
      );
    }
    setOfflineLessons(updated);
    localStorage.setItem("qalam_offline_lessons", JSON.stringify(updated));
  };

  const handleCompleteLesson = (lesson: Lesson) => {
    onCompleteLesson(lesson.id);
    onShowToast(
      language === "ar"
        ? `تم التحقق من الدرس "${lesson.title}"! +٢٥ نقطة قلم`
        : language === "en"
          ? `Lesson "${lesson.title}" completed! +25 Qalam points`
          : `Leçon "${lesson.title}" validée ! +25 points Qalam`,
      "success"
    );
    setQuizSubmitted(false);
    setQuizAnswer(null);
  };

  const handleQuizSubmit = (correct: boolean) => {
    setQuizSubmitted(true);
    if (correct) {
      onShowToast(
        language === "ar"
          ? "🎉 إجابة رائعة! لقد فهمت المفهوم بالشكل الصحيح."
          : language === "en"
            ? "🎉 Excellent answer! You have understood the concept correctly."
            : "🎉 Excellente réponse ! Vous avez compris le concept.",
        "success"
      );
    } else {
      onShowToast(
        language === "ar"
          ? "❌ الإجابة غير دقيقة. حاول مرة أخرى أو اقرأ الشرح."
          : language === "en"
            ? "❌ That is not quite correct. Try again or read the explanation."
            : "❌ Ce n'est pas tout à fait ça. Essayez à nouveau ou lisez l'explication.",
        "warning"
      );
    }
  };

  const filteredCourses = selectedCategory === "all" 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

  const isPremium = subscription.status === "premium";

  const getTranslatedTitle = (course: Course) => {
    if (language === "ar") {
      if (course.id.includes("arabe")) return "اللغة العربية الفصحى للمبتدئين";
      if (course.id.includes("sirah")) return "السيرة النبوية العطرة للأطفال";
      if (course.id.includes("fiqh")) return "مبادئ الفقه على المذاهب الأربعة";
      if (course.id.includes("hadith")) return "شرح الأربعين النووية الشريفة";
      if (course.id.includes("aqidah")) return "عقيدة التوحيد وأركان الإيمان";
    } else if (language === "en") {
      if (course.id.includes("arabe")) return "Classical Arabic for Beginners";
      if (course.id.includes("sirah")) return "Prophetic Biography (Sirah) for Children";
      if (course.id.includes("fiqh")) return "Foundations of Fiqh (Islamic Jurisprudence)";
      if (course.id.includes("hadith")) return "Study of Al-Nawawi's 40 Hadiths";
      if (course.id.includes("aqidah")) return "Islamic Aqidah (Creed & Dogma)";
    }
    return course.title;
  };

  const getTranslatedDesc = (course: Course) => {
    if (language === "ar") {
      if (course.id.includes("arabe")) return "تعلم الأبجدية، النطق السليم، وأساسيات النحو والصرف لتتحدث العربية بطلاقة.";
      if (course.id.includes("sirah")) return "قصص شيقة وعبر ملهمة من حياة رسول الله محمد صلى الله عليه وسلم مناسبة للناشئة.";
      if (course.id.includes("fiqh")) return "فهم قواعد الطهارة، الصلاة، والعبادات اليومية وفق المذاهب الفقهية الأربعة المعتمدة.";
      if (course.id.includes("hadith")) return "حفظ وفهم الأحاديث النبوية الجامعة مع تفسير معانيها ومضامينها التربوية والعملية.";
      if (course.id.includes("aqidah")) return "شرح مفصل لأركان الإيمان الستة ومسائل العقيدة الإسلامية الصحيحة بأسلوب ميسر.";
    } else if (language === "en") {
      if (course.id.includes("arabe")) return "Learn the alphabet, proper articulation, and essential grammar to read and speak classical Arabic confidently.";
      if (course.id.includes("sirah")) return "Inspiring stories and deep life lessons from the blessed life of Prophet Muhammad (PBUH) tailored for kids and youths.";
      if (course.id.includes("fiqh")) return "Understand rules of purification, prayers, and daily worship according to the four recognized schools of jurisprudence.";
      if (course.id.includes("hadith")) return "Memorize and comprehend the core prophetic narrations of Imam Al-Nawawi with their practical applications.";
      if (course.id.includes("aqidah")) return "A simplified and step-by-step exploration of the six pillars of faith and orthodox Islamic theology.";
    }
    return course.description;
  };

  const getTranslatedDuration = (dur: string) => {
    if (language === "ar") {
      return dur.replace("heures", "ساعة").replace("leçons", "دروس").replace(" h", " س");
    } else if (language === "en") {
      return dur.replace("heures", "hours").replace("leçons", "lessons").replace(" h", " hrs");
    }
    return dur;
  };

  const getTranslatedLevel = (lvl: string) => {
    if (language === "ar") {
      return lvl.replace("Débutant", "مبتدئ").replace("Intermédiaire", "متوسط").replace("Enfants", "أطفال");
    } else if (language === "en") {
      return lvl.replace("Débutant", "Beginner").replace("Intermédiaire", "Intermediate").replace("Enfants", "Children");
    }
    return lvl;
  };

  const getTranslatedLessonTitle = (title: string) => {
    if (language === "ar") {
      if (title.includes("Lettres de l'alphabet")) return "الحروف الأبجدية ومخارج الأصوات";
      if (title.includes("Voyelles courtes")) return "الحركات القصيرة والسكون";
      if (title.includes("Quiz de validation")) return "اختبار تقييمي شامل";
      if (title.includes("Naissance du Prophète")) return "مولد ونشأة النبي صلى الله عليه وسلم";
      if (title.includes("L'exil à Médine")) return "الهجرة النبوية المباركة إلى المدينة المنورة";
      if (title.includes("Les règles des ablutions")) return "أحكام الطهارة والوضوء الصحيح";
      if (title.includes("Les piliers de la prière")) return "أركان الصلاة وشروط صحتها";
      if (title.includes("Hadith 1 : L'intention")) return "الحديث الأول: إنما الأعمال بالنيات";
      if (title.includes("Hadith 2 : Les piliers")) return "الحديث الثاني: مراتب الدين (الإسلام والإيمان)";
      if (title.includes("Les 6 piliers de la Foi")) return "أركان الإيمان الستة بالتفصيل";
      if (title.includes("L'unicité divine")) return "توحيد الألوهية والربوبية والأسماء والصفات";
    } else if (language === "en") {
      if (title.includes("Lettres de l'alphabet")) return "Alphabet Letters & Articulation";
      if (title.includes("Voyelles courtes")) return "Short Vowels & Sukoon";
      if (title.includes("Quiz de validation")) return "Validation Evaluation Quiz";
      if (title.includes("Naissance du Prophète")) return "Birth & Early Life of the Prophet (PBUH)";
      if (title.includes("L'exil à Médine")) return "The Hijrah Migration to Madinah";
      if (title.includes("Les règles des ablutions")) return "Rules of Wudu (Ablutions) and Cleansing";
      if (title.includes("Les piliers de la prière")) return "Pillars of Salah (Daily Prayers)";
      if (title.includes("Hadith 1 : L'intention")) return "Hadith 1: Actions are by Intentions";
      if (title.includes("Hadith 2 : Les piliers")) return "Hadith 2: Pillars of Religion (Hadith Jibreel)";
      if (title.includes("Les 6 piliers de la Foi")) return "The Six Pillars of Faith Explained";
      if (title.includes("L'unicité divine")) return "The Oneness of Allah (Tawheed)";
    }
    return title;
  };

  return (
    <div className="space-y-6 text-start">
      {/* Top Controls & Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {language === "ar" ? "المناهج والبرامج الدراسية" : language === "en" ? "Learning Curriculums" : "Parcours d'Apprentissage"}
          </h1>
          <p className="text-sm text-slate-500">
            {language === "ar" 
              ? "ادرس اللغة العربية الفصحى والعلوم الشرعية بطريقة ميسرة ومستويات متدرجة."
              : language === "en"
                ? "Study classical Arabic and Islamic curriculums at your own comfortable pace."
                : "Étudiez l'arabe littéraire et les piliers de l'islam à votre rythme."}
          </p>
        </div>
        
        {/* Offline Status Indicator */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start text-xs font-medium">
          <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="text-slate-600">
            {language === "ar" ? "وضع الاتصال بالإنترنت نشط" : language === "en" ? "Online Connection Active" : "Mode Connecté Actif"}
          </span>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-1.5">
        {(["all", "arabe", "islam", "hadith", "fiqh", "dogme"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setSelectedCourse(null);
              setActiveLesson(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-100 hover:bg-slate-50"
            }`}
          >
            {cat === "all" ? (language === "ar" ? "الكل" : language === "en" ? "All" : "Tous") 
             : cat === "arabe" ? (language === "ar" ? "العربية" : language === "en" ? "Arabic" : "Arabe") 
             : cat === "islam" ? (language === "ar" ? "السيرة والقرآن" : language === "en" ? "Sirah & Quran" : "Sîrah & Coran") 
             : cat === "hadith" ? (language === "ar" ? "الحديث الشريف" : language === "en" ? "Hadiths" : "Hadiths")
             : cat === "fiqh" ? (language === "ar" ? "الفقه" : language === "en" ? "Fiqh" : "Fiqh")
             : (language === "ar" ? "العقيدة والتوحيد" : language === "en" ? "Creed (Aqidah)" : "Dogme (Aqîdah)")}
          </button>
        ))}
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column: Courses / Lessons Details */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedCourse ? (
            /* Courses List */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => {
                const getCategoryStyleAndLabel = (cat: string) => {
                  switch (cat) {
                    case "arabe":
                      return { style: "bg-amber-50 text-amber-700", label: language === "ar" ? "اللغة العربية" : language === "en" ? "Arabic Language" : "Langue Arabe" };
                    case "hadith":
                      return { style: "bg-purple-50 text-purple-700", label: language === "ar" ? "الحديث الشريف" : language === "en" ? "Hadith" : "Hadith" };
                    case "fiqh":
                      return { style: "bg-blue-50 text-blue-700", label: language === "ar" ? "الفقه الإسلامي" : language === "en" ? "Fiqh (Jurisprudence)" : "Fiqh (Jurisprudence)" };
                    case "dogme":
                      return { style: "bg-rose-50 text-rose-700", label: language === "ar" ? "العقيدة الإسلامية" : language === "en" ? "Islamic Creed" : "Dogme (Aqîdah)" };
                    default:
                      return { style: "bg-emerald-50 text-emerald-700", label: language === "ar" ? "العلوم الإسلامية" : language === "en" ? "Islamic Studies" : "Sciences Islamiques" };
                  }
                };
                const catInfo = getCategoryStyleAndLabel(course.category);
                return (
                  <div 
                    key={course.id} 
                    className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md hover:border-emerald-100 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md ${catInfo.style}`}>
                          {catInfo.label}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{getTranslatedLevel(course.level)}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base mb-2 leading-snug">{getTranslatedTitle(course)}</h3>
                      <p className="text-xs text-slate-500 line-clamp-3 mb-4">{getTranslatedDesc(course)}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">{getTranslatedDuration(course.duration)}</span>
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                      >
                        {language === "ar" ? "عرض المنهج" : language === "en" ? "View Syllabus" : "Voir le programme"} <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Course Detail Page */
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
              <button 
                onClick={() => {
                  setSelectedCourse(null);
                  setActiveLesson(null);
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                {language === "ar" ? "← العودة إلى قائمة المناهج" : language === "en" ? "← Back to course list" : "← Retour à la liste des cours"}
              </button>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">
                    {selectedCourse.category === "arabe" ? (language === "ar" ? "اللغة العربية" : language === "en" ? "Arabic Language" : "Langue Arabe") 
                     : selectedCourse.category === "hadith" ? (language === "ar" ? "الحديث الشريف" : language === "en" ? "Hadith Studies" : "Hadith")
                     : selectedCourse.category === "fiqh" ? (language === "ar" ? "الفقه الإسلامي" : language === "en" ? "Islamic Jurisprudence" : "Fiqh (Jurisprudence)")
                     : selectedCourse.category === "dogme" ? (language === "ar" ? "العقيدة والتوحيد" : language === "en" ? "Islamic Dogma" : "Dogme (Aqîdah)")
                     : (language === "ar" ? "العلوم الإسلامية" : language === "en" ? "Islamic Sciences" : "Sciences Islamiques")}
                  </span>
                  <h2 className="text-xl font-bold text-slate-800 mt-2">{getTranslatedTitle(selectedCourse)}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {getTranslatedDuration(selectedCourse.duration)} • {language === "ar" ? "مستوى" : "Level"} {getTranslatedLevel(selectedCourse.level)}
                  </p>
                </div>
              </div>

              {/* Course Lessons List */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-700 text-sm">
                  {language === "ar" ? "الدروس المتوفرة في هذه الباقة" : language === "en" ? "Lessons in this introduction block" : "Leçons du module d'introduction"}
                </h3>
                {selectedCourse.lessons.map((lesson, idx) => {
                  const isCompleted = progress.completedLessons.includes(lesson.id);
                  const isUnlocked = isPremium || idx === 0; // First lesson is free
                  const isDownloaded = offlineLessons.includes(lesson.id);

                  return (
                    <div 
                      key={lesson.id}
                      className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        activeLesson?.id === lesson.id
                          ? "border-emerald-500 bg-emerald-50/20"
                          : "border-slate-100 bg-slate-50/40 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${
                          isCompleted 
                            ? "bg-emerald-100 text-emerald-700" 
                            : isUnlocked 
                              ? "bg-slate-200 text-slate-600" 
                              : "bg-slate-100 text-slate-400"
                        }`}>
                          {lesson.type === "video" ? (
                            <Video className="w-4 h-4" />
                          ) : lesson.type === "quiz" ? (
                            <HelpCircle className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700 text-sm">
                              {language === "ar" ? "الدرس" : "Lesson"} {idx + 1} : {getTranslatedLessonTitle(lesson.title)}
                            </span>
                            {isCompleted && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> {language === "ar" ? "مكتمل" : language === "en" ? "Completed" : "Complétée"}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {getTranslatedDuration(lesson.duration)} • {lesson.type === "video" ? (language === "ar" ? "فيديو" : "Video") : lesson.type === "quiz" ? (language === "ar" ? "اختبار" : "Quiz") : (language === "ar" ? "كتابي" : "Text")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Offline download toggle */}
                        {isUnlocked && (
                          <button
                            onClick={() => toggleOfflineDownload(lesson.id, getTranslatedLessonTitle(lesson.title))}
                            title={isDownloaded ? "Disponible hors-ligne" : "Télécharger pour accès hors-ligne"}
                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                              isDownloaded 
                                ? "bg-teal-50 border-teal-200 text-teal-600" 
                                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            <Download className={`w-3.5 h-3.5 ${isDownloaded ? "animate-bounce" : ""}`} />
                          </button>
                        )}

                        {/* Lock overlay for free tier on locked courses */}
                        {isUnlocked ? (
                          <button
                            onClick={() => {
                              setActiveLesson(lesson);
                              setQuizSubmitted(false);
                              setQuizAnswer(null);
                            }}
                            className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            {language === "ar" ? "دراسة" : language === "en" ? "Study" : "Étudier"}
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-medium">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Premium</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Interactive Lesson Viewer */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            <h2 className="text-md font-bold text-slate-800 mb-4">
              {language === "ar" ? "قارئ الدروس التفاعلي" : language === "en" ? "Interactive Lesson Player" : "Lecteur Interactif"}
            </h2>
            
            {activeLesson ? (
              <div className="space-y-4">
                <div className="bg-slate-900 rounded-xl aspect-video relative overflow-hidden flex flex-col justify-between p-4 text-white">
                  {/* Status tags */}
                  <div className="flex justify-between items-center">
                    <span className="bg-emerald-600/90 text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                      {activeLesson.type}
                    </span>
                    {offlineLessons.includes(activeLesson.id) && (
                      <span className="bg-teal-600/95 text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        <Smartphone className="w-3 h-3" /> {language === "ar" ? "متاح بدون إنترنت" : language === "en" ? "Offline mode active" : "Mode Hors-ligne disponible"}
                      </span>
                    )}
                  </div>

                  {/* Play Button or Quiz visual depending on Type */}
                  {activeLesson.type === "video" ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                      <span className="text-[11px] text-slate-400 mt-2">
                        {language === "ar" ? "معلم معتمد من الأزهر الشريف مباشر" : language === "en" ? "Certified Qalam teacher streaming live" : "Professeur Qalam Academy en direct d'Égypte"}
                      </span>
                    </div>
                  ) : activeLesson.type === "interactive" ? (
                    <div className="py-4 text-center">
                      <div className="text-xl font-bold font-mono text-emerald-300 mb-1">كِتَابٌ (Kitâb)</div>
                      <span className="text-xs text-slate-300 italic">
                        {language === "ar" ? "المعنى: كتاب ورقي" : language === "en" ? "Meaning: A Book" : "Signification : Un livre"}
                      </span>
                    </div>
                  ) : (
                    <div className="py-4 text-center">
                      <div className="text-sm text-yellow-300 font-semibold">
                        {language === "ar" ? "اختبار مراجعة سريع" : language === "en" ? "Quick Revision Quiz" : "Quiz de révision"}
                      </div>
                      <span className="text-xs text-slate-400">
                        {language === "ar" ? "أجب عن السؤال التالي لتخطي الدرس" : language === "en" ? "Answer the question below" : "Répondez à la question ci-dessous"}
                      </span>
                    </div>
                  )}

                  {/* Duration progress */}
                  <div className="space-y-1">
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-1/3"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>02:15</span>
                      <span>{getTranslatedDuration(activeLesson.duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Lesson Title and explanation */}
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{getTranslatedLessonTitle(activeLesson.title)}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {activeLesson.type === "video" && (
                      language === "ar" 
                        ? "يقدم هذا الدرس المرئي القواعد الأساسية الهامة. شاهد الفيديو كاملاً ثم انقر على تأكيد الدرس للحصول على النقاط."
                        : language === "en"
                          ? "This video lesson presents the fundamental basics. Watch the full video then click complete lesson to gain your reward points."
                          : "Cette leçon vidéo présente les bases indispensables. Regardez la vidéo en entier puis cliquez sur valider la leçon pour accumuler vos points."
                    )}
                    {activeLesson.type === "interactive" && (
                      language === "ar"
                        ? "تمرين الحفظ البصري والسمعي. كرر الكلمة بصوت مرتفع للتدرب على نطق الحروف من مخارجها السليمة."
                        : language === "en"
                          ? "Visual memorization exercise. Repeat the word out loud to practice proper articulation (Makhraj)."
                          : "Exercice de mémorisation visuelle. Répétez le mot à haute voix pour travailler la prononciation correcte (Makhraj)."
                    )}
                    {activeLesson.type === "quiz" && (
                      language === "ar"
                        ? "يرجى اختبار معلوماتك لتأكيد إتمام هذا المنهج بنجاح."
                        : language === "en"
                          ? "Please test your knowledge to validate this learning module successfully."
                          : "Veuillez tester vos connaissances pour valider ce module d'apprentissage."
                    )}
                  </p>
                </div>

                {/* Quiz panel widget if type is quiz */}
                {activeLesson.type === "quiz" && (
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-3 text-xs">
                    <div className="font-semibold text-slate-700">
                      {language === "ar" 
                        ? "سؤال: ما هو الحرف الذي يخرج من مخرج طرف اللسان مع أطراف الثنايا العليا؟"
                        : language === "en"
                          ? "Question: Which letter is produced with the tip of the tongue touching the upper front teeth?"
                          : "Question : Quelle est la lettre qui se prononce avec la pointe de la langue touchant les dents du haut ?"}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => { setQuizAnswer("a"); setQuizSubmitted(false); }}
                        className={`p-2 rounded-lg border text-left cursor-pointer ${quizAnswer === "a" ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold" : "bg-white border-slate-100"}`}
                      >
                        {language === "ar" ? "أ. حرف الباء (ب)" : language === "en" ? "A. Ba (ب)" : "A. Ba (ب)"}
                      </button>
                      <button 
                        onClick={() => { setQuizAnswer("b"); setQuizSubmitted(false); }}
                        className={`p-2 rounded-lg border text-left cursor-pointer ${quizAnswer === "b" ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold" : "bg-white border-slate-100"}`}
                      >
                        {language === "ar" ? "ب. حرف التاء (ت)" : language === "en" ? "B. Ta (ت)" : "B. Ta (ت)"}
                      </button>
                    </div>
                    
                    {!quizSubmitted ? (
                      <button 
                        onClick={() => handleQuizSubmit(quizAnswer === "b")}
                        disabled={!quizAnswer}
                        className="w-full bg-slate-800 text-white font-semibold py-2 rounded-lg disabled:opacity-50 text-xs cursor-pointer"
                      >
                        {language === "ar" ? "إرسال الإجابة" : language === "en" ? "Submit Answer" : "Soumettre la réponse"}
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-lg text-xs font-medium space-y-1 bg-emerald-50 text-emerald-800 border border-emerald-100">
                        <span className="font-bold">✓ {language === "ar" ? "توضيح وشرح ميسر :" : language === "en" ? "Explanation:" : "Explication :"}</span>
                        <p>
                          {language === "ar"
                            ? "مخرج حرف التاء (ت) يكون من طرف اللسان مع أصول الثنايا العليا."
                            : language === "en"
                              ? "The letter Ta (ت) is produced by placing the tip of the tongue at the base of the upper front teeth."
                              : "La lettre Ta (ت) est produite en plaçant la pointe de la langue sur la base des incisives supérieures."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Complete / Validate button */}
                <button
                  onClick={() => handleCompleteLesson(activeLesson)}
                  className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition-colors text-xs cursor-pointer"
                >
                  {language === "ar" ? "تأكيد وإتمام هذا الدرس (+٢٥ نقطة)" : language === "en" ? "Complete this lesson (+25 pts)" : "Valider et terminer cette leçon (+25 pts)"}
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-600" />
                <p className="text-xs">
                  {language === "ar" 
                    ? "اختر درسًا من قائمة المناهج لتشغيله في هذا المربع التفاعلي."
                    : language === "en"
                      ? "Select a lesson from a course syllabus to launch the interactive player."
                      : "Sélectionnez une leçon dans un programme d'étude pour lancer le lecteur interactif."}
                </p>
              </div>
            )}
          </div>

          {/* Premium call to action in sidebar */}
          {!isPremium && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 space-y-3 text-start">
              <div className="flex gap-2 text-amber-800 font-bold text-sm items-center">
                <Lock className="w-4 h-4" />
                <span>{language === "ar" ? "ترقية لحساب القلم الممتاز" : language === "en" ? "Unlock Qalam Premium" : "Débloquer Qalam Premium"}</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                {language === "ar"
                  ? "أكثر من ٧٠٪ من دروس النحو والصرف، التجويد، التفسير وحلقات التحفيظ الجماعية مخصصة للمشتركين فقط."
                  : language === "en"
                    ? "Over 70% of our premium classical grammar, Tajweed rules, and live study groups are reserved for Premium members."
                    : "Plus de 70% de nos cours de grammaire, Tajwid, Tafsir et de mémorisation en groupe sont réservés aux abonnés Premium."}
              </p>
              <button 
                onClick={() => {
                  const el = document.getElementById("welcome-banner");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                  onShowToast(language === "ar" ? "اختر باقة الاشتراك المناسبة لك بالأسفل." : "Choisissez un plan d'abonnement ci-dessous.", "info");
                }}
                className="w-full bg-amber-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-amber-700 transition-colors cursor-pointer"
              >
                {language === "ar" ? "عرض الاشتراكات المتوفرة" : language === "en" ? "View Subscription Plans" : "Voir les abonnements"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
