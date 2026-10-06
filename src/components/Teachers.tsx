import React, { useState } from "react";
import { 
  Users, 
  Star, 
  MapPin, 
  Languages, 
  DollarSign, 
  Calendar, 
  MessageSquare, 
  Search, 
  Filter, 
  Sparkles, 
  Check, 
  ArrowRight,
  BrainCircuit,
  Lock,
  ChevronDown
} from "lucide-react";
import { AppState, Teacher, Question } from "../types";

interface TeachersProps {
  state: AppState;
  onBookTeacher: (teacherId: string, slot: string) => void;
  onAskQuestion: (teacherId: string, content: string) => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
  setActiveTab: (tab: string) => void;
}

export default function Teachers({ 
  state, 
  onBookTeacher, 
  onAskQuestion, 
  onShowToast,
  setActiveTab
}: TeachersProps) {
  const { teachers, questions, subscription } = state;
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTeacher, setActiveTeacher] = useState<Teacher | null>(null);
  const [bookingSlot, setBookingSlot] = useState<string>("");
  const [questionContent, setQuestionContent] = useState("");
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const isPremium = subscription.status === "premium";

  // Filtering teachers
  const specialties = ["all", "Tajwid", "Grammaire", "Tafsir", "Enfants"];
  
  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSpecialty = selectedSpecialty === "all" || 
      teacher.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.origin.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSpecialty && matchesSearch;
  });

  const handleBookSlot = (teacherId: string) => {
    if (!bookingSlot) {
      onShowToast("Veuillez sélectionner un créneau disponible.", "warning");
      return;
    }
    setIsSubmittingBooking(true);
    setTimeout(() => {
      onBookTeacher(teacherId, bookingSlot);
      onShowToast(`🎉 Votre réservation avec ${activeTeacher?.name} est validée !`, "success");
      setBookingSlot("");
      setIsSubmittingBooking(false);
      // Automatically redirect to Dashboard to view booked lesson
      setTimeout(() => setActiveTab("dashboard"), 800);
    }, 600);
  };

  const handlePostQuestion = async (teacherId: string) => {
    if (!questionContent.trim()) {
      onShowToast("Veuillez formuler votre question.", "warning");
      return;
    }
    if (!isPremium) {
      onShowToast("🔒 L'espace de questions personnalisées aux professeurs est réservé aux abonnés Premium.", "warning");
      return;
    }

    setIsSubmittingQuestion(true);
    onShowToast("Transmission de votre question au professeur... Réponse en cours de génération !", "info");
    
    try {
      await onAskQuestion(teacherId, questionContent);
      setQuestionContent("");
    } catch (err) {
      onShowToast("Une erreur est survenue lors de l'envoi de la question.", "warning");
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Trouvez votre Enseignant (Style italki)</h1>
          <p className="text-sm text-slate-500">Réservez un cours individuel en direct ou posez une question pointue à l'un de nos professeurs d'arabe et de sciences islamiques.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input 
              type="text" 
              placeholder="Rechercher par nom, pays d'origine, spécialité..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  selectedSpecialty === spec
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
                }`}
              >
                {spec === "all" ? "Toutes spécialités" : spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid containing Teacher Cards & Q&A Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Teachers List Column */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-md font-bold text-slate-700 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Nos professeurs disponibles ({filteredTeachers.length})</span>
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {filteredTeachers.map((teacher) => (
              <div 
                key={teacher.id} 
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col md:flex-row gap-5 ${
                  activeTeacher?.id === teacher.id ? "border-emerald-500" : "border-slate-100 hover:shadow-md"
                }`}
              >
                {/* Avatar and Origin */}
                <div className="flex md:flex-col items-center md:items-start gap-4">
                  <img 
                    src={teacher.avatar} 
                    alt={teacher.name} 
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-100"
                  />
                  <div className="md:mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{teacher.origin}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs mt-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span>{teacher.rating}</span>
                      <span className="text-slate-400">({teacher.reviewsCount})</span>
                    </div>
                  </div>
                </div>

                {/* Content details */}
                <div className="flex-1 space-y-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">{teacher.name}</h3>
                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">{teacher.specialty}</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{teacher.bio}</p>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {teacher.languages.map((lang, idx) => (
                      <span key={idx} className="bg-slate-50 border border-slate-100 text-[10px] text-slate-500 px-2 py-0.5 rounded-md font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pricing / Booking Trigger */}
                <div className="pt-4 md:pt-0 md:pl-4 border-t md:border-t-0 md:border-l border-slate-100 flex md:flex-col justify-between md:justify-center items-center gap-4 min-w-[130px]">
                  <div className="text-center md:text-right">
                    <span className="text-2xl font-black text-slate-800">{teacher.hourlyRate}€</span>
                    <span className="text-xs text-slate-400">/heure</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTeacher(teacher);
                      setBookingSlot("");
                      setQuestionContent("");
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors w-full md:w-auto text-center cursor-pointer"
                  >
                    Choisir / Poser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Teacher Interaction Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
            {activeTeacher ? (
              <div className="space-y-6">
                {/* Teacher Mini Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <img src={activeTeacher.avatar} alt={activeTeacher.name} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <h3 className="font-bold text-slate-800 text-xs">{activeTeacher.name}</h3>
                    <span className="text-[10px] text-slate-400">{activeTeacher.specialty}</span>
                  </div>
                </div>

                {/* Reservation section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Réserver un Cours en Direct</span>
                  </h4>
                  <p className="text-xs text-slate-500">Choisissez un créneau horaire pour un cours particulier en visioconférence privée.</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {activeTeacher.availableSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setBookingSlot(slot)}
                        className={`p-2 rounded-xl border text-[11px] font-medium text-center transition-all cursor-pointer ${
                          bookingSlot === slot
                            ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold"
                            : "bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleBookSlot(activeTeacher.id)}
                    disabled={isSubmittingBooking || !bookingSlot}
                    className="w-full bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingBooking ? "Réservation..." : "Confirmer la réservation"}
                  </button>
                </div>

                {/* Q&A Section */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Poser une Question en Ligne</span>
                  </h4>
                  <p className="text-xs text-slate-500">Posez vos questions de grammaire, récitation coranique ou jurisprudence. Notre IA basée sur Gemini répondra instantanément comme ce professeur !</p>
                  
                  {!isPremium && (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2 text-[10px] text-amber-800">
                      <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        Cette fonctionnalité requiert l'abonnement Premium. Vos professeurs personnalisent leurs réponses grâce à notre tuteur IA avancé.
                      </span>
                    </div>
                  )}

                  <textarea
                    placeholder={`Ex: "Professeur, quelle est la règle de récitation pour l'allongement de la voix ?"...`}
                    rows={3}
                    value={questionContent}
                    onChange={(e) => setQuestionContent(e.target.value)}
                    disabled={!isPremium}
                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 disabled:opacity-50"
                  />

                  <button
                    onClick={() => handlePostQuestion(activeTeacher.id)}
                    disabled={isSubmittingQuestion || !questionContent.trim() || !isPremium}
                    className="w-full bg-slate-800 text-white font-semibold py-2 rounded-xl text-xs hover:bg-slate-900 transition-colors disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>{isSubmittingQuestion ? "Génération de la réponse..." : "Poser ma question au professeur"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-600" />
                <p className="text-xs font-medium">Sélectionnez un professeur pour afficher son planning de réservation ou lui poser une question en ligne.</p>
              </div>
            )}
          </div>

          {/* Answered Questions Board */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Questions & Réponses publiques</span>
            </h3>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {questions.map((q) => (
                <div key={q.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-700">{q.studentName}</span>
                    <span>{q.date}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">Q : {q.content}</p>
                  
                  {q.answer ? (
                    <div className="pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          RÉPONSE
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700">{q.teacherName}</span>
                      </div>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{q.answer}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 p-1.5 rounded-md">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></div>
                      <span>En attente de réponse...</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
