import React, { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  BrainCircuit, 
  BookOpen, 
  Languages, 
  RotateCcw,
  User,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { AppState } from "../types";
import { useLanguage } from "../lib/LanguageContext";

interface AITutorProps {
  state: AppState;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

interface Message {
  role: "user" | "model";
  content: string;
}

export default function AITutor({ state, onShowToast }: AITutorProps) {
  const { language, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message dynamically on mount and whenever language changes if conversation is empty
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "model",
          content: language === "ar"
            ? "السلام عليكم! أنا **معلم القلم الافتراضي**.\n\nأنا متخصص في تعليم اللغة العربية الفصحى، وقواعد التجويد، والدراسات الإسلامية. كيف يمكنني مساعدتك اليوم؟ يمكنك أن تطرح علي أسئلة في النحو والصرف، أو تطلب ترجمات، أو تسأل عن معاني الكلمات!"
            : language === "en"
              ? "Assalamou alaykoum! I am your **Qalam Virtual AI Tutor**.\n\nI specialize in classical Arabic language, Tajweed rules, and Islamic studies. How can I help you today? You can ask me grammar questions, request translations, or practice vocabulary!"
              : "Assalamou alaykoum ! Je suis votre **Tuteur Virtuel Qalam**.\n\nJe suis spécialisé en langue arabe littéraire, règles de Tajwid et études islamiques. Comment puis-je vous aider aujourd'hui ? Vous pouvez me poser des questions de grammaire, me demander des traductions ou me faire tester votre prononciation !"
        }
      ]);
    }
  }, [language]);

  const presetPrompts = language === "ar" ? [
    { title: "نطق حرف العين (ع)", prompt: "كيف أنطق حرف العين بشكل صحيح؟ وضح لي مخرج الحرف مع بعض التدريبات." },
    { title: "أحكام التجويد: النون الساكنة", prompt: "اشرح لي قواعد النون الساكنة والتنوين الأربعة بطريقة مبسطة مع الأمثلة." },
    { title: "قواعد اللغة العربية للمبتدئين", prompt: "ما هي أقسام الكلام في اللغة العربية؟ وضح ذلك مع الأمثلة." },
    { title: "مفردات: العائلة بالعربية", prompt: "أريد قائمة بـ ١٠ كلمات تخص العائلة في اللغة العربية مع التشكيل والترجمة." }
  ] : language === "en" ? [
    { title: "Pronouncing the letter Ayn (ع)", prompt: "How do I pronounce the letter Ayn (ع) correctly in Arabic? Give me its point of articulation (makhraj) and exercises." },
    { title: "Tajweed Rules: Noon Sakinah", prompt: "Explain the 4 rules of Noon Sakinah and Tanween in a very simple way with clear examples." },
    { title: "Beginner Grammar Lessons", prompt: "What are the three parts of speech (Al-Kalam) in classical Arabic grammar? Provide examples." },
    { title: "Vocabulary: Family in Arabic", prompt: "Give me a list of 10 vocabulary words for family members in Arabic, with vowels and translation." }
  ] : [
    { title: "Prononciation de la lettre ع (Ayn)", prompt: "Comment bien prononcer la lettre Ayn (ع) en arabe ? Donne-moi l'emplacement d'articulation (makhraj) et des exercices." },
    { title: "Règles du Tajwid : Noun Sakinah", prompt: "Explique-moi de manière très simple les 4 règles du Noun Sakinah et Tanwin avec des exemples clairs." },
    { title: "Leçons de grammaire débutante", prompt: "Quelles sont les trois parties d'une phrase (Al-Kalam) en grammaire arabe classique ? Donne-moi des exemples." },
    { title: "Vocabulaire : La famille en arabe", prompt: "Donne-moi une liste de 10 mots de vocabulaire de la famille en arabe, avec la transcription phonétique et les voyelles." }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userMsg: Message = { role: "user", content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "model", content: data.answer }]);
    } catch (err) {
      console.error(err);
      onShowToast(t("tutor.toast_error"), "warning");
      setMessages(prev => [...prev, {
        role: "model",
        content: language === "ar"
          ? "السلام عليكم. أواجه عطلاً فنيًا مؤقتًا في إنشاء الإجابة. يرجى التحقق من مفتاح Gemini في الإعدادات وإعادة المحاولة."
          : language === "en"
            ? "Assalamou alaykoum. I am experiencing a temporary technical difficulty generating my response. Please check that your Gemini API key is correctly configured in Secrets, or try again shortly."
            : "Assalamou alaykoum. Je rencontre une difficulté technique temporaire pour générer ma réponse. Veuillez vérifier que la clé API Gemini est correctement configurée dans l'onglet des secrets, ou réessayez dans quelques instants."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: "model",
        content: language === "ar"
          ? "السلام عليكم! تم إعادة تعيين سجل المحادثة مع معلم القلم. ماذا تحب أن تتعلم أو تراجع اليوم؟"
          : language === "en"
            ? "Assalamou alaykoum! Your chat history with Qalam AI Tutor has been reset. What would you like to review or learn today?"
            : "Assalamou alaykoum ! Votre fil de discussion avec le Tuteur IA Qalam a été réinitialisé. Que souhaitez-vous réviser ou apprendre aujourd'hui ?"
      }
    ]);
    onShowToast(t("tutor.toast_reset"), "info");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold mb-1">
            <BrainCircuit className="w-5 h-5 text-emerald-600 animate-pulse" />
            <span className="text-sm">{t("tutor.academic_title")}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{t("tutor.title")}</h1>
          <p className="text-sm text-slate-500">{t("tutor.subtitle")}</p>
        </div>

        <button 
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-100 transition-colors self-start cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t("tutor.reset")}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Chat window panel */}
        <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[520px]">
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span className="text-xs font-bold text-slate-700">{t("tutor.model_name")}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
              <ShieldCheck className="w-3 h-3" /> {t("tutor.connected")}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => {
              const isAi = msg.role === "model";
              return (
                <div 
                  key={idx} 
                  className={`flex gap-3 max-w-[85%] ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  <div className={`p-2.5 rounded-full shrink-0 w-8 h-8 flex items-center justify-center text-xs font-bold ${
                    isAi ? "bg-emerald-600 text-white" : "bg-slate-800 text-white"
                  }`}>
                    {isAi ? <Sparkles className="w-4 h-4 fill-white" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className={`p-4 rounded-2xl text-xs leading-relaxed space-y-2 border ${
                    isAi 
                      ? "bg-slate-50/50 border-slate-100 text-slate-800" 
                      : "bg-emerald-600 text-white border-emerald-500"
                  }`}>
                    <p className="whitespace-pre-wrap font-sans">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto">
                <div className="p-2.5 rounded-full shrink-0 w-8 h-8 flex items-center justify-center bg-emerald-600 text-white">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce delay-150"></span>
                  </div>
                  <span>{t("tutor.generating")}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form container */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputMessage); }}
              className="flex gap-2"
            >
              <input 
                type="text" 
                placeholder={t("tutor.placeholder")} 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Suggestion Prompts sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>{t("tutor.frequent_subjects")}</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">{t("tutor.frequent_desc")}</p>
            
            <div className="space-y-2">
              {presetPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(p.prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl border border-slate-50 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all text-xs text-slate-700 font-medium flex items-center justify-between group disabled:opacity-50 cursor-pointer"
                >
                  <span className="group-hover:text-emerald-700">{p.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-yellow-300 font-bold uppercase tracking-wider">
              <Languages className="w-4 h-4" />
              <span>{t("tutor.multilingual_badge")}</span>
            </div>
            <p className="text-xs text-emerald-200 leading-relaxed">
              {t("tutor.multilingual_desc")}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
