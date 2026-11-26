import { useApp } from "@/context/AppContext";
import { Play, Pause, Square, RotateCcw, Volume2, VolumeX, Languages } from "lucide-react";

interface TTSPlayerControlsProps {
  lastText?: string;
  className?: string;
  showLanguageToggle?: boolean;
}

export default function TTSPlayerControls({
  lastText,
  className = "",
  showLanguageToggle = true,
}: TTSPlayerControlsProps) {
  const {
    speak,
    repeatSpeech,
    pauseSpeech,
    resumeSpeech,
    stopSpeech,
    ttsStatus,
    currentUtteranceText,
    preferences,
    updatePreferences,
    isTeluguSupported,
    showNotice,
  } = useApp();

  const isSilent = preferences.silentMode || preferences.muted;
  const activeText = currentUtteranceText || lastText || "";
  const isPlaying = ttsStatus === "playing" || (ttsStatus as string) === "speaking";

  const handlePlayReplay = () => {
    if (isSilent) {
      showNotice("Silent Mode is active. Turn on Sound to hear speech.");
      return;
    }
    if (activeText) {
      speak(activeText);
    } else {
      repeatSpeech();
    }
  };

  const handleToggleLang = () => {
    const nextLang = preferences.ttsLanguage === "en" ? "te" : "en";
    updatePreferences({ ttsLanguage: nextLang });
    if (nextLang === "te" && !isTeluguSupported) {
      showNotice("Telugu voice data might need to be installed in Android settings.");
    } else {
      showNotice(nextLang === "te" ? "Voice set to Telugu (తెలుగు) 🇮🇳" : "Voice set to English 🇬🇧/🇺🇸");
    }
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 bg-white border border-[#E9DFE2] rounded-2xl shadow-sm ${className}`}
      role="region"
      aria-label="Text-to-speech audio player controls"
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            isPlaying
              ? "bg-[#D8EADB] text-[#4C7550] animate-pulse"
              : isSilent
              ? "bg-[#FBEBE7] text-[#B85741]"
              : "bg-[#F3EBF0] text-[#7E576B]"
          }`}
        >
          {isSilent ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[#554C4F] truncate">
            {isPlaying && "Speaking now..."}
            {ttsStatus === "paused" && "Paused"}
            {ttsStatus === "idle" && (activeText ? `Ready: "${activeText.slice(0, 28)}..."` : "Speech Player")}
          </p>
          <span className="text-[11px] text-[#8C7D82] block truncate">
            {isSilent ? "Silent Mode (Audio Muted)" : `Voice: ${preferences.ttsLanguage === "te" ? "Telugu (తెలుగు)" : "English"}`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {/* Play / Replay button */}
        <button
          onClick={handlePlayReplay}
          className="w-8 h-8 rounded-full bg-[#718D75] text-white flex items-center justify-center transition-all hover:bg-[#5C7760] cursor-pointer"
          title="Play / Replay"
          aria-label="Play or replay text"
        >
          {ttsStatus === "idle" ? <Play size={14} className="ml-0.5" /> : <RotateCcw size={14} />}
        </button>

        {/* Repeat button */}
        <button
          onClick={repeatSpeech}
          className="w-8 h-8 rounded-full bg-[#F3EBF0] text-[#7E576B] flex items-center justify-center transition-all hover:bg-[#E8D9E3] cursor-pointer"
          title="Repeat last spoken message"
          aria-label="Repeat last speech"
        >
          <RotateCcw size={13} />
        </button>

        {/* Pause button */}
        {isPlaying && (
          <button
            onClick={pauseSpeech}
            className="w-8 h-8 rounded-full bg-[#EBCB79] text-[#694E15] flex items-center justify-center transition-all hover:bg-[#DDBB65] cursor-pointer"
            title="Pause speech"
            aria-label="Pause speech"
          >
            <Pause size={14} />
          </button>
        )}

        {/* Resume button */}
        {ttsStatus === "paused" && (
          <button
            onClick={resumeSpeech}
            className="w-8 h-8 rounded-full bg-[#718D75] text-white flex items-center justify-center transition-all hover:bg-[#5C7760] cursor-pointer"
            title="Resume speech"
            aria-label="Resume speech"
          >
            <Play size={14} className="ml-0.5" />
          </button>
        )}

        {/* Stop button */}
        <button
          onClick={stopSpeech}
          disabled={ttsStatus === "idle"}
          className="w-8 h-8 rounded-full bg-[#E5D7DA] text-[#6C555C] flex items-center justify-center transition-all hover:bg-[#D9C4C8] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Stop speech"
          aria-label="Stop speech"
        >
          <Square size={13} />
        </button>

        {/* Language switch button */}
        {showLanguageToggle && (
          <button
            onClick={handleToggleLang}
            className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              preferences.ttsLanguage === "te"
                ? "bg-[#F5DCE3] border-[#E2BCC7] text-[#7A4B5A]"
                : "bg-[#F5F2F0] border-[#E0D7D5] text-[#61595B]"
            }`}
            title="Toggle between English and Telugu speech"
          >
            <Languages size={12} />
            <span>{preferences.ttsLanguage === "te" ? "తెలుగు" : "EN"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
