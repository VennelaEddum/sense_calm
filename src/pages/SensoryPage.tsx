import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import type { Preferences, SensoryTheme, AmbientSoundType } from "@/types";
import {
  Settings2,
  Volume2,
  VolumeX,
  Eye,
  Sparkles,
  Leaf,
  Languages,
  Mic,
  Palette,
  Sun,
  Moon,
  Clock,
  Waves,
  CloudRain,
  Wind,
  Square,
  Play,
  RotateCcw,
} from "lucide-react";

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description: string;
  icon: typeof Eye;
  badge?: string;
}

function SettingToggle({
  checked,
  onChange,
  label,
  description,
  icon: Icon,
  badge,
}: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-[16px] border-2 border-[#EADFE0] bg-white cursor-pointer hover:bg-[#FDF9FA] transition-all shadow-xs">
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
        className={`relative w-12 h-7 rounded-full transition-all shrink-0 cursor-pointer ${
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
    setBreathingModalOpen,
  } = useApp();

  const [local, setLocal] = useState<Preferences>(preferences);

  // Break countdown state
  const [breakTimerSeconds, setBreakTimerSeconds] = useState<number | null>(null);
  const [breakTotalSeconds, setBreakTotalSeconds] = useState<number | null>(null);
  const breakIntervalRef = useRef<number | null>(null);

  // Sync with global preferences
  useEffect(() => {
    setLocal(preferences);
  }, [preferences]);

  // Break countdown ticker
  useEffect(() => {
    if (breakTimerSeconds === null) return;

    if (breakTimerSeconds <= 0) {
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
      setBreakTimerSeconds(null);
      setBreakTotalSeconds(null);
      showNotice("Break complete! Welcome back to Sense Calm. ♡");
      return;
    }

    breakIntervalRef.current = window.setInterval(() => {
      setBreakTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
    };
  }, [breakTimerSeconds, showNotice]);

  const handleStartBreak = (minutes: number) => {
    const secs = minutes * 60;
    setBreakTotalSeconds(secs);
    setBreakTimerSeconds(secs);
    showNotice(`Started ${minutes} minute quiet break. Take your time!`);
  };

  const handleCancelBreak = () => {
    if (breakIntervalRef.current) clearInterval(breakIntervalRef.current);
    setBreakTimerSeconds(null);
    setBreakTotalSeconds(null);
  };

  const handleSave = () => {
    updatePreferences(local);
    showNotice("Your comfort settings are saved. ♡");
  };

  const handleThemeSelect = (theme: SensoryTheme) => {
    const updated = { ...local, sensoryTheme: theme };
    setLocal(updated);
    updatePreferences({ sensoryTheme: theme });
  };

  const handleBrightnessSelect = (level: "normal" | "soft" | "dim") => {
    const updated = { ...local, brightnessOverlay: level };
    setLocal(updated);
    updatePreferences({ brightnessOverlay: level });
  };

  const handleAmbientSelect = (sound: AmbientSoundType) => {
    const updated = { ...local, ambientSound: sound };
    setLocal(updated);
    updatePreferences({ ambientSound: sound });
  };

  const handleAmbientVolumeChange = (vol: number) => {
    const updated = { ...local, ambientVolume: vol };
    setLocal(updated);
    updatePreferences({ ambientVolume: vol });
  };

  const handleTestVoice = () => {
    const sampleText =
      local.ttsLanguage === "te"
        ? "నమస్కారం! సెన్స్ కామ్ కు స్వాగతం. ప్రశాంతంగా ఉండండి."
        : "Hello! Welcome to Sense Calm. A gentle space to grow and smile.";
    speak(sampleText, local.ttsLanguage);
  };

  const themeList: {
    id: SensoryTheme;
    name: string;
    bg: string;
    border: string;
    textColor: string;
  }[] = [
    {
      id: "default",
      name: "Pastel Rose",
      bg: "bg-[#FCEFF2]",
      border: "border-[#E8CBD5]",
      textColor: "text-[#754D5B]",
    },
    {
      id: "sage",
      name: "Soft Sage",
      bg: "bg-[#EFF5F0]",
      border: "border-[#C5DEC8]",
      textColor: "text-[#3D6945]",
    },
    {
      id: "cream",
      name: "Warm Cream",
      bg: "bg-[#FAF7F0]",
      border: "border-[#E7DEC8]",
      textColor: "text-[#6B5A3D]",
    },
    {
      id: "sky",
      name: "Sky Blue",
      bg: "bg-[#EDF5FA]",
      border: "border-[#C4DEF0]",
      textColor: "text-[#2B5778]",
    },
    {
      id: "night",
      name: "Dim Night",
      bg: "bg-[#1E232A]",
      border: "border-[#3A4554]",
      textColor: "text-[#E2E8F0]",
    },
  ];

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-8 max-w-[720px] mx-auto">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E5EFF7] rounded-full text-[#58758C] font-bold text-xs sm:text-sm mb-3 shadow-xs">
          <Settings2 size={16} /> Comfort & Sensory Controls
        </div>
        <h1
          className="text-[#5C6F5E] font-bold text-3xl sm:text-4xl"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Make this space comfortable ☁
        </h1>
        <p className="mt-2 text-[#777572] text-sm sm:text-base">
          Customize sensory themes, ambient calming sounds, breathing exercises, and voice controls.
        </p>
      </div>

      {/* Active Break Timer Banner */}
      {breakTimerSeconds !== null && (
        <div className="mb-6 p-4 rounded-[20px] bg-[#EBF3EC] border-2 border-[#C5DEC8] shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-spin-slow">🌿</span>
            <div>
              <strong className="text-[#385D40] text-sm sm:text-base block">
                Quiet Break in Progress
              </strong>
              <p className="text-xs text-[#5D8064]">
                Time remaining:{" "}
                <span className="font-extrabold text-[#2F5236] text-sm">
                  {Math.floor(breakTimerSeconds / 60)}:
                  {String(breakTimerSeconds % 60).padStart(2, "0")}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancelBreak}
            className="px-3.5 py-1.5 rounded-full bg-white border border-[#BBD6BF] text-[#385D40] text-xs font-bold hover:bg-[#F0F8F2] cursor-pointer"
          >
            End Break
          </button>
        </div>
      )}

      {/* SECTION 1: GUIDED BREATHING LAUNCHER */}
      <div className="mb-4 p-4 sm:p-5 rounded-[20px] bg-gradient-to-r from-[#EBF4ED] to-[#FAF1E8] border-2 border-[#D2E4D5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-xs shrink-0">
            🌸
          </div>
          <div>
            <h3 className="text-[#3B6343] font-extrabold text-base">
              4-4-4 Calming Guided Breathing
            </h3>
            <p className="text-xs text-[#5B7761] mt-0.5">
              Follow expanding & contracting visuals. Works 100% silently or with gentle chime.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setBreathingModalOpen(true)}
          className="px-4 py-2.5 rounded-full bg-[#5D8562] text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-[#4E7353] hover:scale-[1.02] transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Leaf size={15} />
          <span>Open Breathing Visual</span>
        </button>
      </div>

      <div className="grid gap-4">
        {/* SECTION 2: SILENT MODE TOGGLE */}
        <SettingToggle
          checked={local.silentMode}
          onChange={(v) => {
            setLocal({ ...local, silentMode: v, muted: v });
            updatePreferences({ silentMode: v, muted: v });
          }}
          label="Silent Mode (Audio Mute)"
          description="Mutes all spoken words and sound effects immediately. Visual alerts and animations continue normally."
          icon={local.silentMode ? VolumeX : Volume2}
          badge={local.silentMode ? "Audio Muted" : "Audio Active"}
        />

        {/* SECTION 3: SENSORY THEME PALETTE */}
        <div className="p-4 sm:p-5 rounded-[20px] border-2 border-[#EADFE0] bg-white shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={20} className="text-[#C9879C]" />
            <strong className="text-[#514B4B] text-sm sm:text-base">
              Sensory Color Palette
            </strong>
          </div>
          <p className="text-xs text-[#817878] mb-3">
            Choose a calming background tint that relaxes your child's eyes.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {themeList.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleThemeSelect(t.id)}
                className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer text-center
                  ${t.bg} ${t.border}
                  ${
                    local.sensoryTheme === t.id
                      ? "ring-2 ring-offset-2 ring-[#718D75] scale-[1.03] shadow-xs"
                      : "opacity-80 hover:opacity-100"
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border border-black/10 ${t.bg} shadow-inner`}
                />
                <span className={`text-[11px] font-extrabold ${t.textColor}`}>
                  {t.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 4: SCREEN BRIGHTNESS & LIGHT SENSITIVITY */}
        <div className="p-4 sm:p-5 rounded-[20px] border-2 border-[#EADFE0] bg-white shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Sun size={20} className="text-[#E09852]" />
            <strong className="text-[#514B4B] text-sm sm:text-base">
              Screen Brightness & Dimmer
            </strong>
          </div>
          <p className="text-xs text-[#817878] mb-3">
            Helpful for children sensitive to bright screens and harsh lighting.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: "normal", label: "Normal", desc: "100% clarity" },
                { id: "soft", label: "Soft Dim", desc: "15% light reduction" },
                { id: "dim", label: "Extra Dim", desc: "35% soft shade" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleBrightnessSelect(opt.id)}
                className={`py-2 px-2.5 rounded-xl border-2 text-center transition-all cursor-pointer
                  ${
                    local.brightnessOverlay === opt.id
                      ? "border-[#718D75] bg-[#EAF5ED] text-[#385D40] font-extrabold shadow-xs"
                      : "border-[#ECE2E4] bg-[#FAF7F8] text-[#695E61] hover:bg-[#F5EDF0]"
                  }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div className="text-[10px] text-[#817878] mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 5: CALMING AMBIENT SOUNDS (WEB AUDIO SYNTHESIZER) */}
        <div className="p-4 sm:p-5 rounded-[20px] border-2 border-[#EADFE0] bg-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Waves size={20} className="text-[#5B92B0]" />
              <strong className="text-[#514B4B] text-sm sm:text-base">
                Calming Ambient Background Sound
              </strong>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5F2FA] text-[#2C6382]">
              100% Offline Synthesizer
            </span>
          </div>
          <p className="text-xs text-[#817878] mb-3">
            Continuous soothing sound synthesis generated locally through Web Audio API.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {(
              [
                { id: "none", label: "No Sound", icon: VolumeX },
                { id: "rain", label: "Gentle Rain", icon: CloudRain },
                { id: "waves", label: "Ocean Waves", icon: Waves },
                { id: "forest", label: "Forest Wind", icon: Wind },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => handleAmbientSelect(id)}
                className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer
                  ${
                    local.ambientSound === id
                      ? "border-[#5B92B0] bg-[#EBF5FB] text-[#245D7E] shadow-xs scale-[1.02]"
                      : "border-[#ECE2E4] bg-[#FAF7F8] text-[#695E61] hover:bg-[#F2EDEF]"
                  }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {local.ambientSound !== "none" && (
            <div className="pt-2 border-t border-[#F2EAEC]">
              <div className="flex justify-between items-center text-xs font-bold text-[#6B5F62] mb-1">
                <span>Ambient Volume</span>
                <span className="text-[#5B92B0]">
                  {Math.round((local.ambientVolume || 0.4) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={local.ambientVolume || 0.4}
                onChange={(e) => handleAmbientVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-[#5B92B0] cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* SECTION 6: BREAK TIMER PRESETS */}
        <div className="p-4 sm:p-5 rounded-[20px] border-2 border-[#EADFE0] bg-white shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} className="text-[#718D75]" />
            <strong className="text-[#514B4B] text-sm sm:text-base">
              Quiet Break Timers
            </strong>
          </div>
          <p className="text-xs text-[#817878] mb-3">
            Start a gentle countdown break when your child needs to pause.
          </p>

          <div className="grid grid-cols-4 gap-2">
            {[1, 3, 5, 10].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => handleStartBreak(mins)}
                className="py-2.5 px-2 rounded-xl border-2 border-[#CFE2D3] bg-[#F2F8F4] text-[#345B3A] font-extrabold text-xs sm:text-sm hover:bg-[#E2F0E5] transition-all cursor-pointer text-center"
              >
                {mins} Min
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 7: TEXT-TO-SPEECH (TTS) LANGUAGE & VOICE CARD */}
        <div className="p-4 sm:p-5 rounded-[20px] border-2 border-[#EADFE0] bg-white shadow-xs">
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
              onClick={() => {
                setLocal({ ...local, ttsLanguage: "en" });
                updatePreferences({ ttsLanguage: "en" });
              }}
              className={`py-2 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer
                ${
                  local.ttsLanguage === "en"
                    ? "border-[#718D75] bg-[#EAF5ED] text-[#385D40] shadow-xs"
                    : "border-[#ECE2E4] bg-[#FAF7F8] text-[#695E61] hover:bg-[#F5EDF0]"
                }`}
            >
              <span>🇬🇧 / 🇺🇸</span>
              <span>English</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLocal({ ...local, ttsLanguage: "te" });
                updatePreferences({ ttsLanguage: "te" });
              }}
              className={`py-2 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer
                ${
                  local.ttsLanguage === "te"
                    ? "border-[#C9879C] bg-[#FCEFF2] text-[#8F596B] shadow-xs"
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
              <span className="text-[#718D75]">
                {local.ttsRate || 0.88}x (Calm & Gentle)
              </span>
            </div>
            <input
              type="range"
              min="0.65"
              max="1.15"
              step="0.05"
              value={local.ttsRate || 0.88}
              onChange={(e) =>
                setLocal({ ...local, ttsRate: parseFloat(e.target.value) })
              }
              className="w-full accent-[#718D75] cursor-pointer"
            />
          </div>

          {/* Voice Dropdown */}
          {availableVoices.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#F2EAEC]">
              <label
                htmlFor="voiceSelect"
                className="block text-xs font-bold text-[#6B5F62] mb-1"
              >
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
            <span className="text-xs text-[#8F7E83]">Try listening to the voice:</span>
            <button
              type="button"
              onClick={handleTestVoice}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF5ED] border border-[#C5DEC8] text-[#385D40] text-xs font-bold hover:bg-[#DCEFE1] transition-all cursor-pointer"
            >
              <Mic size={13} />
              <span>Test Voice</span>
            </button>
          </div>
        </div>

        {/* SECTION 8: OTHER COMFORT PREFERENCES */}
        <SettingToggle
          checked={local.speechEnabled}
          onChange={(v) => {
            setLocal({ ...local, speechEnabled: v });
            updatePreferences({ speechEnabled: v });
          }}
          label="Enable Spoken Messages"
          description="Uses text-to-speech for cards, clues, and greetings."
          icon={Volume2}
        />
        <SettingToggle
          checked={local.reducedMotion}
          onChange={(v) => {
            setLocal({ ...local, reducedMotion: v });
            updatePreferences({ reducedMotion: v });
          }}
          label="Reduce Animations"
          description="Limits moving effects and bouncy transitions."
          icon={Sparkles}
        />
        <SettingToggle
          checked={local.quietMode}
          onChange={(v) => {
            setLocal({ ...local, quietMode: v });
            updatePreferences({ quietMode: v });
          }}
          label="Quiet Mode"
          description="Turns off all decorative animations at once."
          icon={Leaf}
        />
        <SettingToggle
          checked={local.simplified}
          onChange={(v) => {
            setLocal({ ...local, simplified: v });
            updatePreferences({ simplified: v });
          }}
          label="Simplified Layout"
          description="Uses a calmer, minimal visual view."
          icon={Eye}
        />
      </div>

      {/* Save Button */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSave}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#718D75] text-white font-extrabold text-sm border-0 cursor-pointer transition-all hover:bg-[#5F7D64] hover:-translate-y-0.5 shadow-md"
        >
          Save All Comfort Settings ♡
        </button>
      </div>
    </div>
  );
}
