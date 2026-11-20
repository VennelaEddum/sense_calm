import { useApp } from "@/context/AppContext";
import { Play, Pause, Square } from "lucide-react";

interface SpeechControlsProps {
  text: string;
  lang?: string;
  className?: string;
}

export default function SpeechControls({ text, lang, className = "" }: SpeechControlsProps) {
  const { speak, pauseSpeech, resumeSpeech, stopSpeech, speechState, preferences } = useApp();
  const audioBlocked = preferences.silentMode || preferences.muted || !preferences.speechEnabled;

  if (audioBlocked) {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f0eae9] text-[#b0a5a3] font-bold text-sm ${className}`}>
        <Square size={16} /> Audio muted
      </div>
    );
  }

  const { speaking, paused } = speechState;

  if (!speaking) {
    return (
      <button
        type="button"
        onClick={() => speak(text, lang)}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#dcefe8] text-[#315c55] font-bold border-0 cursor-pointer transition-all hover:bg-[#c8e6dd] hover:scale-105 ${className}`}
      >
        <Play size={18} /> Speak
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {paused ? (
        <button
          type="button"
          onClick={resumeSpeech}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#dcefe8] text-[#315c55] font-bold cursor-pointer transition-all hover:bg-[#c8e6dd]"
        >
          <Play size={18} /> Resume
        </button>
      ) : (
        <button
          type="button"
          onClick={pauseSpeech}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FFF3E0] text-[#73531E] font-bold cursor-pointer transition-all hover:bg-[#FFE9B8]"
        >
          <Pause size={18} /> Pause
        </button>
      )}
      <button
        type="button"
        onClick={stopSpeech}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#f6e9e7] text-[#77565a] font-bold cursor-pointer transition-all hover:bg-[#f0dfdc]"
      >
        <Square size={18} /> Stop
      </button>
    </div>
  );
}
