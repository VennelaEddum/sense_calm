import { useApp } from "@/context/AppContext";
import type { ModuleName } from "@/types";
import { Heart, Cloud, Home, Gamepad2, MessageCircle, Sprout, Calendar, Settings2, BarChart3 } from "lucide-react";

interface NavBarProps {
  current: ModuleName;
  onNavigate: (m: ModuleName) => void;
}

export default function NavBar({ current, onNavigate }: NavBarProps) {
  const { preferences, updatePreferences } = useApp();

  const links: { key: ModuleName; label: string; icon: typeof Home }[] = [
    { key: "home", label: "Home", icon: Home },
    { key: "activities", label: "Activities", icon: Gamepad2 },
    { key: "communication", label: "Communicate", icon: MessageCircle },
    { key: "learning", label: "Learn", icon: Sprout },
    { key: "routine", label: "Routine", icon: Calendar },
    { key: "sensory", label: "Comfort", icon: Settings2 },
    { key: "progress", label: "Progress", icon: BarChart3 },
  ];

  return (
    <header className="w-full min-h-[76px] px-4 sm:px-[7%] py-3 flex items-center justify-between gap-4 bg-[#FFF8F5] shadow-sm relative z-30 flex-wrap">
      <button
        onClick={() => onNavigate("home")}
        className="flex items-center gap-1 text-2xl font-extrabold text-[#6C806D] tracking-tight whitespace-nowrap"
      >
        <Heart size={22} className="fill-[#C9879C] text-[#C9879C]" />
        Sense<span className="text-[#C9879C]">Calm</span>
      </button>

      <nav className="flex items-center gap-2 flex-wrap" aria-label="Main navigation">
        {links.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`px-3 sm:px-5 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-1.5
              ${current === key
                ? "bg-[#EBCBD5] text-[#754D5B] shadow-sm"
                : "text-[#77736F] hover:bg-[#F5DCE3] hover:text-[#8F596B]"
              }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={() => updatePreferences({ quietMode: !preferences.quietMode })}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-bold whitespace-nowrap transition-all
          ${preferences.quietMode
            ? "bg-[#DCE9DC] border-[#D7E3D5] text-[#5E7863]"
            : "bg-[#EDF3E9] border-[#D7E3D5] text-[#5E7863] hover:bg-[#DCE9DC]"
          }`}
        aria-pressed={preferences.quietMode}
      >
        <Cloud size={16} />
        Quiet Mode: {preferences.quietMode ? "On" : "Off"}
      </button>
    </header>
  );
}
