import { useState, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import {
  emotionDefinitions,
  emotionTriggers,
  emotionSupportActions,
} from "@/data/emotionsData";
import type {
  EmotionDefinition,
  EmotionIntensity,
  EmotionTrigger,
  EmotionSupportAction,
} from "@/types";
import TTSPlayerControls from "@/components/TTSPlayerControls";
import {
  Heart,
  Volume2,
  Sparkles,
  Check,
  Send,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

export default function EmotionAssistantPage() {
  const {
    preferences,
    speak,
    playSound,
    showNotice,
    recordEmotionCheckIn,
    setBreathingModalOpen,
  } = useApp();

  const [selectedEmotion, setSelectedEmotion] = useState<EmotionDefinition | null>(
    emotionDefinitions[0]
  );
  const [intensity, setIntensity] = useState<EmotionIntensity>("medium");
  const [selectedTrigger, setSelectedTrigger] = useState<EmotionTrigger | null>(null);
  const [selectedAction, setSelectedAction] = useState<EmotionSupportAction | null>(null);
  const [messageShared, setMessageShared] = useState(false);

  const isTelugu = preferences.ttsLanguage === "te";
  const isSilent = preferences.silentMode || preferences.muted;

  const handleSelectEmotion = useCallback(
    (emotion: EmotionDefinition) => {
      setSelectedEmotion(emotion);
      setMessageShared(false);
      playSound("pop");
      const phrase = isTelugu
        ? `నేను ${emotion.teluguLabel} అనుభవిస్తున్నాను. ${emotion.teluguExplanation}`
        : `I feel ${emotion.label}. ${emotion.explanation}`;
      if (!isSilent && preferences.speechEnabled) {
        speak(phrase, preferences.ttsLanguage);
      }
    },
    [isTelugu, isSilent, preferences.speechEnabled, preferences.ttsLanguage, playSound, speak]
  );

  const handleSelectIntensity = (lvl: EmotionIntensity) => {
    setIntensity(lvl);
    playSound("pop");
  };

  const handleSelectTrigger = (trigger: EmotionTrigger) => {
    setSelectedTrigger(trigger);
    playSound("pop");
    if (!isSilent && preferences.speechEnabled) {
      speak(isTelugu ? trigger.teluguLabel : trigger.label, preferences.ttsLanguage);
    }
  };

  const handleSelectAction = (action: EmotionSupportAction) => {
    setSelectedAction(action);
    playSound("pop");

    if (action.targetAction === "break" || action.targetAction === "breathing") {
      setBreathingModalOpen(true);
    }

    if (!isSilent && preferences.speechEnabled) {
      speak(isTelugu ? action.teluguLabel : action.label, preferences.ttsLanguage);
    }
  };

  // Compose Full Visual Message
  const intensityLabel = {
    little: isTelugu ? "కొంచెం" : "a little",
    medium: isTelugu ? "మధ్యస్థంగా" : "quite",
    much: isTelugu ? "చాలా ఎక్కువ" : "very much",
  }[intensity];

  const fullMessageText = selectedEmotion
    ? isTelugu
      ? `నేను ${intensityLabel} ${selectedEmotion.teluguLabel}గా ఉన్నాను${
          selectedTrigger ? ` (${selectedTrigger.teluguLabel} వల్ల)` : ""
        }.${selectedAction ? ` ${selectedAction.teluguLabel}` : ""}`
      : `I feel ${intensityLabel} ${selectedEmotion.label.toLowerCase()}${
          selectedTrigger ? ` because of ${selectedTrigger.label.toLowerCase()}` : ""
        }.${selectedAction ? ` ${selectedAction.label}` : ""}`
    : "";

  const handleShareMessage = () => {
    if (!selectedEmotion) return;
    setMessageShared(true);
    playSound("chime");

    recordEmotionCheckIn({
      emotionId: selectedEmotion.id,
      emotionLabel: selectedEmotion.label,
      intensity,
      reasonId: selectedTrigger?.id || "not_specified",
      reasonLabel: selectedTrigger?.label || "None",
      actionId: selectedAction?.id || "none",
      actionLabel: selectedAction?.label || "None",
    });

    if (!isSilent) {
      speak(fullMessageText, preferences.ttsLanguage);
    }
    showNotice("Emotion message ready for teacher or parent ♡");
  };

  const handleReset = () => {
    setSelectedTrigger(null);
    setSelectedAction(null);
    setMessageShared(false);
    playSound("swoosh");
  };

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-6 max-w-[1040px] mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FCEFF2] border border-[#F2CDD9] rounded-full text-[#AD5972] font-bold text-xs sm:text-sm mb-2 shadow-sm">
          <Heart size={16} /> Emotion Assistant & Expression
        </div>
        <h1
          className="text-[#5C6F5E] font-bold text-2xl sm:text-3xl md:text-4xl"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {isTelugu ? "ఈ రోజు మీ మనస్సు ఎలా ఉంది? ♡" : "How are you feeling right now? ♡"}
        </h1>
        <p className="mt-1 text-[#777572] text-xs sm:text-sm max-w-lg mx-auto">
          {isTelugu
            ? "మీ భావాలను ఎంచుకోండి. ప్రతి భావన ముఖ్యమైనది మరియు గౌరవించదగినది."
            : "Every emotion is okay. Pick how you feel, explore gentle suggestions, or share with an adult."}
        </p>
      </div>

      {/* TTS Audio Controls */}
      <div className="mb-6">
        <TTSPlayerControls lastText={fullMessageText} className="w-full text-xs" />
      </div>

      {/* 1. EMOTIONS CARDS GRID (10 Illustrated Cards) */}
      <section className="mb-8" aria-label="Emotion Cards">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#8F7D82] mb-3 text-center sm:text-left">
          {isTelugu ? "1. మీ భావనను ఎంచుకోండి (Select Your Emotion)" : "1. Choose Your Emotion"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {emotionDefinitions.map((em) => {
            const isSelected = selectedEmotion?.id === em.id;
            return (
              <button
                key={em.id}
                onClick={() => handleSelectEmotion(em)}
                className={`p-3.5 rounded-[22px] border-2 transition-all flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-1 active:scale-95 relative
                  ${em.bgColor} ${em.borderColor}
                  ${
                    isSelected
                      ? "ring-4 ring-[#718D75]/40 border-[#718D75] shadow-md scale-[1.03]"
                      : "hover:border-[#C9879C]"
                  }
                `}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#718D75] text-white flex items-center justify-center text-[10px] shadow-sm">
                    <Check size={12} />
                  </span>
                )}
                <span className="text-4xl sm:text-5xl my-1">{em.emoji}</span>
                <strong className={`text-xs sm:text-sm font-extrabold ${em.color} leading-tight`}>
                  {em.label}
                </strong>
                <span className="text-[11px] text-[#7A6B6F] font-semibold mt-0.5">
                  {em.teluguLabel}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. SELECTED EMOTION EXPLANATION & SUGGESTIONS */}
      {selectedEmotion && (
        <section className="p-5 sm:p-6 rounded-[26px] bg-[#FFFDFB] border-2 border-[#EADFE0] shadow-md mb-8 animate-float-up">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <span className="text-6xl p-3 rounded-2xl bg-[#FFF8F5] border border-[#F0DFE3] shrink-0">
              {selectedEmotion.emoji}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-[#514B4B]" style={{ fontFamily: "Georgia, serif" }}>
                  {isTelugu ? `నేను ${selectedEmotion.teluguLabel}గా ఉన్నాను` : `I feel ${selectedEmotion.label}`}
                </h3>
                <button
                  onClick={() =>
                    speak(
                      isTelugu
                        ? `${selectedEmotion.teluguLabel}. ${selectedEmotion.teluguExplanation}`
                        : `${selectedEmotion.label}. ${selectedEmotion.explanation}`
                    )
                  }
                  className="p-1.5 rounded-full bg-white border border-[#E0D4D7] text-[#718D75] hover:bg-[#F0F7F2]"
                  title="Speak Explanation"
                >
                  <Volume2 size={16} />
                </button>
              </div>
              <p className="text-sm text-[#6E5E62] mt-1 font-medium">
                {isTelugu ? selectedEmotion.teluguExplanation : selectedEmotion.explanation}
              </p>

              {/* Supportive Suggestions */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                {selectedEmotion.suggestions.map((sugg, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF5F7] border border-[#EFE5E8] text-xs font-bold text-[#775F66]"
                  >
                    <span>{sugg.icon}</span>
                    <span>{isTelugu ? sugg.te : sugg.en}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. EMOTION INTENSITY SELECTOR */}
          <div className="mt-6 pt-5 border-t border-[#F2E8EB]">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8F7D82] block mb-2.5">
              {isTelugu ? "2. ఈ భావన ఎంత తీవ్రంగా ఉంది? (Intensity)" : "2. How big is this feeling?"}
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: "little", label: "A Little", telugu: "కొంచెం", emoji: "🌱", color: "bg-[#EFF8F2] border-[#CDE5D4]" },
                { id: "medium", label: "Medium", telugu: "మధ్యస్థంగా", emoji: "🌿", color: "bg-[#FFF9EA] border-[#F4E3B7]" },
                { id: "much", label: "Very Much", telugu: "చాలా ఎక్కువ", emoji: "🌳", color: "bg-[#FDF0ED] border-[#F2C7BD]" },
              ].map((lvl) => {
                const isSelected = intensity === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => handleSelectIntensity(lvl.id as EmotionIntensity)}
                    className={`py-3 px-3 rounded-2xl border-2 font-extrabold text-xs sm:text-sm flex flex-col items-center justify-center transition-all
                      ${lvl.color}
                      ${
                        isSelected
                          ? "ring-3 ring-[#718D75] border-[#718D75] shadow-sm scale-[1.02]"
                          : "opacity-75 hover:opacity-100"
                      }`}
                  >
                    <span className="text-2xl mb-0.5">{lvl.emoji}</span>
                    <span>{isTelugu ? lvl.telugu : lvl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. VISUAL QUESTION: "Why are you feeling this way?" */}
          <div className="mt-6 pt-5 border-t border-[#F2E8EB]">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8F7D82] block mb-2.5">
              {isTelugu ? "3. ఎందుకు ఇలా అనిపిస్తోంది? (Why are you feeling this way?)" : "3. Why are you feeling this way?"}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {emotionTriggers.map((trig) => {
                const isSelected = selectedTrigger?.id === trig.id;
                return (
                  <button
                    key={trig.id}
                    onClick={() => handleSelectTrigger(trig)}
                    className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-2.5 text-left
                      ${
                        isSelected
                          ? "border-[#718D75] bg-[#EAF5ED] text-[#34593C] ring-2 ring-[#718D75]/30 shadow-sm"
                          : "border-[#ECE2E4] bg-white text-[#63575B] hover:bg-[#FAF5F7]"
                      }`}
                  >
                    <span className="text-2xl shrink-0">{trig.emoji}</span>
                    <span className="text-xs font-bold leading-tight">
                      {isTelugu ? trig.teluguLabel : trig.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. SUPPORTIVE ACTION RESPONSES */}
          <div className="mt-6 pt-5 border-t border-[#F2E8EB]">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#8F7D82] block mb-2.5">
              {isTelugu ? "4. మీకు ఏమి సహాయం కావాలి? (What would help you?)" : "4. What would help you right now?"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {emotionSupportActions.map((act) => {
                const isSelected = selectedAction?.id === act.id;
                return (
                  <button
                    key={act.id}
                    onClick={() => handleSelectAction(act)}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center gap-3 text-left
                      ${
                        isSelected
                          ? "border-[#C9879C] bg-[#FCEFF2] text-[#8F596B] ring-2 ring-[#C9879C]/30 shadow-sm"
                          : "border-[#ECE2E4] bg-white text-[#5F5356] hover:bg-[#FAF5F7]"
                      }`}
                  >
                    <span className="text-3xl shrink-0">{act.emoji}</span>
                    <span className="text-xs sm:text-sm font-extrabold">
                      {isTelugu ? act.teluguLabel : act.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. CAREGIVER VISUAL MESSAGE CARD */}
          <div className="mt-7 pt-5 border-t-2 border-[#EADFE0]">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5F7] border border-[#ECD9DF] shadow-sm">
              <span className="text-[11px] font-extrabold text-[#9A737E] uppercase tracking-wider block mb-1">
                {isTelugu ? "టీచర్ లేదా తల్లిదండ్రులకు సందేశం" : "Visual Message for Teacher or Caregiver"}
              </span>
              <p className="text-base sm:text-lg font-bold text-[#55474B] leading-relaxed">
                "{fullMessageText}"
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareMessage}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#718D75] text-white font-extrabold text-sm shadow-md hover:bg-[#5C7760] transition-all"
                  >
                    <Send size={15} />
                    <span>{messageShared ? "Message Ready! 🌟" : "Save & Speak Message"}</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-2.5 rounded-full bg-white border border-[#DDD3D6] text-[#716165] hover:bg-[#F2EBED]"
                    title="Reset message"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>

                {messageShared && (
                  <span className="text-xs font-bold text-[#476D4D] flex items-center gap-1">
                    <Sparkles size={14} className="text-[#EBCB79]" />
                    <span>Logged in dashboard and spoken!</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
