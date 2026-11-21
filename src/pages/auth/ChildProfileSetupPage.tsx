import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { ModuleName, ChildProfile } from "@/types";
import {
  Sparkles,
  Heart,
  ArrowRight,
  ShieldCheck,
  Volume2,
  Eye,
  Sliders,
  Check,
  Lock,
} from "lucide-react";

interface ChildProfileSetupPageProps {
  onNavigate: (m: ModuleName) => void;
}

const AVATAR_OPTIONS = ["🐰", "🐻", "🐱", "🐶", "🐼", "🦁", "🦊", "🐨", "🦄", "🌟", "🌸", "🦋"];

const COMM_MODES: {
  id: ChildProfile["preferredCommMode"];
  label: string;
  desc: string;
}[] = [
  { id: "aac", label: "AAC Picture Cards", desc: "Taps visual cards to build phrases & speak" },
  { id: "mixed", label: "Mixed Communication", desc: "Uses AAC cards, verbal words, & gestures" },
  { id: "speech", label: "Speech & Visuals", desc: "Speaks aloud and uses visual reminders" },
  { id: "gestures", label: "Gestures & Visuals", desc: "Non-verbal gestures supported by cards" },
];

const SENSITIVITY_OPTIONS = [
  "Loud sudden noises",
  "Bright or flashing lights",
  "Crowded or busy spaces",
  "Certain clothing textures",
  "Unexpected schedule changes",
  "High temperatures",
];

const CALMING_TOOL_OPTIONS = [
  "Guided 4-4-4 breathing",
  "Gentle rain & ocean waves",
  "Dim screen mode",
  "Quiet break corners",
  "Familiar people pictures",
  "Bebbo mascot encouragement",
];

