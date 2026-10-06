import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State
const db = {
  subscription: {
    status: "free", // "free" or "premium"
    plan: null, // null, "monthly", "yearly"
    expiryDate: null,
  },
  progress: {
    streakDays: 3,
    hoursStudied: 12.5,
    completedLessons: [] as string[],
    quizzesPassed: 2,
    points: 150,
  },
  teachers: [
    {
      id: "t1",
      name: "Sheikh Ahmed Al-Mansoor",
      origin: "Égypte (Al-Azhar)",
      specialty: "Coran, Tajwid & Jurisprudence (Fiqh)",
      bio: "Diplômé de l'Université Al-Azhar, Sheikh Ahmed enseigne le Coran et le Tajwid depuis plus de 15 ans aux non-arabophones.",
      rating: 4.9,
      reviewsCount: 142,
      hourlyRate: 15,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      languages: ["Arabe (Maternel)", "Français (B2)", "Anglais (C1)"],
      availableSlots: ["Mon 10:00", "Mon 14:00", "Wed 10:00", "Wed 15:00", "Fri 09:00"],
    },
    {
      id: "t2",
      name: "Ustadha Fatima Zahra",
      origin: "Maroc",
      specialty: "Grammaire (Nahw/Sarf) & Arabe Parlé",
      bio: "Passionnée par la langue arabe littéraire, Fatima utilise des méthodes modernes et interactives pour faciliter l'apprentissage de la grammaire.",
      rating: 4.8,
      reviewsCount: 98,
      hourlyRate: 12,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      languages: ["Arabe (Maternel)", "Français (Maternel)", "Anglais (B2)"],
      availableSlots: ["Tue 09:00", "Tue 11:00", "Thu 14:00", "Thu 16:00", "Sat 10:00"],
    },
    {
      id: "t3",
      name: "Dr. Youssef Tariq",
      origin: "Jordanie",
      specialty: "Tafsir, Hadith & Histoire Islamique",
      bio: "Docteur en sciences islamiques, il transmet la richesse de l'histoire musulmane et l'exégèse coranique avec rigueur académique et clarté.",
      rating: 5.0,
      reviewsCount: 76,
      hourlyRate: 18,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      languages: ["Arabe (Maternel)", "Anglais (Fluent)"],
      availableSlots: ["Wed 18:00", "Wed 20:00", "Sat 14:00", "Sat 16:00", "Sun 10:00"],
    },
    {
      id: "t4",
      name: "Ustadha Sarah El-Amin",
      origin: "Liban",
      specialty: "Arabe pour Enfants & Débutants",
      bio: "Spécialisée en pédagogie infantile, elle propose des cours ludiques avec des histoires, des chants et des jeux linguistiques.",
      rating: 4.9,
      reviewsCount: 115,
      hourlyRate: 11,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      languages: ["Arabe (Maternel)", "Français (Fluent)", "Anglais (B1)"],
      availableSlots: ["Mon 16:00", "Tue 16:00", "Wed 16:00", "Thu 16:00", "Sat 09:00"],
    },
  ],
  courses: [
    {
      id: "c1",
      category: "arabe",
      title: "Lecture & Écriture de l'Arabe (Débutant)",
      description: "Apprenez l'alphabet arabe, l'écriture des lettres selon leur position et la prononciation correcte des voyelles.",
      level: "Débutant",
      duration: "4 modules • 16 leçons",
      lessons: [
        { id: "c1_l1", title: "L'Alphabet Arabe - Les 7 premières lettres", duration: "15 min", type: "video" },
        { id: "c1_l2", title: "Les positions des lettres (Début, Milieu, Fin)", duration: "20 min", type: "interactive" },
        { id: "c1_l3", title: "Les voyelles courtes (Fatha, Damma, Kasra)", duration: "15 min", type: "video" },
        { id: "c1_l4", title: "Atelier pratique d'écriture des premiers mots", duration: "25 min", type: "quiz" },
      ],
    },
    {
      id: "c2",
      category: "arabe",
      title: "Grammaire Arabe : Al-Ajurrumiyya",
      description: "Étude pas-à-pas du texte classique d'initiation à la grammaire arabe (Nahw), parfait pour comprendre les structures de phrases.",
      level: "Intermédiaire",
      duration: "5 modules • 20 leçons",
      lessons: [
        { id: "c2_l1", title: "La définition de la parole (Al-Kalam)", duration: "25 min", type: "video" },
        { id: "c2_l2", title: "Les trois parties du discours (Nom, Verbe, Particule)", duration: "30 min", type: "interactive" },
        { id: "c2_l3", title: "Les signes de la déclinaison (I'rab)", duration: "20 min", type: "video" },
        { id: "c2_l4", title: "Exemples pratiques d'analyse grammaticale", duration: "35 min", type: "quiz" },
      ],
    },
    {
      id: "c3",
      category: "islam",
      title: "Tajwid Fondamental & Récitation du Coran",
      description: "Maîtrisez les points d'articulation des lettres et les règles essentielles du Tajwid pour embellir votre récitation.",
      level: "Tous niveaux",
      duration: "6 modules • 24 leçons",
      lessons: [
        { id: "c3_l1", title: "Les points de sortie des lettres (Makhârij al-Hurûf)", duration: "30 min", type: "video" },
        { id: "c3_l2", title: "Les règles du Noun Sakinah et Tanween", duration: "25 min", type: "interactive" },
        { id: "c3_l3", title: "L'allongement de la voix (Al-Madd) et ses types", duration: "20 min", type: "video" },
        { id: "c3_l4", title: "Évaluation de récitation : Sourate Al-Fatiha", duration: "40 min", type: "quiz" },
      ],
    },
    {
      id: "c4",
      category: "islam",
      title: "La Sîrah (Vie du Prophète) & Éducation Spirituelle",
      description: "Plongez dans l'histoire inspirante du Prophète Muhammad (PSL), de sa naissance à sa mission, pour en tirer des leçons éthiques au quotidien.",
      level: "Débutant",
      duration: "4 modules • 12 leçons",
      lessons: [
        { id: "c4_l1", title: "Le contexte de l'Arabie pré-islamique", duration: "22 min", type: "video" },
        { id: "c4_l2", title: "La révélation dans la grotte de Hira", duration: "28 min", type: "interactive" },
        { id: "c4_l3", title: "L'Hégire : Le voyage vers Médine", duration: "30 min", type: "video" },
        { id: "c4_l4", title: "La construction de la société médinoise", duration: "35 min", type: "quiz" },
      ],
    },
    {
      id: "c5",
      category: "hadith",
      title: "Les 40 Hadiths d'Al-Nawawi (Science du Hadith)",
      description: "Explorez les hadiths fondamentaux compilés par l'Imam Al-Nawawi, couvrant les fondements de la foi, du comportement et de la pratique musulmane.",
      level: "Tous niveaux",
      duration: "5 modules • 15 leçons",
      lessons: [
        { id: "c5_l1", title: "Hadith 1 : Les actions ne valent que par les intentions (Niyyah)", duration: "20 min", type: "video" },
        { id: "c5_l2", title: "Hadith 2 : Le Hadith de Jibril (Islam, Iman, Ihsan)", duration: "30 min", type: "interactive" },
        { id: "c5_l3", title: "Hadith 3 : Les 5 piliers de l'Islam", duration: "20 min", type: "video" },
        { id: "c5_l4", title: "Quiz : Les transmetteurs de Hadiths (Boukhari et Muslim)", duration: "25 min", type: "quiz" }
      ]
    },
    {
      id: "c6",
      category: "fiqh",
      title: "Jurisprudence Islamique Pratique (Fiqh al-Wajîz)",
      description: "Apprenez les règles pratiques de l'islam basées sur des preuves claires : Purification (Ablutions), Prière, et adorations quotidiennes.",
      level: "Débutant",
      duration: "6 modules • 18 leçons",
      lessons: [
        { id: "c6_l1", title: "La Purification (At-Tahârah) et les types d'eau", duration: "22 min", type: "video" },
        { id: "c6_l2", title: "La description des ablutions (Woudou') pas à pas", duration: "25 min", type: "interactive" },
        { id: "c6_l3", title: "Les piliers, obligations et sounan de la Salat (Prière)", duration: "30 min", type: "video" },
        { id: "c6_l4", title: "Quiz pratique : Les cas de prosternation de distraction", duration: "25 min", type: "quiz" }
      ]
    },
    {
      id: "c7",
      category: "dogme",
      title: "Dogme & Croyance Saine (Aqîdah At-Tahawiyyah)",
      description: "Découvrez les fondements de la croyance islamique (Tawhid) sur la voie des gens de la Sounnah, expliqués clairement et sans ambiguïté.",
      level: "Débutant",
      duration: "4 modules • 12 leçons",
      lessons: [
        { id: "c7_l1", title: "Le sens profond de 'La ilaha illa Allah' et le Tawhid", duration: "25 min", type: "video" },
        { id: "c7_l2", title: "La Seigneurie d'Allah, Son Adoration et Ses Noms", duration: "30 min", type: "interactive" },
        { id: "c7_l3", title: "La foi aux Anges, aux Livres Saints et aux Messagers", duration: "20 min", type: "video" },
        { id: "c7_l4", title: "Quiz d'évaluation sur les articles de foi (Al-Iman)", duration: "30 min", type: "quiz" }
      ]
    }
  ],
  bookings: [
    {
      id: "b1",
      teacherId: "t1",
      teacherName: "Sheikh Ahmed Al-Mansoor",
      date: "Prochain Lundi à 10:00",
      status: "confirmé",
      link: "https://zoom.us/mock-qalam-live-room-1",
    }
  ],
  questions: [
    {
      id: "q1",
      studentName: "Amine",
      teacherId: "t2",
      teacherName: "Ustadha Fatima Zahra",
      content: "Quelle est la différence exacte entre le pronom sujet 'Antoum' et 'Antounna' en arabe littéraire ?",
      answer: "Assalamou alaykoum Amine ! 'Antoum' (أنتم) est utilisé pour s'adresser à un groupe d'hommes (masculin pluriel) ou un groupe mixte. 'Antounna' (أنتن) est quant à lui exclusivement réservé pour s'adresser à un groupe de femmes (féminin pluriel).",
      date: "Hier",
    }
  ],
  chatMessages: [
    { id: "m1", user: "Yassine", text: "Assalamou alaykoum ! Heureux de vous rejoindre tous sur Qalam Academy.", time: "10:30", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face" },
    { id: "m2", user: "Leila", text: "Wa alaykoum assalam Yassine ! Bienvenue. Tu étudies l'arabe ou le tajwid ?", time: "10:32", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=face" },
    { id: "m3", user: "Yassine", text: "Je fais les deux ! Le cours d'écriture débutant est génial, et j'ai réservé ma première séance en direct avec Sheikh Ahmed pour le Tajwid.", time: "10:34", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face" },
    { id: "m4", user: "Mariam", text: "Bienvenue ! Quelqu'un veut travailler ensemble sur le projet collaboratif de vocabulaire ?", time: "10:45", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face" },
  ],
  forumProjects: [
    {
      id: "fp1",
      title: "Glossaire de Vocabulaire Islamique Illustré",
      description: "Création d'un dictionnaire de vocabulaire pour les débutants, traduisant et illustrant les expressions courantes (Inshallah, Mashallah, Alhamdoulillah, etc.).",
      author: "Mariam",
      membersCount: 4,
      category: "Vocabulaire",
      createdAt: "Il y a 3 jours",
      posts: [
        { id: "fpp1", user: "Mariam", content: "J'ai commencé à lister les 20 expressions de base. Qui veut s'occuper de rédiger les exemples en arabe littéraire avec les voyelles ?", date: "Il y a 3 jours" },
        { id: "fpp2", user: "Karim", content: "Moi je peux le faire ! Je maîtrise bien l'écriture sur clavier arabe. Je m'en occupe ce soir.", date: "Il y a 2 jours" },
        { id: "fpp3", user: "Sonia", content: "Magnifique ! De mon côté, je peux m'occuper de la mise en page PDF téléchargeable pour tout le monde.", date: "Hier" },
      ],
    },
    {
      id: "fp2",
      title: "Mémorisation Collective de la Sourate Al-Moulk",
      description: "Un groupe d'entraide pour mémoriser un verset par jour de la Sourate Al-Moulk avec vérification mutuelle des règles de Tajwid lors de réunions hebdomadaires.",
      author: "Bilal",
      membersCount: 8,
      category: "Mémorisation",
      createdAt: "Il y a 1 semaine",
      posts: [
        { id: "fpp4", user: "Bilal", content: "Bienvenue à tous ! Nous commençons ce samedi. N'oubliez pas d'écouter la récitation de Sheikh Al-Husary pour bien caler les makharij.", date: "Il y a 6 jours" },
      ],
    }
  ],
  resources: [
    { id: "r1", title: "Manuel d'Arabe Écrit - Niveau Débutant (PDF)", desc: "Guide de 45 pages pour maîtriser le tracé des lettres et les liaisons.", size: "3.4 Mo", downloads: 245, filename: "qalam_arabe_debutant.pdf", category: "Arabe" },
    { id: "r2", title: "Règles Vocales du Tajwid - Guide Audio (MP3)", desc: "Explication et démonstration des points de prononciation des lettres gutturales.", size: "12 Mo • 15min", downloads: 189, filename: "tajwid_prononciation.mp3", category: "Tajwid" },
    { id: "r3", title: "Fiches de Vocabulaire Thématique - La Famille (PDF)", desc: "Vocabulaire complet avec translittération, traduction et écriture arabe.", size: "1.2 Mo", downloads: 312, filename: "vocabulaire_famille.pdf", category: "Vocabulaire" },
    { id: "r4", title: "Tafsir Simplifié de la Sourate Al-Asr (PDF)", desc: "Commentaire détaillé extrait des travaux d'Ibn Kathir pour la méditation.", size: "1.8 Mo", downloads: 120, filename: "tafsir_al_asr.pdf", category: "Tafsir" },
  ],
  notifications: [
    { id: "n1", text: "Votre cours en direct avec Sheikh Ahmed commence dans 1 heure !", time: "Il y a 10 min", read: false },
    { id: "n2", text: "Ustadha Fatima a répondu à votre question sur les pronoms.", time: "Il y a 3 heures", read: true },
  ],
};

// Lazy Initialized Gemini client
let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!genAIClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      genAIClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return genAIClient;
}

// REST API Endpoints
app.get("/api/state", (req, res) => {
  res.json(db);
});

// Toggle Subscription State
app.post("/api/subscription/subscribe", (req, res) => {
  const { plan } = req.body;
  if (plan) {
    db.subscription.status = "premium";
    db.subscription.plan = plan;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    db.subscription.expiryDate = expiry.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" }) as any;
    
    // Add success notification
    db.notifications.unshift({
      id: "n_" + Date.now(),
      text: `Félicitations ! Votre abonnement Premium (${plan === "monthly" ? "Mensuel" : "Annuel"}) est maintenant actif. Bienvenue !`,
      time: "À l'instant",
      read: false,
    });
  } else {
    db.subscription.status = "free";
    db.subscription.plan = null;
    db.subscription.expiryDate = null;
  }
  res.json({ success: true, subscription: db.subscription, notifications: db.notifications });
});

// Complete Lesson & Update Progress
app.post("/api/lessons/complete", (req, res) => {
  const { lessonId } = req.body;
  if (lessonId && !db.progress.completedLessons.includes(lessonId)) {
    db.progress.completedLessons.push(lessonId);
    db.progress.hoursStudied += 0.5;
    db.progress.points += 25;
    if (db.progress.completedLessons.length % 3 === 0) {
      db.progress.streakDays += 1;
    }
    
    db.notifications.unshift({
      id: "n_" + Date.now(),
      text: `Félicitations ! Vous avez terminé une leçon. +25 points !`,
      time: "À l'instant",
      read: false,
    });
  }
  res.json({ success: true, progress: db.progress, notifications: db.notifications });
});

// Book a teacher live session
app.post("/api/bookings", (req, res) => {
  const { teacherId, slot } = req.body;
  const teacher = db.teachers.find(t => t.id === teacherId);
  if (!teacher) {
    return res.status(404).json({ error: "Enseignant non trouvé" });
  }

  const newBooking = {
    id: "b_" + Date.now(),
    teacherId,
    teacherName: teacher.name,
    date: slot,
    status: "confirmé",
    link: `https://zoom.us/mock-qalam-live-${teacherId}-${Date.now()}`,
  };

  db.bookings.push(newBooking);

  db.notifications.unshift({
    id: "n_" + Date.now(),
    text: `Nouveau cours réservé avec ${teacher.name} pour le ${slot}. Préparez vos questions !`,
    time: "À l'instant",
    read: false,
  });

  res.json({ success: true, bookings: db.bookings, notifications: db.notifications });
});

// Ask teacher a question / trigger Gemini AI response
app.post("/api/questions", async (req, res) => {
  const { teacherId, content } = req.body;
  const teacher = db.teachers.find(t => t.id === teacherId) || db.teachers[0];

  const questionId = "q_" + Date.now();
  const newQuestion: {
    id: string;
    studentName: string;
    teacherId: string;
    teacherName: string;
    content: string;
    answer: string | null;
    date: string;
  } = {
    id: questionId,
    studentName: "Étudiant Qalam",
    teacherId: teacher.id,
    teacherName: teacher.name,
    content,
    answer: null,
    date: "À l'instant",
  };

  db.questions.push(newQuestion);

  // Trigger Gemini AI to generate an authentic response as the selected professor!
  try {
    const ai = getGenAI();
    let teacherResponseText = "";

    if (ai) {
      const prompt = `Tu es ${teacher.name}, un professeur d'apprentissage d'arabe et d'études islamiques très respectueux et pédagogue chez Qalam Academy.
Origine: ${teacher.origin}.
Spécialité: ${teacher.specialty}.
Bio: ${teacher.bio}.

Un étudiant te pose la question suivante : "${content}".
Donne une réponse de grande qualité, chaleureuse, en commençant par des salutations chaleureuses en arabe puis traduisant ou continuant en français de manière très pédagogue. Explique clairement avec des exemples, des transcriptions phonétiques ou des traductions si nécessaire. Garde un ton calme, académique et encourageant.
Ta réponse doit faire environ 100 à 250 mots, structurée et rédigée directement par toi, le professeur.`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      teacherResponseText = aiResponse.text || "Merci pour votre question intéressante. Je vais y répondre en détail très prochainement.";
    } else {
      // Offline fallback if API key is not ready
      teacherResponseText = `Assalamou alaykoum cher étudiant ! C'est ${teacher.name}. Merci pour votre excellente question. 
Pour y répondre de manière simplifiée en français : l'étude de l'arabe et des sciences islamiques requiert rigueur et patience. 
Pour approfondir ce sujet spécifique, je vous conseille de vous pencher sur l'étymologie de la racine trilitère du mot, et de vous exercer à la prononciation quotidienne. 
N'hésitez pas à réserver un cours en direct avec moi pour que nous travaillions cela ensemble de vive voix ! (Note: Connectez une clé API Gemini dans le panneau Secrets pour des réponses personnalisées en direct !)`;
    }

    // Update answer in state
    const item = db.questions.find(q => q.id === questionId);
    if (item) {
      item.answer = teacherResponseText;
    }

    db.notifications.unshift({
      id: "n_" + Date.now(),
      text: `${teacher.name} a répondu à votre question posée en ligne !`,
      time: "À l'instant",
      read: false,
    });

    res.json({ success: true, questions: db.questions, notifications: db.notifications });
  } catch (error: any) {
    console.error("Gemini API Error in Questions:", error);
    // Graceful fallback on error
    const item = db.questions.find(q => q.id === questionId);
    if (item) {
      item.answer = `Assalamou alaykoum ! C'est ${teacher.name}. J'ai bien reçu votre question. En raison d'un petit problème technique temporaire avec mon assistant d'IA, je vous réponds de manière générale : l'apprentissage de l'arabe est une aventure magnifique, concentrez-vous sur l'écoute attentive et la répétition. À très vite en direct !`;
    }
    res.json({ success: true, questions: db.questions, notifications: db.notifications });
  }
});

// Chat with the general AI Tutor / chatbot (Gemini-powered)
app.post("/api/tutor/chat", async (req, res) => {
  const { message, history } = req.body;

  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        answer: `Assalamou alaykoum ! Je suis le Tuteur IA de Qalam Academy. 
Pour activer mes réponses intelligentes et personnalisées en direct sur la grammaire arabe, le Tajwid ou la Sira, veuillez ajouter votre clé API Gemini dans le menu **Settings > Secrets** (panneau de gauche).
En attendant, je peux vous dire que la clé du succès réside dans l'assiduité ! Qu'aimeriez-vous savoir sur l'alphabet, la grammaire ou le Tajwid ?`
      });
    }

    // Construct simple chat contents including history
    const systemPrompt = `Tu es "Tuteur Qalam", un tuteur virtuel d'arabe et d'études islamiques exceptionnel, intelligent et bienveillant de Qalam Academy.
Tu aides les étudiants de tous niveaux en français et en arabe.
Tu es capable d'expliquer les règles de grammaire arabe (Nahw/Sarf), de traduire des mots, d'expliquer les concepts du Tajwid, d'enseigner les sciences du Hadith (comme les 40 hadiths d'Al-Nawawi), d'expliquer les règles de Fiqh (jurisprudence pratique, ablutions, prière) ainsi que les fondements du Dogme et de la croyance musulmane saine (Aqîdah).
Sois extrêmement respectueux, utilise des termes clairs, donne des exemples en caractères arabes avec leur phonétique et leur signification en français. 
Encourage toujours l'étudiant. Rends tes réponses visuellement agréables avec des puces ou des tableaux si applicable.`;

    // Limit history size to keep things fast
    const formattedHistory = (history || []).slice(-6).map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }]
    }));

    // Add user message
    formattedHistory.push({
      role: "user",
      parts: [{ text: message }]
    });

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    res.json({ answer: aiResponse.text || "Pardon, je n'ai pas pu générer de réponse. Recommencez s'il vous plaît." });
  } catch (error: any) {
    console.error("Gemini API Error in Tutor Chat:", error);
    res.status(500).json({ error: "Erreur lors de l'appel au tuteur IA. Vérifiez votre clé API dans les secrets." });
  }
});

