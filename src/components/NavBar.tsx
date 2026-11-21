import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import type { ModuleName } from "@/types";
import {
  Heart,
  Cloud,
  Home,
  Gamepad2,
  MessageCircle,
  Smile,
  Sprout,
  Calendar,
  Settings2,
  BarChart3,
  Volume2,
  VolumeX,
  Languages,
  Shield,
  AlertCircle,
  Leaf,
  Wifi,
  WifiOff,
} from "lucide-react";

interface NavBarProps {
  current: ModuleName;
  onNavigate: (m: ModuleName) => void;
}

export default function NavBar({ current, onNavigate }: NavBarProps) {
  const {
    preferences,
    updatePreferences,
    toggleSilentMode,
    setEmergencyModalOpen,
    setBreathingModalOpen,
    setCaregiverGateModalOpen,
    isCaregiverAuthenticated,
  } = useApp();

  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? window.navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const links: { key: ModuleName; label: string; icon: typeof Home }[] = [
    { key: "home", label: "Home", icon: Home },
    { key: "activities", label: "Activities", icon: Gamepad2 },
    { key: "communication", label: "Communicate", icon: MessageCircle },
    { key: "emotions", label: "Emotions", icon: Smile },
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

  const handleCaregiverClick = () => {
    if (isCaregiverAuthenticated) {
      onNavigate("caregiver");
    } else {
      setCaregiverGateModalOpen(true);
    }
  };

  return (
    <header className="w-full min-h-[76px] px-3 sm:px-[5%] py-2.5 flex items-center justify-between gap-2.5 bg-[#FFF8F5] shadow-sm relative z-30 flex-wrap">
      {/* Brand logo & Home */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-1.5 text-xl sm:text-2xl font-extrabold text-[#6C806D] tracking-tight whitespace-nowrap cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <Heart size={22} className="fill-[#C9879C] text-[#C9879C]" />
          Sense<span className="text-[#C9879C]">Calm</span>
        </button>

        {/* Offline / Online indicator */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
            isOnline
              ? "bg-[#EAF5ED] text-[#3D7146] border-[#D0E7D4]"
              : "bg-[#FFF4E5] text-[#9A6214] border-[#FEE1BD]"
          }`}
          title={isOnline ? "Connected & Offline Ready" : "Working Offline Mode"}
        >
          {isOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
          <span className="hidden md:inline">{isOnline ? "Ready" : "Offline"}</span>
        </span>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex items-center gap-1 flex-wrap" aria-label="Main navigation">
        {links.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer
              ${
                current === key
                  ? "bg-[#EBCBD5] text-[#754D5B] shadow-sm scale-[1.02]"
                  : "text-[#77736F] hover:bg-[#F5DCE3] hover:text-[#8F596B]"
              }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}

        {/* Caregiver Portal Link */}
        <button
          onClick={handleCaregiverClick}
          className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer
            ${
              current === "caregiver"
                ? "bg-[#D8E6DB] text-[#3F6146] shadow-sm scale-[1.02]"
                : "text-[#6C806D] hover:bg-[#EAF3EC]"
            }`}
          title="Caregiver & Teacher Portal"
        >
          <Shield size={15} />
          <span className="hidden md:inline">Teacher / Parent</span>
        </button>
      </nav>

      {/* Quick Action Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Quick Break Button */}
        <button
          onClick={() => setBreathingModalOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#EBF3EC] border border-[#CFE4D2] text-[#426947] text-xs font-bold transition-all hover:bg-[#DEEFE0] cursor-pointer shadow-xs"
          title="Take a Calming Guided Breathing Break"
        >
          <Leaf size={14} className="text-[#5F8A64]" />
          <span className="hidden sm:inline">Break</span>
        </button>

        {/* Persistent Emergency Button */}
        <button
          onClick={() => setEmergencyModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FEEFEB] border-2 border-[#FCA5A5] text-[#C53030] text-xs font-extrabold transition-all hover:bg-[#FEE2E2] hover:scale-[1.03] cursor-pointer shadow-sm animate-pulse"
          title="Urgent Help & Emergency Communication"
          aria-label="Need Help or Emergency Communication"
        >
          <AlertCircle size={15} />
          <span>Need Help</span>
        </button>

        {/* Language quick switch: English / Telugu */}
        <button
          onClick={toggleLanguage}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer
            ${
              preferences.ttsLanguage === "te"
                ? "bg-[#F5DCE3] border-[#E8CCD5] text-[#8F596B]"
                : "bg-white border-[#E8CCD5] text-[#6E6366] hover:bg-[#FAF0F3]"
            }`}
          title="Switch Voice Language (English / Telugu)"
          aria-label={`Voice language currently ${
            preferences.ttsLanguage === "te" ? "Telugu" : "English"
          }. Click to switch.`}
        >
          <Languages size={13} />
          <span>{preferences.ttsLanguage === "te" ? "తెలుగు" : "EN"}</span>
        </button>

        {/* Prominent Silent Mode Toggle */}
        <button
          onClick={toggleSilentMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer
            ${
              isSilent
                ? "bg-[#FDF0ED] border-[#F2C6BB] text-[#B85741] hover:bg-[#FAE5E0]"
                : "bg-[#EBF3EC] border-[#D0E2D3] text-[#4F7354] hover:bg-[#DFEDE1]"
            }`}
          aria-pressed={isSilent}
          title={
            isSilent
              ? "Silent Mode is ON. Spoken words and sounds are muted. Click to enable sound."
              : "Audio is ON. Click to turn on Silent Mode."
          }
        >
          {isSilent ? <VolumeX size={15} /> : <Volume2 size={15} />}
          <span>{isSilent ? "Silent" : "Sound"}</span>
        </button>

        {/* Quiet Mode toggle */}
        <button
          onClick={() => updatePreferences({ quietMode: !preferences.quietMode })}
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold whitespace-nowrap transition-all cursor-pointer
            ${
              preferences.quietMode
                ? "bg-[#DCE9DC] border-[#D7E3D5] text-[#5E7863]"
                : "bg-[#EDF3E9] border-[#D7E3D5] text-[#5E7863] hover:bg-[#DCE9DC]"
            }`}
          aria-pressed={preferences.quietMode}
          title="Gentle visuals without bouncy animations"
        >
          <Cloud size={13} />
          <span>Calm: {preferences.quietMode ? "On" : "Off"}</span>
        </button>
      </div>
    </header>
  );
}
