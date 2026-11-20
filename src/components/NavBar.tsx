import { useApp } from "@/context/AppContext";
import type { ModuleName } from "@/types";
import {
  Heart,
  Cloud,
  Home,
  Gamepad2,
  MessageCircle,
  Sprout,
  Calendar,
  Settings2,
  BarChart3,
  Volume2,
  VolumeX,
  Languages,
} from "lucide-react";

interface NavBarProps {
  current: ModuleName;
  onNavigate: (m: ModuleName) => void;
}

export default function NavBar({ current, onNavigate }: NavBarProps) {
  const { preferences, updatePreferences, toggleSilentMode } = useApp();

  const links: { key: ModuleName; label: string; icon: typeof Home }[] = [
    { key: "home", label: "Home", icon: Home },
    { key: "activities", label: "Activities", icon: Gamepad2 },
    { key: "communication", label: "Communicate", icon: MessageCircle },
    { key: "learning", label: "Games & Learn", icon: Sprout },
    { key: "routine", label: "Routine", icon: Calendar },
    { key: "sensory", label: "Comfort", icon: Settings2 },
    { key: "progress", label: "Progress", icon: BarChart3 },
  ];

  const isSilent = preferences.silentMode || preferences.muted;

  const toggleLanguage = () => {
    const nextLang = preferences.ttsLanguage === "en" ? "te" : "en";
    updatePreferences({ ttsLanguage: nextLang });
  };

  return (
    <header className="w-full min-h-[76px] px-4 sm:px-[6%] py-3 flex items-center justify-between gap-3 bg-[#FFF8F5] shadow-sm relative z-30 flex-wrap">
      <button
        onClick={() => onNavigate("home")}
        className="flex items-center gap-1.5 text-2xl font-extrabold text-[#6C806D] tracking-tight whitespace-nowrap"
      >
        <Heart size={22} className="fill-[#C9879C] text-[#C9879C]" />
        Sense<span className="text-[#C9879C]">Calm</span>
      </button>

      <nav className="flex items-center gap-1.5 flex-wrap" aria-label="Main navigation">
        {links.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`px-3 sm:px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5
              ${
                current === key
                  ? "bg-[#EBCBD5] text-[#754D5B] shadow-sm scale-[1.02]"
                  : "text-[#77736F] hover:bg-[#F5DCE3] hover:text-[#8F596B]"
              }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Language quick switch: English / Telugu */}
        <button
          onClick={toggleLanguage}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-bold transition-all
            ${
              preferences.ttsLanguage === "te"
                ? "bg-[#F5DCE3] border-[#E8CCD5] text-[#8F596B]"
                : "bg-white border-[#E8CCD5] text-[#6E6366] hover:bg-[#FAF0F3]"
            }`}
          title="Switch Voice Language (English / Telugu)"
          aria-label={`Voice language currently ${preferences.ttsLanguage === "te" ? "Telugu" : "English"}. Click to switch.`}
        >
          <Languages size={14} />
          <span>{preferences.ttsLanguage === "te" ? "తెలుగు" : "EN"}</span>
        </button>

        {/* Prominent Silent Mode Toggle */}
        <button
          onClick={toggleSilentMode}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-sm
            ${
              isSilent
                ? "bg-[#FDF0ED] border-[#F2C6BB] text-[#B85741] hover:bg-[#FAE5E0]"
                : "bg-[#EBF3EC] border-[#D0E2D3] text-[#4F7354] hover:bg-[#DFEDE1]"
            }`}
          aria-pressed={isSilent}
          title={isSilent ? "Silent Mode is ON. Click to enable sound." : "Audio is ON. Click to turn on Silent Mode."}
        >
          {isSilent ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>{isSilent ? "Silent: ON" : "Sound: ON"}</span>
        </button>

        {/* Quiet Mode (visual animation calms) */}
        <button
          onClick={() => updatePreferences({ quietMode: !preferences.quietMode })}
          className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all
            ${
              preferences.quietMode
                ? "bg-[#DCE9DC] border-[#D7E3D5] text-[#5E7863]"
                : "bg-[#EDF3E9] border-[#D7E3D5] text-[#5E7863] hover:bg-[#DCE9DC]"
            }`}
          aria-pressed={preferences.quietMode}
          title="Gentle visuals without animations"
        >
          <Cloud size={14} />
          <span>Calm Mode: {preferences.quietMode ? "On" : "Off"}</span>
        </button>
      </div>
    </header>
  );
}
