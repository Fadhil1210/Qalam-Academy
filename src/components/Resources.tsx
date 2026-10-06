import React, { useState } from "react";
import { 
  Download, 
  FileText, 
  Music, 
  Search, 
  Filter, 
  BookOpen, 
  FileCheck, 
  Lock, 
  Eye, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { AppState, Resource } from "../types";

interface ResourcesProps {
  state: AppState;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export default function Resources({ state, onShowToast }: ResourcesProps) {
  const { resources, subscription } = state;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [downloadCount, setDownloadCount] = useState<Record<string, number>>({});

  const isPremium = subscription.status === "premium";

  const categories = ["all", "Arabe", "Tajwid", "Vocabulaire", "Tafsir"];

  const filteredResources = resources.filter((res) => {
    const matchesCat = selectedCategory === "all" || res.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      res.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleDownload = (res: Resource, idx: number) => {
    const isUnlocked = isPremium || idx === 2; // Only item with index 2 is free to try
    
    if (!isUnlocked) {
      onShowToast("🔒 Ce document est réservé aux abonnés Premium de Qalam Academy.", "warning");
      return;
    }

    // Simulate download count update
    setDownloadCount(prev => ({
      ...prev,
      [res.id]: (prev[res.id] || res.downloads) + 1
    }));

    onShowToast(`📥 Téléchargement lancé : "${res.filename}"...`, "success");

    // Mock direct PDF blob open in standard new window
    try {
      const mockText = `Qalam Academy - Téléchargement de document.\nContenu du document : ${res.title}\nSpécialité : ${res.category}\n\nMerci d'étudier sur Qalam Academy.`;
      const blob = new Blob([mockText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bibliothèque de Ressources</h1>
          <p className="text-sm text-slate-500">
            Téléchargez nos manuels scolaires d'arabe littéraire, fiches de Tajwid simplifiées, fiches de révisions vocales (MP3) ou mémentos de vocabulaire pour étudier hors-ligne.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input 
              type="text" 
              placeholder="Rechercher un manuel, une fiche de Tajwid..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
                }`}
              >
                {cat === "all" ? "Toutes catégories" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid view of books */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((res, idx) => {
          const isUnlocked = isPremium || idx === 2; // Third resource is free sample
          const isAudio = res.filename.endsWith(".mp3");
          const downloads = downloadCount[res.id] || res.downloads;

          return (
            <div 
              key={res.id} 
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between hover:shadow-md ${
                !isUnlocked ? "opacity-80 border-slate-100" : "border-slate-100 hover:border-emerald-100"
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    {res.category}
                  </span>
                  
                  {!isUnlocked ? (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Premium
                    </span>
                  ) : idx === 2 ? (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Échantillon Gratuit
                    </span>
                  ) : null}
                </div>

                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl ${isAudio ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>
                    {isAudio ? <Music className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{res.title}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{res.desc}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Taille : {res.size} • {downloads} clics</span>
                <button
                  onClick={() => handleDownload(res, idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isUnlocked 
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs" 
                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {isUnlocked ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isUnlocked ? "Télécharger" : "Débloquer"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Premium resources announcement */}
      {!isPremium && (
        <div className="bg-emerald-950 text-emerald-100 p-6 rounded-2xl border border-emerald-900 shadow-md relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-y-6">
            <Sparkles className="w-48 h-48" />
          </div>
          <div className="max-w-xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dossiers d'études illimités</span>
            </div>
            <h2 className="text-lg font-bold">Rejoignez Qalam Premium pour débloquer l'intégralité de la bibliothèque !</h2>
            <p className="text-xs text-emerald-200 leading-relaxed">
              En devenant membre Premium, vous accédez instantanément à plus de 45 manuels complets rédigés par nos professeurs d'Égypte et de Jordanie, des guides audio MP3 exclusifs de Tajwid et des examens blancs corrigés.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
