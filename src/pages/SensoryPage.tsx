import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { Preferences } from "@/types";
import { Settings2, Volume2, VolumeX, Eye, Sparkles, Leaf, ArrowLeft } from "lucide-react";

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description: string;
  icon: typeof Eye;
}

function SettingToggle({ checked, onChange, label, description, icon: Icon }: ToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 p-3.5 rounded-[14px] border-2 border-[#eadfe0] bg-white cursor-pointer hover:bg-[#f9f5f4] transition-all">
      <div className="flex items-center gap-3">
        <Icon size={24} className="text-[#8a7e80] shrink-0" />
        <div className="grid gap-1">
          <strong className="text-[#514b4b] text-sm">{label}</strong>
          <small className="text-[#817878] text-xs leading-relaxed">{description}</small>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-all shrink-0 ${checked ? "bg-[#75a99a]" : "bg-[#d5c5c9]"}`}
        aria-pressed={checked}
        aria-label={label}
      >
        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

export default function SensoryPage() {
  const { preferences, updatePreferences, showNotice } = useApp();
  const [onBreak, setOnBreak] = useState(false);
  const [local, setLocal] = useState<Preferences>(preferences);

  const handleSave = () => {
    updatePreferences(local);
    showNotice("Your comfort settings are saved. ♡");
  };

  if (onBreak) {
    return (
      <div className="w-full flex-1 px-5 py-8 flex items-center justify-center">
        <div className="text-center max-w-md animate-float-up">
          <div className="text-6xl mb-6 gentle-bob">🌿</div>
          <h3 className="text-[#5C6F5E] font-bold text-2xl mb-4" style={{ fontFamily: "Georgia, serif" }}>
            It's okay to pause.
          </h3>
          <p className="text-[#777572] text-lg leading-relaxed mb-8">
            Take a few quiet moments. You can come back whenever you feel ready.
          </p>
          <button
            onClick={() => setOnBreak(false)}
            className="px-6 py-3.5 rounded-full bg-[#718D75] text-white font-bold border-0 cursor-pointer transition-all hover:bg-[#5F7D64] hover:-translate-y-0.5"
          >
            I'm ready to come back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 px-5 py-8 max-w-[600px] mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E5EFF7] rounded-full text-[#58758C] font-bold text-sm mb-3">
          <Settings2 size={18} /> Comfort Settings
        </div>
        <h1 className="text-[#5C6F5E] font-bold text-3xl md:text-4xl" style={{ fontFamily: "Georgia, serif" }}>
          Make this space comfortable ☁
        </h1>
        <p className="mt-3 text-[#777572] text-base">
          Choose what feels comfortable. Your preferences are saved on this device.
        </p>
      </div>

      <div className="grid gap-2.5">
        <SettingToggle
          checked={local.reducedMotion}
          onChange={(v) => setLocal({ ...local, reducedMotion: v })}
          label="Reduce animations"
          description="Limit moving effects on this page."
          icon={Sparkles}
        />
        <SettingToggle
          checked={local.muted}
          onChange={(v) => setLocal({ ...local, muted: v })}
          label="Mute optional speech"
          description="Keep spoken messages turned off."
          icon={VolumeX}
        />
        <SettingToggle
          checked={local.simplified}
          onChange={(v) => setLocal({ ...local, simplified: v })}
          label="Simplified layout"
          description="Use a calmer, less decorated view."
          icon={Eye}
        />
        <SettingToggle
          checked={local.speechEnabled}
          onChange={(v) => setLocal({ ...local, speechEnabled: v })}
          label="Enable spoken messages"
          description="Uses your browser's text-to-speech voice when unmuted."
          icon={Volume2}
        />
        <SettingToggle
          checked={local.quietMode}
          onChange={(v) => setLocal({ ...local, quietMode: v })}
          label="Quiet Mode"
          description="Turns off all animations and transitions at once."
          icon={Leaf}
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSave}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#718D75] text-white font-bold border-0 cursor-pointer transition-all hover:bg-[#5F7D64] hover:-translate-y-0.5"
        >
          Save comfort settings
        </button>
        <button
          onClick={() => setOnBreak(true)}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#f6e9e7] text-[#77565a] font-bold border-0 cursor-pointer transition-all hover:bg-[#f0dfdc]"
        >
          <Leaf size={18} /> I want a break
        </button>
      </div>

      <button
        onClick={() => {
          setLocal(preferences);
        }}
        className="mt-4 w-full inline-flex items-center justify-center gap-2 text-[#A29A97] text-sm font-bold transition-all hover:text-[#777572]"
      >
        <ArrowLeft size={14} /> Reset to last saved settings
      </button>
    </div>
  );
}
