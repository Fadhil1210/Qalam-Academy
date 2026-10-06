import React, { useState } from "react";
import { 
  MessageSquare, 
  Users, 
  Send, 
  Sparkles, 
  Plus, 
  FolderGit2, 
  Calendar, 
  MessageCircle, 
  Compass, 
  ArrowRight,
  PlusCircle,
  FileText
} from "lucide-react";
import { AppState, ChatMessage, ForumProject } from "../types";

interface ChatForumProps {
  state: AppState;
  onPostChatMessage: (text: string) => void;
  onPostForumPost: (projectId: string | null, title?: string, description?: string, category?: string, content?: string) => void;
  onShowToast: (message: string, type?: "success" | "info" | "warning") => void;
}

export default function ChatForum({ 
  state, 
  onPostChatMessage, 
  onPostForumPost, 
  onShowToast 
}: ChatForumProps) {
  const { chatMessages, forumProjects } = state;
  const [activeSubTab, setActiveSubTab] = useState<"chat" | "projects">("projects");
  const [chatInput, setChatInput] = useState("");
  
  // Collaborative forum creations states
  const [selectedProject, setSelectedProject] = useState<ForumProject | null>(null);
  const [projectCommentInput, setProjectCommentInput] = useState("");
  
  // New Project Form Modal states
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectCat, setNewProjectCat] = useState("Mémorisation");
  const [newProjectContent, setNewProjectContent] = useState("");

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onPostChatMessage(chatInput);
    setChatInput("");
    onShowToast("Message envoyé au groupe d'étude !", "success");
  };

  const handleSendProjectComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectCommentInput.trim() || !selectedProject) return;
    
    onPostForumPost(selectedProject.id, undefined, undefined, undefined, projectCommentInput);
    setProjectCommentInput("");
    onShowToast("Contribution publiée sur le projet !", "success");
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim() || !newProjectDesc.trim() || !newProjectContent.trim()) {
      onShowToast("Veuillez remplir tous les champs du projet.", "warning");
      return;
    }

    onPostForumPost(null, newProjectTitle, newProjectDesc, newProjectCat, newProjectContent);
    setShowNewProjectForm(false);
    setNewProjectTitle("");
    setNewProjectDesc("");
    setNewProjectContent("");
    onShowToast("🎉 Nouveau projet collaboratif créé avec succès !", "success");
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Espace Communautaire</h1>
            <p className="text-sm text-slate-500">
              {activeSubTab === "projects" 
                ? "Rejoignez ou créez des projets d'étude collaboratifs avec d'autres étudiants."
                : "Échangez en direct avec l'ensemble des apprenants de Qalam Academy."}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveSubTab("projects")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                activeSubTab === "projects"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
              }`}
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Projets Collaboratifs</span>
            </button>
            <button
              onClick={() => setActiveSubTab("chat")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer ${
                activeSubTab === "chat"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat de Discussion</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === "chat" ? (
        /* live chat view */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat main area */}
          <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[500px]">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-slate-700">Salon de discussion général</span>
              </div>
              <span className="text-xs text-slate-400">4 apprenants en ligne</span>
            </div>

            {/* Message list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <img src={msg.avatar} alt={msg.user} className="w-8 h-8 rounded-full object-cover" />
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50 max-w-[85%]">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="text-xs font-bold text-slate-700">{msg.user}</span>
                      <span className="text-[10px] text-slate-400">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-100 bg-white flex gap-2">
              <input 
                type="text" 
                placeholder="Rédigez votre message d'entraide..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500"
              />
              <button 
                type="submit"
                className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Charte de Bienveillance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Qalam Academy est un espace de respect mutuel et d'excellence éducative. Échangez avec courtoisie, partagez vos doutes et encouragez les progrès de vos frères et sœurs d'apprentissage.
            </p>
            <div className="text-[10px] bg-emerald-50 text-emerald-800 p-2.5 rounded-lg font-medium border border-emerald-100 space-y-1">
              <p>✓ Partager du vocabulaire</p>
              <p>✓ Proposer des séances d'écoute</p>
              <p>✗ Publicité ou débats stériles</p>
            </div>
          </div>
        </div>
      ) : (
        /* Collaborative Projects Forum View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Listing / Detail */}
          <div className="lg:col-span-2 space-y-4">
            
            {!selectedProject ? (
              /* Projects Directory */
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-md font-bold text-slate-700">Projets Collaboratifs Actifs</h2>
                  <button 
                    onClick={() => setShowNewProjectForm(true)}
                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Créer un projet
                  </button>
                </div>

                {forumProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-100 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">
                          {project.category}
                        </span>
                        <span className="text-xs text-slate-400">Par {project.author} • {project.createdAt}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-base mb-2 leading-snug">{project.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-3 mb-4">{project.description}</p>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                      <span>👥 {project.membersCount} participants engagés</span>
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="text-xs text-emerald-600 font-semibold flex items-center gap-1 hover:text-emerald-700 cursor-pointer"
                      >
                        Rejoindre / Participer ({project.posts.length} contributions) →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Selected Project Details */
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  ← Retourner aux projets collaboratifs
                </button>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md">
                      {selectedProject.category}
                    </span>
                    <span className="text-xs text-slate-400">Initié par {selectedProject.author}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedProject.title}</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">{selectedProject.description}</p>
                </div>

                {/* Submissions & Posts inside the project */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="font-bold text-slate-700 text-sm">Discussions & Fichiers Partagés</h3>
                  
                  <div className="space-y-3">
                    {selectedProject.posts.map((post) => (
                      <div key={post.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-700">{post.user}</span>
                          <span>{post.date}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                      </div>
                    ))}
                  </div>

                  {/* Add commentary to the project */}
                  <form onSubmit={handleSendProjectComment} className="pt-4 border-t border-slate-100 space-y-3">
                    <textarea
                      placeholder="Ajoutez votre contribution (suggestions de mots, validation d'un verset mémorisé, lien de fichier)..."
                      rows={3}
                      value={projectCommentInput}
                      onChange={(e) => setProjectCommentInput(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!projectCommentInput.trim()}
                      className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      Ajouter au projet
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Right Column creation flow / guidelines */}
          <div className="space-y-6">
            
            {/* Create new project modal fallback inside standard layout if button clicked */}
            {showNewProjectForm && (
              <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-xs space-y-4 relative">
                <button 
                  onClick={() => setShowNewProjectForm(false)}
                  className="absolute top-3 right-3 text-emerald-300 hover:text-white font-bold cursor-pointer"
                >
                  ✕
                </button>
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-bold text-sm">Nouveau Projet Collaboratif</h3>
                </div>

                <form onSubmit={handleCreateProjectSubmit} className="space-y-3 text-slate-800 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">Titre du Projet</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Écriture d'un poème grammatical..." 
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border-0"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">Catégorie</label>
                    <select
                      value={newProjectCat}
                      onChange={(e) => setNewProjectCat(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border-0"
                    >
                      <option value="Mémorisation">Mémorisation collective</option>
                      <option value="Vocabulaire">Glossaire & Vocabulaire</option>
                      <option value="Tafsir">Méditation de versets</option>
                      <option value="Grammaire">Grammaire & Dictée</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">Résumé de l'objectif</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Mémoriser la Sourate Al-Kahf à plusieurs..." 
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border-0"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">Message de lancement</label>
                    <textarea 
                      placeholder="Détaillez le planning ou les tâches à accomplir..." 
                      rows={3}
                      value={newProjectContent}
                      onChange={(e) => setNewProjectContent(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-lg border-0"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-yellow-400 text-emerald-950 font-bold py-2 rounded-xl text-xs hover:bg-yellow-300 transition-colors cursor-pointer"
                  >
                    Créer et Inviter des membres
                  </button>
                </form>
              </div>
            )}

            {/* General community bento card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Pourquoi des projets collaboratifs ?</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apprendre en groupe multiplie par 3 vos chances d'assiduité. L'entraide permet de corriger vos exercices d'écriture arabe mutuellement ou de valider la prononciation correcte lors d'audioconférences collectives.
              </p>
              <div className="border-t border-slate-50 pt-3 text-[10px] text-slate-400 space-y-1">
                <p>• Créez votre projet et définissez les tâches.</p>
                <p>• Invitez vos camarades d'apprentissage via le Chat.</p>
                <p>• Sollicitez un enseignant pour auditer vos travaux d'écriture finalisés !</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
