import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import type { Preferences } from "@/types";
import {
  Settings2,
  Volume2,
  VolumeX,
  Eye,
  Sparkles,
  Leaf,
  ArrowLeft,
  Languages,
  Mic,
} from "lucide-react";

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description: string;
  icon: typeof Eye;
  badge?: string;
}

function SettingToggle({ checked, onChange, label, description, icon: Icon, badge }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-[16px] border-2 border-[#EADFE0] bg-white cursor-pointer hover:bg-[#FDF9FA] transition-all shadow-sm">
      <div className="flex items-center gap-3">
        <Icon size={22} className="text-[#8A7E80] shrink-0" />
        <div className="grid gap-0.5">
          <div className="flex items-center gap-2">
            <strong className="text-[#514B4B] text-sm sm:text-base">{label}</strong>
            {badge && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EBF3EC] text-[#4F7354]">
                {badge}
              </span>
            )}
          </div>
          <small className="text-[#817878] text-xs leading-relaxed">{description}</small>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-all shrink-0 ${
          checked ? "bg-[#718D75]" : "bg-[#D5C5C9]"
        }`}
        aria-pressed={checked}
        aria-label={label}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </label>
  );
}

export default function SensoryPage() {
  const {
    preferences,
    updatePreferences,
    showNotice,
    speak,
    availableVoices,
    isTeluguSupported,
  } = useApp();

  const [onBreak, setOnBreak] = useState(false);
  const [local, setLocal] = useState<Preferences>(preferences);

  // Sync with global preferences if updated elsewhere
  useEffect(() => {
    setLocal(preferences);
  }, [preferences]);

  const handleSave = () => {
    updatePreferences(local);
    showNotice("Your comfort settings are saved. ♡");
  };

  const handleTestVoice = () => {
    const sampleText =
      local.ttsLanguage === "te"
        ? "నమస్కారం! సెన్స్ కామ్ కు స్వాగతం. ప్రశాంతంగా ఉండండి."
        : "Hello! Welcome to Sense Calm. A gentle space to grow and smile.";
    speak(sampleText, local.ttsLanguage);
  };

  if (onBreak) {
    return (
      <div className="w-full flex-1 px-5 py-8 flex items-center justify-center">
        <div className="text-center max-w-md animate-float-up">
          <div className="text-6xl mb-6 gentle-bob">🌿</div>
          <h3
            className="text-[#5C6F5E] font-bold text-2xl mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            It's okay to pause.
          </h3>
          <p className="text-[#777572] text-lg leading-relaxed mb-8">
            Take a few quiet moments. Breathe slowly. You can come back whenever you feel ready.
          </p>
          <button
            onClick={() => setOnBreak(false)}
            className="px-6 py-3.5 rounded-full bg-[#718D75] text-white font-bold border-0 cursor-pointer transition-all hover:bg-[#5F7D64] hover:-translate-y-0.5 shadow-md"
          >
            I'm ready to come back ♡
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-8 max-w-[680px] mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E5EFF7] rounded-full text-[#58758C] font-bold text-xs sm:text-sm mb-3 shadow-sm">
          <Settings2 size={16} /> Comfort & Voice Settings
        </div>
        <h1
          className="text-[#5C6F5E] font-bold text-3xl sm:text-4xl"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Make this space comfortable ☁
        </h1>
        <p className="mt-2 text-[#777572] text-sm sm:text-base">
          Customize speech, audio, and visual comforts to suit your child's needs.
        </p>
      </div>

      <div className="grid gap-3">
        {/* 1. SILENT MODE AUDIO CONTROL */}
        <SettingToggle
          checked={local.silentMode}
          onChange={(v) => setLocal({ ...local, silentMode: v, muted: v })}
          label="Silent Mode (Audio Mute)"
          description="Mutes all spoken words and sound effects. Visual alerts and animations continue normally."
          icon={local.silentMode ? VolumeX : Volume2}
          badge={local.silentMode ? "Audio Muted" : "Audio Active"}
        />

        {/* 2. TEXT-TO-SPEECH (TTS) LANGUAGE & VOICE CARD */}
        <div className="p-4 sm:p-5 rounded-[18px] border-2 border-[#EADFE0] bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <Languages size={20} className="text-[#C9879C]" />
              <strong className="text-[#514B4B] text-sm sm:text-base">
                Spoken Language & Voice
              </strong>
            </div>
            {isTeluguSupported ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF3EC] text-[#4F7354]">
                Telugu Voice Ready 🇮🇳
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#8C6218]">
                Natural Fallback Active
              </span>
            )}
          </div>

          {/* Language Switch Pills */}
          <div className="grid grid-cols-2 gap-2 mb-3.5">
            <button
              type="button"
              onClick={() => setLocal({ ...local, ttsLanguage: "en" })}
              className={`py-2 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2
                ${
                  local.ttsLanguage === "en"
                    ? "border-[#718D75] bg-[#EAF5ED] text-[#385D40] shadow-sm"
                    : "border-[#ECE2E4] bg-[#FAF7F8] text-[#695E61] hover:bg-[#F5EDF0]"
                }`}
            >
              <span>🇬🇧 / 🇺🇸</span>
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => setLocal({ ...local, ttsLanguage: "te" })}
              className={`py-2 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2
                ${
                  local.ttsLanguage === "te"
                    ? "border-[#C9879C] bg-[#FCEFF2] text-[#8F596B] shadow-sm"
                    : "border-[#ECE2E4] bg-[#FAF7F8] text-[#695E61] hover:bg-[#F5EDF0]"
                }`}
            >
              <span>🇮🇳</span>
              <span>Telugu (తెలుగు)</span>
            </button>
          </div>

          {/* Speech Rate Slider */}
          <div className="mt-3 pt-3 border-t border-[#F2EAEC]">
            <div className="flex justify-between items-center text-xs font-bold text-[#6B5F62] mb-1">
              <span>Speaking Speed</span>
              <span className="text-[#718D75]">{local.ttsRate || 0.88}x (Calm & Gentle)</span>
            </div>
            <input
              type="range"
              min="0.65"
              max="1.15"
              step="0.05"
              value={local.ttsRate || 0.88}
              onChange={(e) => setLocal({ ...local, ttsRate: parseFloat(e.target.value) })}
              className="w-full accent-[#718D75] cursor-pointer"
            />
          </div>

          {/* Voice Dropdown (Available Browser Voices) */}
          {availableVoices.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#F2EAEC]">
              <label htmlFor="voiceSelect" className="block text-xs font-bold text-[#6B5F62] mb-1">
                Preferred Browser Voice
              </label>
              <select
                id="voiceSelect"
                value={local.ttsVoiceURI || ""}
                onChange={(e) => setLocal({ ...local, ttsVoiceURI: e.target.value })}
                className="w-full p-2 border border-[#E0D4D7] rounded-xl text-xs bg-[#FAF7F8] text-[#55474B] outline-none"
              >
                <option value="">-- Best Available Natural Voice (Auto) --</option>
                {availableVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Test Voice Button */}
          <div className="mt-3.5 pt-3 border-t border-[#F2EAEC] flex items-center justify-between">
            <span className="text-xs text-[#8F7E83]">Try listening to the configured voice:</span>
            <button
              type="button"
              onClick={handleTestVoice}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF5ED] border border-[#C5DEC8] text-[#385D40] text-xs font-bold hover:bg-[#DCEFE1] transition-all"
            >
              <Mic size={13} />
              <span>Test Voice</span>
            </button>
          </div>
        </div>

        {/* 3. OTHER COMFORT PREFERENCES */}
        <SettingToggle
          checked={local.speechEnabled}
          onChange={(v) => setLocal({ ...local, speechEnabled: v })}
          label="Enable Spoken Messages"
          description="Uses text-to-speech for cards, clues, and greetings."
          icon={Volume2}
        />
        <SettingToggle
          checked={local.reducedMotion}
          onChange={(v) => setLocal({ ...local, reducedMotion: v })}
          label="Reduce Animations"
          description="Limits moving effects and bouncy transitions."
          icon={Sparkles}
        />
        <SettingToggle
          checked={local.quietMode}
          onChange={(v) => setLocal({ ...local, quietMode: v })}
          label="Quiet Mode"
          description="Turns off all decorative animations at once."
          icon={Leaf}
        />
        <SettingToggle
          checked={local.simplified}
          onChange={(v) => setLocal({ ...local, simplified: v })}
          label="Simplified Layout"
          description="Uses a calmer, minimal visual view."
          icon={Eye}
        />
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSave}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#718D75] text-white font-extrabold text-sm border-0 cursor-pointer transition-all hover:bg-[#5F7D64] hover:-translate-y-0.5 shadow-md"
        >
          Save Comfort Settings ♡
        </button>
        <button
          onClick={() => setOnBreak(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#F6E9E7] text-[#77565A] font-extrabold text-sm border-0 cursor-pointer transition-all hover:bg-[#F0DFDC]"
        >
          <Leaf size={16} /> I want a break
        </button>
      </div>

      <button
        onClick={() => setLocal(preferences)}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 text-[#A29A97] text-xs font-bold transition-all hover:text-[#777572]"
      >
        <ArrowLeft size={13} /> Reset to last saved settings
      </button>
    </div>
  );
}
