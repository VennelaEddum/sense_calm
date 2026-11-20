import { useApp } from "@/context/AppContext";
import { Volume2, VolumeX } from "lucide-react";

interface SpeakerButtonProps {
  text: string;
  lang?: string;
  size?: number;
  className?: string;
  label?: string;
}

export default function SpeakerButton({ text, lang, size = 20, className = "", label }: SpeakerButtonProps) {
  const { speak, preferences } = useApp();
  const audioBlocked = preferences.silentMode || preferences.muted || !preferences.speechEnabled;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, lang);
      }}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-sm transition-all shrink-0
        ${audioBlocked
          ? "bg-[#f0eae9] text-[#b0a5a3] cursor-not-allowed"
          : "bg-[#dcefe8] text-[#315c55] hover:bg-[#c8e6dd] hover:scale-105"
        } ${className}`}
      aria-label={label || `Speak: ${text}`}
      title={audioBlocked ? "Audio is muted — turn off Silent Mode to hear" : `Speak: ${text}`}
    >
      {audioBlocked ? <VolumeX size={size} /> : <Volume2 size={size} />}
    </button>
  );
}
