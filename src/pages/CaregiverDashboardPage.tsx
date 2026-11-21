import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import CustomAACCardModal from "@/components/CustomAACCardModal";
import type { GameDifficulty, TimelineStepItem, AACCardItem } from "@/types";
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
} from "lucide-react";

type CaregiverTab = "profile" | "aac" | "learning" | "routine" | "insights";

export default function CaregiverDashboardPage({ onExit }: { onExit: () => void }) {
  const {
    childProfile,
    updateChildProfile,
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

  const handleAddTimelineStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepTitle.trim()) return;

    const newStep: TimelineStepItem = {
      id: `custom-step-${Date.now()}`,
      title: newStepTitle.trim(),
      teluguTitle: newStepTelugu.trim() || newStepTitle.trim(),
      timeEstimate: newStepTime.trim() || "Anytime",
      emoji: newStepEmoji.trim() || "⭐",
      category: "afternoon",
      isCompleted: false,
    };

    addTimelineStep(newStep);
    setNewStepTitle("");
    setNewStepTelugu("");
    showNotice("New timeline routine step added!");
  };

  const handleExitDashboard = () => {
    setIsCaregiverAuthenticated(false);
    onExit();
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
          <div className="w-12 h-12 rounded-2xl bg-[#EAF5ED] text-[#3E6546] flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-[#4B3D40]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Teacher & Caregiver Portal
            </h1>
            <p className="text-xs text-[#7A6A6E]">
              Personalize communication cards, manage learning difficulty, and view private insights.
            </p>
          </div>
        </div>

        <button
          onClick={handleExitDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5ECEF] text-[#69555A] font-extrabold text-xs hover:bg-[#EEDFE3] transition-all shrink-0"
        >
          <LogOut size={14} />
          <span>Return to Child Mode</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {[
          { key: "profile", label: "Child Profile", icon: User },
          { key: "aac", label: "AAC & Familiar People", icon: MessageSquarePlus },
          { key: "learning", label: "Learning & Difficulty", icon: Gamepad2 },
          { key: "routine", label: "Routine Timeline", icon: CalendarCheck },
          { key: "insights", label: "History & Insights", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as CaregiverTab)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap border-2 transition-all flex items-center gap-2
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
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-sm">
            <h2 className="text-base font-extrabold text-[#524447] mb-4 flex items-center gap-2">
              <User size={18} className="text-[#718D75]" /> Personalised Communication Profile
            </h2>

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
                    className={`flex-1 py-2 px-3 rounded-xl border-2 text-xs font-extrabold transition-all ${
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
                    className={`flex-1 py-2 px-3 rounded-xl border-2 text-xs font-extrabold transition-all ${
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
                  className="px-4 py-2 rounded-xl bg-[#718D75] text-white text-xs font-bold hover:bg-[#5C7760] transition-all"
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
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-sm">
            <h3 className="text-sm font-extrabold text-[#524447] mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-[#EBCB79]" /> Child's Frequently Used Sentences
            </h3>
            {childProfile.frequentlyUsedSentences.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {childProfile.frequentlyUsedSentences.map((sentence, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-full bg-[#FAF5F7] border border-[#ECD9DF] text-xs font-bold text-[#6D5D61]"
                  >
                    "{sentence}"
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#8F7E83]">No frequently used sentences recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: AAC & FAMILIAR PEOPLE
      ======================================================== */}
      {activeTab === "aac" && (
        <div className="animate-float-up">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <h2 className="text-base font-extrabold text-[#524447]">
                Custom AAC Picture Cards ({customAACCards.length})
              </h2>
              <p className="text-xs text-[#7A6A6E]">
                Photos of mother, father, teachers, favorite snacks, or school items.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCard(undefined);
                setIsAddCardOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#718D75] text-white font-extrabold text-xs shadow-sm hover:bg-[#5C7760] transition-all"
            >
              <Plus size={15} /> Add Picture Card
            </button>
          </div>

          {customAACCards.length === 0 ? (
            <div className="p-8 rounded-[24px] bg-white border-2 border-dashed border-[#DACCD0] text-center">
              <span className="text-4xl block mb-2">📸</span>
              <p className="text-sm font-bold text-[#635558]">No custom cards added yet.</p>
              <p className="text-xs text-[#8C7C80] mt-1 max-w-sm mx-auto">
                Add photos of familiar family members or special items to personalize your child's communication board.
              </p>
              <button
                onClick={() => setIsAddCardOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#718D75] text-white font-extrabold text-xs shadow-sm hover:bg-[#5C7760]"
              >
                <Plus size={15} /> Add First Picture Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {customAACCards.map((card) => (
                <div
                  key={card.id}
                  className="p-3.5 rounded-2xl bg-white border-2 border-[#EADFE0] shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {card.imageUrl ? (
                      <img
                        src={card.imageUrl}
                        alt={card.text}
                        className="w-12 h-12 rounded-xl object-cover border border-[#E7CCD4] shrink-0"
                      />
                    ) : (
                      <span className="text-3xl shrink-0">{card.emoji}</span>
                    )}
                    <div className="min-w-0">
                      <strong className="text-sm font-extrabold text-[#4F3E42] block truncate">
                        {card.text}
                      </strong>
                      <span className="text-xs text-[#7B696D] block truncate">
                        {card.teluguText}
                      </span>
                      {card.familiarRole && (
                        <span className="text-[10px] text-[#A65B72] font-extrabold block">
                          Role: {card.familiarRole}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => deleteCustomAACCard(card.id)}
                      className="p-2 rounded-lg text-[#B83E3E] hover:bg-[#FDF0F0] transition-colors"
                      title="Delete card"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: LEARNING & DIFFICULTY
      ======================================================== */}
      {activeTab === "learning" && (
        <div className="grid gap-6 animate-float-up">
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-sm">
            <h2 className="text-base font-extrabold text-[#524447] mb-2 flex items-center gap-2">
              <Gamepad2 size={18} className="text-[#718D75]" /> Learning Games Difficulty Level
            </h2>
            <p className="text-xs text-[#77676B] mb-4">
              Select the default difficulty for all 5 games (Picture Detective, Emotion Explorer, Build the Sentence, Sequences, and Situations).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "beginner",
                  label: "Beginner Level",
                  desc: "Large images, 2 choices, gentle hints, simple picture matching.",
                  emoji: "🌱",
                  bg: "bg-[#EFF8F2] border-[#CDE5D4]",
                },
                {
                  id: "intermediate",
                  label: "Intermediate Level",
                  desc: "3 to 4 choices, simple visual clues, basic sentence construction.",
                  emoji: "🌿",
                  bg: "bg-[#FFF9EA] border-[#F4E3B7]",
                },
                {
                  id: "advanced",
                  label: "Advanced Level",
                  desc: "Complex visual sequences, multi-step clues, detailed sentence building.",
                  emoji: "🌳",
                  bg: "bg-[#FDF0ED] border-[#F2C7BD]",
                },
              ].map((lvl) => {
                const isSelected = preferences.gameDifficulty === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => updatePreferences({ gameDifficulty: lvl.id as GameDifficulty })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${lvl.bg} ${
                      isSelected
                        ? "ring-3 ring-[#718D75] border-[#718D75] shadow-md scale-[1.02]"
                        : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div>
                      <span className="text-3xl block mb-1">{lvl.emoji}</span>
                      <strong className="text-sm font-extrabold text-[#4F3F42] block mb-1">
                        {lvl.label}
                      </strong>
                      <p className="text-xs text-[#716165] leading-relaxed">{lvl.desc}</p>
                    </div>
                    {isSelected && (
                      <span className="mt-3 text-[11px] font-extrabold text-[#34593C] flex items-center gap-1">
                        Active Level ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-sm">
            <h3 className="text-sm font-extrabold text-[#524447] mb-3">
              Learning Practice Performance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-[#FAF5F7] rounded-xl border border-[#EFE5E8]">
                <span className="text-xs text-[#8A797D] font-bold block">Games Completed</span>
                <strong className="text-xl font-extrabold text-[#718D75]">
                  {progress.totalGamesCompleted}
                </strong>
              </div>
              <div className="p-3 bg-[#FAF5F7] rounded-xl border border-[#EFE5E8]">
                <span className="text-xs text-[#8A797D] font-bold block">Practice Accuracy</span>
                <strong className="text-xl font-extrabold text-[#73531E]">
                  {progress.totalAnswers
                    ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100)
                    : 0}
                  %
                </strong>
              </div>
              <div className="p-3 bg-[#FAF5F7] rounded-xl border border-[#EFE5E8] col-span-2 sm:col-span-1">
                <span className="text-xs text-[#8A797D] font-bold block">Questions Answered</span>
                <strong className="text-xl font-extrabold text-[#8F596B]">
                  {progress.totalAnswers}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: ROUTINE TIMELINE
      ======================================================== */}
      {activeTab === "routine" && (
        <div className="grid gap-6 animate-float-up">
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-sm">
            <h2 className="text-base font-extrabold text-[#524447] mb-2 flex items-center gap-2">
              <CalendarCheck size={18} className="text-[#718D75]" /> Daily Routine Timeline Management
            </h2>
            <p className="text-xs text-[#77676B] mb-4">
              Add custom routine activities for your child's specific daily schedule.
            </p>

            <form onSubmit={handleAddTimelineStepSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 mb-4">
              <input
                type="text"
                placeholder="Step Title (e.g. Piano Practice)"
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                required
                className="px-3.5 py-2.5 rounded-xl border border-[#D5C2C7] text-xs font-semibold outline-none"
              />
              <input
                type="text"
                placeholder="Telugu Translation (Optional)"
                value={newStepTelugu}
                onChange={(e) => setNewStepTelugu(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#D5C2C7] text-xs font-semibold outline-none"
              />
              <input
                type="text"
                placeholder="Time (e.g. 5:00 PM)"
                value={newStepTime}
                onChange={(e) => setNewStepTime(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#D5C2C7] text-xs font-semibold outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#718D75] text-white font-extrabold text-xs hover:bg-[#5C7760] transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={14} /> Add Step
              </button>
            </form>

            {/* List of Timeline Steps with Delete */}
            <div className="grid gap-2">
              {timelineSteps.map((step) => (
                <div
                  key={step.id}
                  className="p-3 rounded-xl border border-[#EAE0E3] bg-[#FCF9FA] flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{step.emoji}</span>
                    <span className="font-extrabold text-[#8F7D82] shrink-0 uppercase text-[10px]">
                      {step.timeEstimate}
                    </span>
                    <strong className="font-bold text-[#514346] truncate">{step.title}</strong>
                    <span className="text-[#817276] truncate hidden sm:inline">
                      ({step.teluguTitle})
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTimelineStep(step.id)}
                    className="p-1.5 rounded-lg text-[#B83E3E] hover:bg-[#FDEEEE] shrink-0"
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
          TAB 5: HISTORY & INSIGHTS (Privacy Protected)
      ======================================================== */}
      {activeTab === "insights" && (
        <div className="grid gap-6 animate-float-up">
          {/* Emotion Check-in Trends */}
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-sm">
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
          <div className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#EADFE0] shadow-sm">
            <h3 className="text-sm font-extrabold text-[#524447] mb-2 flex items-center gap-2">
              <Download size={16} className="text-[#718D75]" /> Privacy, Backup & Data Controls
            </h3>
            <p className="text-xs text-[#736367] leading-relaxed mb-4">
              All child information, photos, preferences, and communication records are kept strictly in local device storage. No data is sent to external cloud servers.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportAllData}
                className="px-5 py-2.5 rounded-full bg-[#718D75] text-white font-extrabold text-xs shadow-sm hover:bg-[#5C7760] transition-all flex items-center gap-1.5"
              >
                <Download size={14} /> Download Complete Backup (.JSON)
              </button>

              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset all local data? This cannot be undone.")) {
                    clearAllUserData();
                  }
                }}
                className="px-4 py-2.5 rounded-full bg-white border border-[#E2B7B7] text-[#B83E3E] font-bold text-xs hover:bg-[#FDF2F2] transition-all flex items-center gap-1.5"
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
    </div>
  );
}
