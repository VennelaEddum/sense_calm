import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import CustomAACCardModal from "@/components/CustomAACCardModal";
import VoiceDiagnosticsModal from "@/components/VoiceDiagnosticsModal";
import type { GameDifficulty, TimelineStepItem, AACCardItem, ModuleName } from "@/types";
import {
  ShieldCheck,
  User,
  MessageSquarePlus,
  Gamepad2,
  CalendarCheck,
  BarChart3,
  Download,
  Trash2,
  KeyRound,
  Sparkles,
  Heart,
  Plus,
  Info,
  Layers,
  Languages,
  Eye,
  LogOut,
  Cloud,
  RefreshCw,
  UserPlus,
  Check,
  Volume2,
} from "lucide-react";

type CaregiverTab = "profile" | "aac" | "learning" | "routine" | "insights" | "voice";

interface CaregiverDashboardPageProps {
  onNavigate?: (m: ModuleName) => void;
  onExit?: () => void;
}

export default function CaregiverDashboardPage({
  onNavigate,
  onExit,
}: CaregiverDashboardPageProps) {
  const {
    childProfile,
    updateChildProfile,
    childProfiles,
    activeChildProfile,
    selectActiveChild,
    caregiverProfile,
    isAuthenticated,
    isSupabaseActive,
    syncStatus,
    syncNow,
    customAACCards,
    deleteCustomAACCard,
    preferences,
    updatePreferences,
    progress,
    timelineSteps,
    addTimelineStep,
    deleteTimelineStep,
    emotionHistory,
    exportAllData,
    clearAllUserData,
    showNotice,
    setIsCaregiverAuthenticated,
  } = useApp();

  const [activeTab, setActiveTab] = useState<CaregiverTab>("profile");
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<AACCardItem | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Timeline step form state
  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepTelugu, setNewStepTelugu] = useState("");
  const [newStepTime, setNewStepTime] = useState("10:00 AM");
  const [newStepEmoji, setNewStepEmoji] = useState("⭐");

  // Child Profile local edit state
  const [pinInput, setPinInput] = useState(childProfile.caregiverPIN || "");

  const handleSavePin = () => {
    updateChildProfile({ caregiverPIN: pinInput.trim() });
    showNotice(pinInput.trim() ? "Caregiver PIN updated!" : "Caregiver PIN removed.");
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncNow();
    setIsSyncing(false);
  };

  const handleAddTimelineStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;

    const newStep: TimelineStepItem = {
      id: `custom-step-${Date.now()}`,
      stepNumber: timelineSteps.length + 1,
      title: newStepTitle.trim(),
      teluguTitle: newStepTelugu.trim() || newStepTitle.trim(),
      timeHint: newStepTime.trim() || "Anytime",
      emoji: newStepEmoji.trim() || "⭐",
      instruction: "Follow step gently",
      teluguInstruction: "",
      completed: false,
    };

    addTimelineStep(newStep);
    setNewStepTitle("");
    setNewStepTelugu("");
    showNotice("New timeline routine step added!");
  };

  const handleExitDashboard = () => {
    setIsCaregiverAuthenticated(false);
    if (onExit) {
      onExit();
    } else if (onNavigate) {
      onNavigate("home");
    }
  };

  // Compute emotion breakdown from emotionHistory
  const emotionBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const record of emotionHistory) {
      counts[record.emotionLabel] = (counts[record.emotionLabel] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [emotionHistory]);

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-8 max-w-[1040px] mx-auto animate-fade-in">
      {isAddCardOpen && (
        <CustomAACCardModal
          initialCard={editingCard}
          onClose={() => {
            setIsAddCardOpen(false);
            setEditingCard(undefined);
          }}
        />
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EADFE0]">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#3E6546] flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1
                className="text-2xl sm:text-3xl font-extrabold text-[#4B3D40]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Teacher & Caregiver Portal
              </h1>
              {isAuthenticated && (
                <span className="px-2 py-0.5 rounded-full bg-[#EAF5ED] text-[#385D40] text-[10px] font-bold border border-[#C5DEC8]">
                  Verified Caregiver
                </span>
              )}
            </div>
            <p className="text-xs text-[#7A6A6E] mt-0.5">
              {caregiverProfile?.email
                ? `Logged in as: ${caregiverProfile.fullName} (${caregiverProfile.email})`
                : "Personalize communication cards, manage learning difficulty, and view private insights."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Cloud Sync Button */}
          {isAuthenticated && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#E5EFF7] text-[#2C5F85] font-extrabold text-xs hover:bg-[#D5E7F4] transition-all cursor-pointer shadow-xs"
              title="Synchronize database changes"
            >
              <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Syncing..." : "Sync Database"}</span>
            </button>
          )}

          <button
            onClick={handleExitDashboard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5ECEF] text-[#69555A] font-extrabold text-xs hover:bg-[#EEDFE3] transition-all shrink-0 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Return to Child Mode</span>
          </button>
        </div>
      </div>

      {/* Guest Mode Notice */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#FFF8EB] to-[#FDF5F2] border-2 border-[#F3DFB6] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☁</span>
            <div>
              <strong className="text-sm font-extrabold text-[#7D5812] block">
                Local Storage Mode Active
              </strong>
              <p className="text-xs text-[#8A6318]">
                Sign in with your caregiver account to sync child profiles, custom AAC cards, and learning progress across devices with Supabase.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate?.("login")}
            className="px-4 py-2 rounded-full bg-[#718D75] text-white text-xs font-bold hover:bg-[#5E7962] transition-all cursor-pointer shrink-0 shadow-xs"
          >
            Caregiver Sign In
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {[
          { key: "profile", label: "Child Profile", icon: User },
          { key: "aac", label: "AAC & Familiar People", icon: MessageSquarePlus },
          { key: "learning", label: "Learning & Difficulty", icon: Gamepad2 },
          { key: "routine", label: "Routine Timeline", icon: CalendarCheck },
          { key: "insights", label: "History & Insights", icon: BarChart3 },
          { key: "voice", label: "Voice Diagnostics", icon: Volume2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as CaregiverTab)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap border-2 transition-all flex items-center gap-2 cursor-pointer
                ${
                  isActive
                    ? "bg-[#718D75] border-[#5A775E] text-white shadow-md scale-[1.02]"
                    : "bg-white border-[#E9DFE2] text-[#65575A] hover:bg-[#FAF5F7]"
                }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: CHILD PROFILE & PERSONALISATION
      ======================================================== */}
      {activeTab === "profile" && (
        <div className="grid gap-6 animate-float-up">
          {/* Multiple Child Profiles Switcher */}
          {childProfiles.length > 0 && (
            <div className="p-4 rounded-2xl bg-white border-2 border-[#EADFE0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#6D5D61]">Switch Active Child:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {childProfiles.map((cp) => {
                    const isSelected = (activeChildProfile?.id || childProfile.name) === (cp.id || cp.name);
                    return (
                      <button
                        key={cp.id || cp.name}
                        onClick={() => selectActiveChild(cp)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border
                          ${
                            isSelected
                              ? "bg-[#EAF3EC] border-[#718D75] text-[#385D40] shadow-xs scale-[1.02]"
                              : "bg-[#FAF7F8] border-[#E6D9DC] text-[#655A5D] hover:bg-[#F2ECEE]"
                          }`}
                      >
                        <span>{cp.avatarEmoji || "🐰"}</span>
                        <span>{cp.name}</span>
                        {isSelected && <Check size={12} className="text-[#385D40]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => onNavigate?.("child-setup")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF0F3] border border-[#E8CCD5] text-[#8F596B] text-xs font-bold hover:bg-[#F5E2E8] transition-all cursor-pointer shrink-0"
              >
                <UserPlus size={13} />
                <span>Add Child Profile</span>
              </button>
            </div>
          )}

          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-extrabold text-[#524447] flex items-center gap-2">
                <User size={18} className="text-[#718D75]" /> Personalised Communication Profile
              </h2>
              <button
                onClick={() => onNavigate?.("child-setup")}
                className="text-xs font-bold text-[#718D75] hover:underline cursor-pointer"
              >
                Open Full Profile Wizard
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold text-[#6D5D61] mb-1">
                  Child's Preferred Name
                </label>
                <input
                  type="text"
                  value={childProfile.name}
                  onChange={(e) => updateChildProfile({ name: e.target.value })}
                  placeholder="Enter child's name..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2C7] text-sm text-[#4F3F42] font-semibold outline-none focus:border-[#718D75]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6D5D61] mb-1">
                  Primary Language
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateChildProfile({ preferredLanguage: "en" })}
                    className={`flex-1 py-2 px-3 rounded-xl border-2 text-xs font-extrabold transition-all cursor-pointer ${
                      childProfile.preferredLanguage === "en"
                        ? "bg-[#EAF5ED] border-[#718D75] text-[#34593C]"
                        : "bg-[#FAFAFA] border-[#EADFE2] text-[#6E6063]"
                    }`}
                  >
                    English (🇬🇧/🇺🇸)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateChildProfile({ preferredLanguage: "te" })}
                    className={`flex-1 py-2 px-3 rounded-xl border-2 text-xs font-extrabold transition-all cursor-pointer ${
                      childProfile.preferredLanguage === "te"
                        ? "bg-[#FCEFF2] border-[#C9879C] text-[#8F596B]"
                        : "bg-[#FAFAFA] border-[#EADFE2] text-[#6E6063]"
                    }`}
                  >
                    Telugu (తెలుగు 🇮🇳)
                  </button>
                </div>
              </div>
            </div>

            {/* Caregiver PIN Setting */}
            <div className="mt-4 pt-4 border-t border-[#F2E8EB]">
              <label className="block text-xs font-extrabold text-[#6D5D61] mb-1 flex items-center gap-1.5">
                <KeyRound size={14} className="text-[#C9879C]" />
                Optional Caregiver PIN (Child-proof barrier)
              </label>
              <div className="flex items-center gap-3 max-w-sm">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="e.g. 1234 (leave blank for math challenge only)"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#D5C2C7] text-xs font-mono outline-none"
                />
                <button
                  onClick={handleSavePin}
                  className="px-4 py-2 rounded-xl bg-[#718D75] text-white text-xs font-bold hover:bg-[#5C7760] transition-all cursor-pointer"
                >
                  Save PIN
                </button>
              </div>
              <p className="text-[11px] text-[#8E7E82] mt-1">
                If set, caregivers must enter this PIN after solving the math barrier.
              </p>
            </div>
          </div>

          {/* Frequently Communicated Sentences */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-xs">
            <h3 className="text-sm font-extrabold text-[#524447] mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-[#C9879C]" /> Frequently Used AAC Sentences
            </h3>
            <p className="text-xs text-[#7A6A6E] mb-3">
              Automatically saved phrases spoken by the child in the AAC sentence builder.
            </p>
            {childProfile.frequentlyUsedSentences.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {childProfile.frequentlyUsedSentences.map((sentence, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-[#FAF0F3] border border-[#E8CCD5] rounded-full text-xs font-bold text-[#7E4C5C]"
                  >
                    "{sentence}"
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8F7E83] italic">
                No sentence history recorded yet. When the child taps "Speak Full Sentence", favorite phrases appear here.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: AAC CUSTOMIZER & FAMILIAR PEOPLE
      ======================================================== */}
      {activeTab === "aac" && (
        <div className="grid gap-6 animate-float-up">
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#524447] flex items-center gap-2">
                  <MessageSquarePlus size={18} className="text-[#718D75]" /> Custom Picture Cards & Familiar People
                </h2>
                <p className="text-xs text-[#7A6A6E] mt-0.5">
                  Upload custom photos of family members, caregivers, school teachers, and favorite items.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingCard(undefined);
                  setIsAddCardOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#718D75] text-white text-xs font-bold hover:bg-[#5C7760] transition-all shrink-0 cursor-pointer shadow-xs"
              >
                <Plus size={15} /> Add Custom Picture Card
              </button>
            </div>

            {/* Grid of custom cards */}
            {customAACCards.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-[#E3D6DA] rounded-2xl bg-[#FCFAF9]">
                <span className="text-4xl block mb-2">📸</span>
                <p className="text-sm font-bold text-[#5F5154]">No custom picture cards created yet</p>
                <p className="text-xs text-[#8E7E82] mt-1 max-w-sm mx-auto">
                  Click the button above to upload a photo of Mom, Dad, a favorite toy, or specific comfort needs.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {customAACCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-3 rounded-2xl border-2 border-[#E3D4D7] bg-[#FFFDFC] shadow-xs flex flex-col items-center text-center relative group"
                  >
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.text}
                        className="w-16 h-16 object-cover rounded-xl mb-2 border border-black/10 shadow-xs"
                      />
                    ) : (
                      <span className="text-3xl mb-2">{card.emoji}</span>
                    )}

                    <strong className="text-xs font-extrabold text-[#524447] truncate w-full">
                      {card.text}
                    </strong>
                    <span className="text-[11px] text-[#718D75] font-semibold truncate w-full">
                      {card.teluguText}
                    </span>

                    {card.familiarRole && (
                      <span className="mt-1 px-2 py-0.5 rounded-full bg-[#FAF0F3] text-[#8F596B] text-[9px] font-bold">
                        {card.familiarRole}
                      </span>
                    )}

                    <div className="mt-2 pt-2 border-t border-[#F2E8EB] w-full flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingCard(card);
                          setIsAddCardOpen(true);
                        }}
                        className="text-[11px] font-bold text-[#718D75] hover:underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <span className="text-[#D5C2C7]">·</span>
                      <button
                        onClick={() => deleteCustomAACCard(card.id)}
                        className="text-[11px] font-bold text-[#C53030] hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: LEARNING DIFFICULTY & GAME MANAGEMENT
      ======================================================== */}
      {activeTab === "learning" && (
        <div className="grid gap-6 animate-float-up">
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-xs">
            <h2 className="text-base font-extrabold text-[#524447] mb-2 flex items-center gap-2">
              <Gamepad2 size={18} className="text-[#718D75]" /> Personalized Game Difficulty
            </h2>
            <p className="text-xs text-[#7A6A6E] mb-4">
              Select the appropriate choice complexity for your child across all 5 learning games.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                {
                  id: "beginner" as GameDifficulty,
                  title: "Beginner (2 Choices)",
                  desc: "Shows 2 large cards with step-by-step guidance. Ideal for early learners.",
                  badge: "Early Discovery",
                },
                {
                  id: "intermediate" as GameDifficulty,
                  title: "Intermediate (3 Choices)",
                  desc: "Balanced choice set (3 cards) with gentle hints. Standard mode.",
                  badge: "Balanced Play",
                },
                {
                  id: "advanced" as GameDifficulty,
                  title: "Advanced (Full Challenge)",
                  desc: "4+ options with subtle clues for children ready for independent exploration.",
                  badge: "Independent",
                },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => {
                    updatePreferences({ gameDifficulty: tier.id });
                    showNotice(`Learning level set to ${tier.title}`);
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between
                    ${
                      preferences.gameDifficulty === tier.id
                        ? "border-[#718D75] bg-[#EAF5ED] text-[#34593C] shadow-xs scale-[1.02]"
                        : "border-[#ECE2E4] bg-white text-[#5E5154] hover:bg-[#FAF6F7]"
                    }`}
                >
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-[#D0E2D3] text-[#4F7354] inline-block mb-2">
                      {tier.badge}
                    </span>
                    <strong className="text-sm font-extrabold block mb-1">
                      {tier.title}
                    </strong>
                    <p className="text-xs text-[#7C6C70] leading-relaxed">
                      {tier.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-[#F9F6F7] rounded-2xl border border-[#EFE7E9] flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-[#55474A]">
                Total Games Completed: <strong>{progress.totalGamesCompleted}</strong> · Total Points: <strong>{progress.totalPoints}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: ROUTINE TIMELINE MANAGER
      ======================================================== */}
      {activeTab === "routine" && (
        <div className="grid gap-6 animate-float-up">
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-xs">
            <h2 className="text-base font-extrabold text-[#524447] mb-2 flex items-center gap-2">
              <CalendarCheck size={18} className="text-[#718D75]" /> Visual Routine Steps
            </h2>
            <p className="text-xs text-[#7A6A6E] mb-4">
              Add or remove routine checkpoints shown in the child's Visual Daily Routine timeline.
            </p>

            {/* Add Step Form */}
            <form onSubmit={handleAddTimelineStepSubmit} className="p-4 rounded-2xl bg-[#FCFAF9] border border-[#E9DDE0] mb-5">
              <h4 className="text-xs font-extrabold text-[#524447] mb-3">Add New Routine Step</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mb-3">
                <input
                  type="text"
                  placeholder="Step title (e.g. Quiet Snack)"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D5C2C7] text-xs outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Telugu title (e.g. అల్పాహారం)"
                  value={newStepTelugu}
                  onChange={(e) => setNewStepTelugu(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D5C2C7] text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Time hint (e.g. 4:00 PM)"
                  value={newStepTime}
                  onChange={(e) => setNewStepTime(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D5C2C7] text-xs outline-none"
                />
                <input
                  type="text"
                  placeholder="Emoji (e.g. 🍎)"
                  value={newStepEmoji}
                  onChange={(e) => setNewStepEmoji(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#D5C2C7] text-xs outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#718D75] text-white text-xs font-bold hover:bg-[#5C7760] transition-all cursor-pointer"
              >
                + Add Step to Timeline
              </button>
            </form>

            {/* List of Timeline Steps */}
            <div className="grid gap-2">
              {timelineSteps.map((step) => (
                <div
                  key={step.id}
                  className="p-3 rounded-xl border border-[#EAE0E3] bg-[#FCF9FA] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{step.emoji}</span>
                    <span className="font-extrabold text-[#8F7D82] shrink-0 uppercase text-[10px]">
                      {step.timeHint || "Anytime"}
                    </span>
                    <strong className="font-bold text-[#514346] truncate">{step.title}</strong>
                    <span className="text-[#817276] truncate hidden sm:inline">
                      ({step.teluguTitle})
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTimelineStep(step.id)}
                    className="p-1.5 rounded-lg text-[#B83E3E] hover:bg-[#FDEEEE] shrink-0 cursor-pointer"
                    title="Remove Step"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: HISTORY & INSIGHTS
      ======================================================== */}
      {activeTab === "insights" && (
        <div className="grid gap-6 animate-float-up">
          {/* Emotion Check-in Trends */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-xs">
            <h3 className="text-sm font-extrabold text-[#524447] mb-2 flex items-center gap-2">
              <Heart size={16} className="text-[#C9879C]" /> Recent Emotion Check-ins ({emotionHistory.length})
            </h3>
            {emotionBreakdown.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                {emotionBreakdown.map(([emotion, count]) => (
                  <div
                    key={emotion}
                    className="p-3 bg-[#FAF5F7] rounded-xl border border-[#ECD9DF] text-center"
                  >
                    <span className="text-xs font-bold text-[#6B5A5E] block">{emotion}</span>
                    <strong className="text-lg font-black text-[#8F596B]">{count} times</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8F7E83] mb-4">
                No emotion check-in records yet. When the child uses the Emotion Assistant, trends will appear here.
              </p>
            )}

            {/* Recent Check-ins List */}
            {emotionHistory.length > 0 && (
              <ul className="grid gap-1.5 max-h-48 overflow-y-auto scrollbar-thin">
                {emotionHistory.slice(0, 8).map((rec) => (
                  <li
                    key={rec.id}
                    className="p-2.5 bg-[#FFFDFC] rounded-lg border border-[#F0E6E9] text-xs flex justify-between items-center"
                  >
                    <span className="font-bold text-[#55474A]">
                      {rec.emotionLabel} ({rec.intensity}) · Reason: {rec.reasonLabel}
                    </span>
                    <span className="text-[11px] text-[#8E7E82]">{rec.timestamp}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Data Backup & Privacy Notice */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-xs">
            <h3 className="text-sm font-extrabold text-[#524447] mb-2 flex items-center gap-2">
              <Download size={16} className="text-[#718D75]" /> Privacy, Backup & Data Controls
            </h3>
            <p className="text-xs text-[#736367] leading-relaxed mb-4">
              All child information, photos, preferences, and communication records are securely stored and encrypted under your caregiver account.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportAllData}
                className="px-5 py-2.5 rounded-full bg-[#718D75] text-white font-extrabold text-xs shadow-xs hover:bg-[#5C7760] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} /> Download Complete Backup (.JSON)
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset all local data? This cannot be undone.")) {
                    clearAllUserData();
                  }
                }}
                className="px-4 py-2.5 rounded-full bg-white border border-[#E2B7B7] text-[#B83E3E] font-bold text-xs hover:bg-[#FDF2F2] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={14} /> Reset Local Data
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 p-3 bg-[#FBF7F8] rounded-xl text-[11px] text-[#8C7A7E] border border-[#EFE7E9]">
              <Info size={15} className="shrink-0 text-[#C9879C]" />
              <span>
                Disclaimer: Sense Calm is an assistive communication companion and is not a medical or clinical diagnostic tool.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 6: VOICE & TEXT-TO-SPEECH DIAGNOSTICS
      ======================================================== */}
      {activeTab === "voice" && (
        <div className="p-5 sm:p-7 rounded-[26px] bg-white border-2 border-[#EADFE0] shadow-xs animate-float-up">
          <VoiceDiagnosticsModal isInline={true} />
        </div>
      )}
    </div>
  );
}