export default function ChildProfileSetupPage({
  onNavigate,
}: ChildProfileSetupPageProps) {
  const { createChildProfile, activeChildProfile, showNotice } = useApp();

  const [name, setName] = useState(activeChildProfile?.name || "");
  const [age, setAge] = useState<string>(activeChildProfile?.age ? String(activeChildProfile.age) : "7");
  const [avatarEmoji, setAvatarEmoji] = useState(activeChildProfile?.avatarEmoji || "🐰");
  const [commMode, setCommMode] = useState<ChildProfile["preferredCommMode"]>(
    activeChildProfile?.preferredCommMode || "aac"
  );
  const [sensitivities, setSensitivities] = useState<string[]>(
    activeChildProfile?.sensorySensitivities || ["Loud sudden noises"]
  );
  const [calmingTools, setCalmingTools] = useState<string[]>(
    activeChildProfile?.favoriteCalmingTools || ["Guided 4-4-4 breathing", "Gentle rain & ocean waves"]
  );
  const [caregiverPIN, setCaregiverPIN] = useState(activeChildProfile?.caregiverPIN || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSensitivity = (item: string) => {
    setSensitivities((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleCalmingTool = (item: string) => {
    setCalmingTools((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg("Please enter your child's or student's name or nickname.");
      return;
    }

    setIsLoading(true);
    const newProfile: Omit<ChildProfile, "id"> = {
      name: cleanName,
      age: parseInt(age, 10) || undefined,
      avatarEmoji,
      preferredCommMode: commMode,
      sensorySensitivities: sensitivities,
      favoriteCalmingTools: calmingTools,
      preferredLanguage: "en",
      preferredVoiceURI: "",
      favoriteCardIds: [],
      favoriteActivities: [],
      frequentlyUsedSentences: [],
      caregiverPIN: caregiverPIN.trim(),
      notes: "",
    };

    const created = await createChildProfile(newProfile);
    setIsLoading(false);

    if (created) {
      showNotice(`Child profile for ${cleanName} is ready! ♡`);
      onNavigate("caregiver");
    } else {
      setErrorMsg("Could not save child profile. Please check your inputs.");
    }
  };

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-10 max-w-[680px] mx-auto animate-fade-in">
      <div className="bg-white rounded-[32px] border-2 border-[#EADFE0] p-6 sm:p-9 shadow-sm">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EAF5ED] rounded-full text-[#385D40] text-xs font-extrabold mb-3 shadow-xs">
            <Sparkles size={14} /> Child Communication Profile Setup
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#5C6F5E] tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Personalize Sense Calm for Your Child
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#777572]">
            Help Bebbo adapt communication cards, sensory preferences, and gentle comfort.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#FDF0ED] border border-[#F2C6BB] text-xs text-[#B85741] font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Name & Avatar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F5] border-2 border-[#EFE5E7] space-y-4">
            <h3 className="font-extrabold text-sm sm:text-base text-[#52494C] flex items-center gap-2">
              <span>1. Child's Name & Companion Avatar</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#675B5F] mb-1">
                  Child's Name or First Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Leo / Ananya"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E6D9DC] bg-white text-sm text-[#4E4447] placeholder:text-[#A89FA3] focus:border-[#718D75] focus:outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#675B5F] mb-1">
                  Age (Optional)
                </label>
                <input
                  type="number"
                  min="2"
                  max="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#E6D9DC] bg-white text-sm text-[#4E4447] focus:border-[#718D75] focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-bold text-[#675B5F] mb-1.5">
                Choose Mascot / Companion Avatar
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatarEmoji(emoji)}
                    className={`w-11 h-11 rounded-xl text-2xl transition-all cursor-pointer flex items-center justify-center border-2
                      ${
                        avatarEmoji === emoji
                          ? "border-[#718D75] bg-[#EAF5ED] scale-110 shadow-xs"
                          : "border-[#ECE2E4] bg-white hover:bg-[#FAF4F5]"
                      }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Communication Mode */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F5] border-2 border-[#EFE5E7] space-y-3">
            <h3 className="font-extrabold text-sm sm:text-base text-[#52494C]">
              2. Preferred Communication Style
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {COMM_MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCommMode(item.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-0.5
                    ${
                      commMode === item.id
                        ? "border-[#718D75] bg-[#EAF5ED] text-[#385D40] shadow-xs"
                        : "border-[#ECE2E4] bg-white text-[#5F5356] hover:bg-[#FAF6F7]"
                    }`}
                >
                  <div className="text-xs font-extrabold flex items-center justify-between">
                    <span>{item.label}</span>
                    {commMode === item.id && <Check size={14} />}
                  </div>
                  <div className="text-[11px] text-[#817578]">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Sensory Sensitivities */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F5] border-2 border-[#EFE5E7] space-y-3">
            <h3 className="font-extrabold text-sm sm:text-base text-[#52494C]">
              3. Sensory Sensitivities (Select any that apply)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SENSITIVITY_OPTIONS.map((item) => {
                const isSelected = sensitivities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleSensitivity(item)}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between
                      ${
                        isSelected
                          ? "border-[#D98787] bg-[#FDF2F2] text-[#8F3E3E]"
                          : "border-[#ECE2E4] bg-white text-[#63575A] hover:bg-[#FAF6F7]"
                      }`}
                  >
                    <span>{item}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Calming Preferences */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F5] border-2 border-[#EFE5E7] space-y-3">
            <h3 className="font-extrabold text-sm sm:text-base text-[#52494C]">
              4. Favorite Calming & Comfort Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CALMING_TOOL_OPTIONS.map((item) => {
                const isSelected = calmingTools.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleCalmingTool(item)}
                    className={`py-2 px-3 rounded-xl border-2 text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between
                      ${
                        isSelected
                          ? "border-[#718D75] bg-[#EAF5ED] text-[#385D40]"
                          : "border-[#ECE2E4] bg-white text-[#63575A] hover:bg-[#FAF6F7]"
                      }`}
                  >
                    <span>{item}</span>
                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Caregiver PIN (Optional) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F5] border-2 border-[#EFE5E7] space-y-2">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-[#8F7D82]" />
              <label className="text-xs font-bold text-[#52494C]">
                Optional 4-Digit Caregiver PIN for Settings Protection
              </label>
            </div>
            <p className="text-[11px] text-[#817578]">
              Leave empty if you only want the simple math navigation barrier.
            </p>
            <input
              type="password"
              maxLength={4}
              value={caregiverPIN}
              onChange={(e) => setCaregiverPIN(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 1234"
              className="w-36 px-3.5 py-2 rounded-xl border-2 border-[#E6D9DC] bg-white text-sm text-[#4E4447] text-center tracking-widest font-mono focus:border-[#718D75] focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-5 rounded-full bg-[#718D75] text-white text-sm font-extrabold shadow-sm hover:bg-[#5E7962] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span>Saving Profile...</span>
              ) : (
                <>
                  <span>Save Profile & Start Exploring ♡</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="py-3 px-5 rounded-full border-2 border-[#E6D9DC] text-xs font-extrabold text-[#776B6E] hover:bg-[#FDF9FA] transition-all cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
