import { useState, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { aacCardList, aacCategories } from "@/data/aacData";
import Confetti from "@/components/Confetti";
import TTSPlayerControls from "@/components/TTSPlayerControls";
import type { AACToken, AACCardItem } from "@/types";
import {
  Volume2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  MessageCircle,
  Check,
} from "lucide-react";

export default function CommunicationPage() {
  const {
    speak,
    recordCommunication,
    preferences,
    playSound,
    showNotice,
    ttsStatus,
  } = useApp();

  const [selectedTokens, setSelectedTokens] = useState<AACToken[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [celebrate, setCelebrate] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState("");

  const isTelugu = preferences.ttsLanguage === "te";
  const isSilent = preferences.silentMode || preferences.muted;

  // Add picture card to sentence builder
  const handleSelectCard = useCallback(
    (card: AACCardItem) => {
      const phraseToSpeak = isTelugu ? card.teluguText : card.text;

      const newToken: AACToken = {
        id: `${card.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        emoji: card.emoji,
        text: card.text,
        teluguText: card.teluguText,
        category: card.category,
      };

      setSelectedTokens((prev) => [...prev, newToken]);
      setLastSpokenText(phraseToSpeak);

      // Play soft pop sound
      playSound("pop");

      // Confetti celebratory feedback
      if (!preferences.quietMode && !preferences.reducedMotion) {
        setCelebrate(true);
        window.setTimeout(() => setCelebrate(false), 2000);
      }

      // Automatically speak the selected picture card using TTS
      if (!isSilent && preferences.speechEnabled) {
        speak(phraseToSpeak, preferences.ttsLanguage);
      } else if (isSilent) {
        showNotice(`Selected "${phraseToSpeak}". (Silent Mode is ON)`);
      }
    },
    [isTelugu, isSilent, preferences, playSound, speak, showNotice]
  );

  // Remove individual token
  const handleRemoveToken = (tokenId: string) => {
    setSelectedTokens((prev) => prev.filter((t) => t.id !== tokenId));
    playSound("pop");
  };

  // Reorder tokens left
  const handleMoveLeft = (index: number) => {
    if (index === 0) return;
    setSelectedTokens((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
    playSound("pop");
  };

  // Reorder tokens right
  const handleMoveRight = (index: number) => {
    if (index >= selectedTokens.length - 1) return;
    setSelectedTokens((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
    playSound("pop");
  };

  // Clear entire sentence area
  const handleClear = () => {
    if (selectedTokens.length === 0) return;
    setSelectedTokens([]);
    setLastSpokenText("");
    playSound("swoosh");
  };

  // Speak full concatenated sentence
  const handleSpeakFullSentence = () => {
    if (selectedTokens.length === 0) {
      showNotice("Select picture cards below to build your sentence.");
      return;
    }

    const fullSentence = selectedTokens
      .map((t) => (isTelugu ? t.teluguText || t.text : t.text))
      .join(" ");

    setLastSpokenText(fullSentence);
    recordCommunication(fullSentence);

    if (!isSilent && preferences.speechEnabled) {
      speak(fullSentence, preferences.ttsLanguage);
      if (!preferences.quietMode) {
        setCelebrate(true);
        window.setTimeout(() => setCelebrate(false), 2500);
      }
    } else {
      showNotice(`Sentence: "${fullSentence}" (Silent Mode is active)`);
    }
  };

  // Filter cards by category
  const filteredCards =
    activeCategory === "all"
      ? aacCardList
      : aacCardList.filter((card) => card.category === activeCategory);

  // Set of selected base card keys for visual badge
  const selectedCardCount = selectedTokens.reduce<Record<string, number>>((acc, t) => {
    const baseId = t.id.split("-")[0];
    acc[baseId] = (acc[baseId] || 0) + 1;
    return acc;
  }, {});

  const fullSentencePreview = selectedTokens
    .map((t) => (isTelugu ? t.teluguText || t.text : t.text))
    .join(" ");

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-6 max-w-[1040px] mx-auto">
      <Confetti active={celebrate} />

      {/* Header Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F5DCE3] rounded-full text-[#8F596B] font-bold text-xs sm:text-sm mb-2 shadow-sm">
          <MessageCircle size={16} /> AAC Communication Board
        </div>
        <h1
          className="text-[#5C6F5E] font-bold text-2xl sm:text-3xl md:text-4xl"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {isTelugu ? "మీరు ఏమి చెప్పాలనుకుంటున్నారు? ♡" : "What would you like to say? ♡"}
        </h1>
        <p className="mt-1.5 text-[#777572] text-sm sm:text-base max-w-xl mx-auto">
          {isTelugu
            ? "చిత్రం కార్డును నొక్కండి. మీ వాక్యం పైన కనిపిస్తుంది."
            : "Tap picture cards to build your sentence at the top, then speak it all together."}
        </p>
      </div>

      {/* 1. TOP SENTENCE-BUILDING AREA */}
      <section
        className="mb-6 p-4 sm:p-5 rounded-[22px] bg-[#FFF8F6] border-2 border-[#EADFE0] shadow-md transition-all relative overflow-hidden"
        aria-label="Sentence builder area"
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#718D75] animate-ping" />
            <span className="text-[#92787B] text-[11px] font-extrabold tracking-[.14em] uppercase">
              {isTelugu ? "నా వాక్యం (My Sentence)" : "My Sentence Builder"}
            </span>
            {selectedTokens.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#EBF3EC] text-[#4F7354] text-xs font-bold">
                {selectedTokens.length} {selectedTokens.length === 1 ? "word" : "words"}
              </span>
            )}
          </div>

          {/* Clear Button */}
          {selectedTokens.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[#A85858] bg-[#FDF0F0] border border-[#F5CACA] hover:bg-[#F9DDDD] transition-all"
              title="Clear all pictures"
              aria-label="Clear all picture cards from sentence"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Tokens Container */}
        <div className="min-h-[96px] p-3 rounded-2xl bg-white border border-[#EFE5E7] flex items-center gap-2.5 overflow-x-auto scrollbar-thin">
          {selectedTokens.length === 0 ? (
            <div className="w-full text-center py-4 text-[#A89CA0] text-sm font-medium flex flex-col items-center justify-center gap-1">
              <span className="text-2xl opacity-60">👆</span>
              <span>
                {isTelugu
                  ? "క్రింద ఉన్న కార్డులను ఎంచుకుని ఇక్కడ మీ వాక్యం తయారు చేయండి."
                  : "Tap any picture card below to add it to your sentence."}
              </span>
            </div>
          ) : (
            selectedTokens.map((token, index) => (
              <div
                key={token.id}
                className="shrink-0 flex flex-col items-center p-2.5 rounded-2xl bg-[#FDF6F8] border-2 border-[#E7CCD4] shadow-sm animate-float-up relative group min-w-[85px] max-w-[120px]"
              >
                {/* Remove single token button */}
                <button
                  onClick={() => handleRemoveToken(token.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#C9879C] text-white flex items-center justify-center text-xs shadow-sm hover:bg-[#B37085] transition-transform hover:scale-110"
                  title="Remove this word"
                  aria-label={`Remove ${token.text}`}
                >
                  <X size={12} />
                </button>

                {/* Token Emoji */}
                <span className="text-2xl sm:text-3xl mb-1">{token.emoji}</span>

                {/* Token Label */}
                <span className="text-xs font-extrabold text-[#55474B] text-center line-clamp-2 leading-tight">
                  {isTelugu ? token.teluguText || token.text : token.text}
                </span>

                {/* Reorder Buttons (< and >) */}
                <div className="flex items-center gap-1 mt-1.5 pt-1 border-t border-[#F0DFE3] w-full justify-center">
                  <button
                    onClick={() => handleMoveLeft(index)}
                    disabled={index === 0}
                    className="p-0.5 rounded text-[#8F747D] hover:bg-[#EAD4DB] disabled:opacity-20 disabled:hover:bg-transparent"
                    title="Move left"
                    aria-label="Move word left"
                  >
                    <ChevronLeft size={13} />
                  </button>
                  <span className="text-[10px] text-[#A69399] font-bold">{index + 1}</span>
                  <button
                    onClick={() => handleMoveRight(index)}
                    disabled={index === selectedTokens.length - 1}
                    className="p-0.5 rounded text-[#8F747D] hover:bg-[#EAD4DB] disabled:opacity-20 disabled:hover:bg-transparent"
                    title="Move right"
                    aria-label="Move word right"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Speak Full Sentence Button and Controls */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSpeakFullSentence}
              disabled={selectedTokens.length === 0}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-full font-extrabold text-sm sm:text-base border-0 shadow-md transition-all
                ${
                  selectedTokens.length > 0
                    ? "bg-[#718D75] text-white hover:bg-[#5E7962] hover:shadow-lg active:scale-95 cursor-pointer"
                    : "bg-[#DDE5DF] text-[#869689] cursor-not-allowed opacity-70"
                }`}
              aria-label="Speak the complete constructed sentence aloud"
            >
              <Volume2 size={20} className={ttsStatus === "speaking" ? "animate-pulse" : ""} />
              <span>{isTelugu ? "మొత్తం వాక్యం వినండి" : "Speak Full Sentence"}</span>
              <Sparkles size={16} className="text-[#F2E09B]" />
            </button>

            {fullSentencePreview && (
              <span className="text-xs sm:text-sm font-bold text-[#55474B] italic bg-white/70 px-3 py-1.5 rounded-full border border-[#EADBDE]">
                "{fullSentencePreview}"
              </span>
            )}
          </div>

          {/* Quick Voice Controls */}
          <TTSPlayerControls
            lastText={lastSpokenText}
            className="w-full sm:w-auto py-1.5 px-2.5 text-xs"
            showLanguageToggle={false}
          />
        </div>
      </section>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {aacCategories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => {
              setActiveCategory(cat.key);
              playSound("pop");
            }}
            className={`px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap border transition-all flex items-center gap-1.5
              ${
                activeCategory === cat.key
                  ? "bg-[#718D75] border-[#5E7962] text-white shadow-sm scale-[1.02]"
                  : "bg-white border-[#E8CCD5] text-[#695E61] hover:bg-[#FCEFF2]"
              }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Picture Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {filteredCards.map((card) => {
          const countInSentence = selectedCardCount[card.id] || 0;
          const isCardSelected = countInSentence > 0;

          return (
            <button
              key={card.id}
              onClick={() => handleSelectCard(card)}
              className={`relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-[20px] border-2 transition-all hover:-translate-y-1 hover:shadow-md active:scale-95 text-center
                ${card.bgColor} ${card.borderColor}
                ${
                  isCardSelected
                    ? "ring-4 ring-[#718D75]/40 border-[#718D75] shadow-sm scale-[1.02]"
                    : "hover:border-[#C9879C]"
                }
              `}
              aria-label={`${card.text}${isCardSelected ? `, selected ${countInSentence} times` : ""}`}
            >
              {/* Highlight badge if selected in sentence */}
              {isCardSelected && (
                <span className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#718D75] text-white text-[11px] font-extrabold shadow-sm animate-float-up">
                  {countInSentence > 1 ? countInSentence : <Check size={12} />}
                </span>
              )}

              {/* Big attractive illustration / emoji */}
              <span className="text-3xl sm:text-4xl mb-2 transition-transform group-hover:scale-110">
                {card.emoji}
              </span>

              {/* English Label */}
              <strong className={`text-xs sm:text-sm font-extrabold leading-snug ${card.color}`}>
                {card.text}
              </strong>

              {/* Telugu Translation Label */}
              <span className="text-[11px] text-[#7A6B6F] font-medium mt-0.5 line-clamp-1">
                {card.teluguText}
              </span>
            </button>
          );
        })}
      </div>

      {/* Helpful Hint */}
      <div className="mt-7 text-center text-xs text-[#8A7C80] flex items-center justify-center gap-1.5">
        <Sparkles size={14} className="text-[#C9879C]" />
        <span>
          {isTelugu
            ? "ప్రతి కార్డు శబ్దం చేస్తుంది. నిశ్శబ్ద మోడ్ (Silent Mode) ఆన్‌లో ఉంటే మ్యూట్ అవుతుంది."
            : "Tip: Every card speaks instantly. Toggle 'Sound: ON/OFF' in the top bar anytime."}
        </span>
      </div>
    </div>
  );
}