// Post a message in student chat room
app.post("/api/chat", (req, res) => {
  const { user, text, avatar } = req.body;
  const newMessage = {
    id: "m_" + Date.now(),
    user: user || "Moi",
    text,
    time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
  };
  db.chatMessages.push(newMessage);
  res.json({ success: true, chatMessages: db.chatMessages });
});

// Post or comment in Collaborative Project Forum
app.post("/api/forum", (req, res) => {
  const { projectId, title, description, category, user, content } = req.body;

  if (projectId) {
    // Add post comment to existing project
    const project = db.forumProjects.find(p => p.id === projectId);
    if (project) {
      const newPost = {
        id: "fpp_" + Date.now(),
        user: user || "Moi",
        content,
        date: "À l'instant",
      };
      project.posts.push(newPost);
      project.membersCount = Math.max(project.membersCount + 1, 3); // mock update
      
      // Notify original project author if it's someone else
      if (project.author !== user) {
        db.notifications.unshift({
          id: "n_" + Date.now(),
          text: `${user} a commenté votre projet collaboratif "${project.title}".`,
          time: "À l'instant",
          read: false,
        });
      }
    }
  } else {
    // Create brand new project
    const newProject = {
      id: "fp_" + Date.now(),
      title,
      description,
      author: user || "Moi",
      membersCount: 1,
      category: category || "Général",
      createdAt: "À l'instant",
      posts: [
        {
          id: "fpp_" + Date.now(),
          user: user || "Moi",
          content: content || `Lancement du projet collaboratif "${title}" ! Qui veut nous rejoindre ?`,
          date: "À l'instant",
        }
      ],
    };
    db.forumProjects.unshift(newProject);
  }

  res.json({ success: true, forumProjects: db.forumProjects, notifications: db.notifications });
});

// Mark all notifications as read
app.post("/api/notifications/read-all", (req, res) => {
  db.notifications.forEach(n => n.read = true);
  res.json({ success: true, notifications: db.notifications });
});

// Vite Middleware & static assets serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
