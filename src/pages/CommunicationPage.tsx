import { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { aacCards, type AacCard } from "@/data/learningData";
import Confetti from "@/components/Confetti";
import SpeakerButton from "@/components/SpeakerButton";
import SpeechControls from "@/components/SpeechControls";
import { MessageCircle, Trash2, Volume2 } from "lucide-react";

export default function CommunicationPage() {
  const { speak, recordCommunication, preferences, showNotice } = useApp();
  const [selectedCards, setSelectedCards] = useState<AacCard[]>([]);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const confettiTimer = useRef<number | null>(null);

  const categories = [...new Set(aacCards.map((c) => c.category))];
  const categoryLabels: Record<string, string> = {
    needs: "Needs 💚",
    places: "Places 📍",
    actions: "Actions 🏃",
    feelings: "Feelings 💛",
    responses: "Responses ✋",
  };

  const handleSelectCard = (card: AacCard) => {
    setSelectedCards((prev) => [...prev, card]);
    setLastSelectedId(card.id);
    recordCommunication();

    // Confetti
    if (!preferences.quietMode && !preferences.reducedMotion) {
      setCelebrate(false);
      requestAnimationFrame(() => {
        setCelebrate(true);
        if (confettiTimer.current) window.clearTimeout(confettiTimer.current);
        confettiTimer.current = window.setTimeout(() => setCelebrate(false), 3000);
      });
    }

    // Pronounce the selected item immediately
    if (!preferences.silentMode && !preferences.muted && preferences.speechEnabled) {
      speak(card.label);
    }
  };

  const handleClear = () => {
    setSelectedCards([]);
    setLastSelectedId(null);
  };

  const handleSpeakSentence = () => {
    if (selectedCards.length === 0) return;
    const sentence = selectedCards.map((c) => c.label).join(" ");
    if (preferences.silentMode || preferences.muted || !preferences.speechEnabled) {
      showNotice("Turn on speech in Comfort settings to hear this.");
    } else {
      speak(sentence);
    }
  };

  return (
    <div className="w-full flex-1 px-5 py-8 max-w-[900px] mx-auto">
      <Confetti active={celebrate} />

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5DCE3] rounded-full text-[#8F596B] font-bold text-sm mb-3">
          <MessageCircle size={18} /> Communication Board
        </div>
        <h1 className="text-[#5C6F5E] font-bold text-3xl md:text-4xl" style={{ fontFamily: "Georgia, serif" }}>
          Build your message! ♡
        </h1>
        <p className="mt-3 text-[#777572] text-base">
          Pick pictures to say what you want. Each picture is spoken aloud.
        </p>
      </div>

      {/* Sentence building area */}
      <div className="mb-6 p-5 rounded-[22px] bg-gradient-to-b from-[#FFFDFC] to-[#f5efed] border-2 border-[#EED9DE] min-h-[140px]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#92787b] text-[11px] font-extrabold tracking-[.12em]">MY SENTENCE</span>
          {selectedCards.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f6e9e7] text-[#77565a] font-bold text-xs cursor-pointer transition-all hover:bg-[#f0dfdc]"
            >
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>

        {selectedCards.length === 0 ? (
          <div className="flex items-center justify-center min-h-[80px] text-[#aaa] font-bold">
            👆 Pick pictures below to build your sentence
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            {selectedCards.map((card, i) => (
              <div
                key={`${card.id}-${i}`}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border-2 bg-white transition-all animate-float-up
                  ${lastSelectedId === card.id && i === selectedCards.length - 1
                    ? "border-[#9dc8bd] bg-[#e8f4f0] shadow-[0_0_12px_rgba(125,181,164,0.4)] scale-105"
                    : "border-[#eadfe0]"
                  }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="text-3xl">{card.emoji}</span>
                <span className="text-xs font-bold text-[#514b4b]">{card.label}</span>
                <SpeakerButton text={card.label} size={14} />
              </div>
            ))}
            {selectedCards.length > 1 && (
              <div className="flex items-center gap-2 ml-2">
                <SpeechControls text={selectedCards.map((c) => c.label).join(" ")} />
              </div>
            )}
          </div>
        )}

        {selectedCards.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#eadfe0] flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSpeakSentence}
              disabled={selectedCards.length === 0}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#718D75] text-white font-bold border-0 cursor-pointer transition-all hover:bg-[#5F7D64] hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Volume2 size={18} /> Speak Sentence
            </button>
            <span className="text-sm text-[#8a7e80]">
              {selectedCards.length} picture{selectedCards.length !== 1 ? "s" : ""} selected
            </span>
          </div>
        )}
      </div>

      {/* AAC picture cards grouped by category */}
      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-extrabold text-[#8a7e80] mb-3 tracking-wide">
            {categoryLabels[category] || category}
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {aacCards.filter((c) => c.category === category).map((card) => {
              const isLastSelected = lastSelectedId === card.id;
              return (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className={`flex flex-col items-center justify-center gap-1.5 min-h-[110px] p-3 rounded-2xl border-2 bg-white transition-all hover:-translate-y-1 hover:shadow-md relative
                    ${isLastSelected
                      ? "border-[#9dc8bd] bg-[#e8f4f0] shadow-[0_0_15px_rgba(125,181,164,0.35)] scale-[1.03]"
                      : "border-[#eadfe0] hover:border-[#D5C5C9]"
                    }`}
                >
                  {isLastSelected && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#75a99a] rounded-full flex items-center justify-center text-white text-[10px] font-bold z-10">
                      ✓
                    </span>
                  )}
                  <span className="text-3xl">{card.emoji}</span>
                  <strong className="text-[12px] text-center text-[#514b4b]">{card.label}</strong>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {preferences.silentMode && (
        <div className="mt-4 p-3 rounded-xl bg-[#FFF3E0] border border-[#EBCB79] text-[#73531E] font-bold text-sm text-center">
          🔇 Silent Mode is ON — pictures and animations work normally, but audio is muted.
        </div>
      )}
    </div>
  );
}
