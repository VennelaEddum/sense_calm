import { useState, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import Confetti from "@/components/Confetti";
import TTSPlayerControls from "@/components/TTSPlayerControls";
import { learningTopics } from "@/data/learningData";
import {
  pictureDetectiveData,
  emotionExplorerData,
  buildSentenceData,
  whatHappensNextData,
  everydaySituationData,
} from "@/data/gamesData";
import {
  Gamepad2,
  Check,
  X,
  ArrowRight,
  RotateCcw,
  Volume2,
  Sparkles,
  Trophy,
  Star,
  Search,
  Heart,
  Puzzle,
  FastForward,
  Compass,
  Sprout,
} from "lucide-react";

type ActiveGameMode =
  | "detective"
  | "emotions"
  | "sentence"
  | "sequence"
  | "situations"
  | "fundamentals";

export default function LearningPage() {
  const {
    recordAnswer,
    recordGameCompleted,
    preferences,
    speak,
    playSound,
    showNotice,
    progress,
  } = useApp();

  const [activeGame, setActiveGame] = useState<ActiveGameMode>("detective");
  const [celebrate, setCelebrate] = useState(false);

  // Picture Detective State
  const [detectiveIndex, setDetectiveIndex] = useState(0);
  const [detectiveFeedback, setDetectiveFeedback] = useState<{
    selectedId: string;
    isCorrect: boolean;
  } | null>(null);

  // Emotion Explorer State
  const [emotionIndex, setEmotionIndex] = useState(0);
  const [emotionFeedback, setEmotionFeedback] = useState<{
    selectedEmotion: string;
    isCorrect: boolean;
  } | null>(null);

  // Build the Sentence State
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState<
    { id: string; text: string; teluguText: string; emoji: string; order: number }[]
  >([]);
  const [sentenceFeedback, setSentenceFeedback] = useState<boolean | null>(null);

  // What Happens Next State
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [sequenceFeedback, setSequenceFeedback] = useState<{
    selectedId: string;
    isCorrect: boolean;
  } | null>(null);

  // Everyday Situations State
  const [situationIndex, setSituationIndex] = useState(0);
  const [situationFeedback, setSituationFeedback] = useState<{
    optionId: string;
    isBest: boolean;
    feedback: string;
  } | null>(null);

  // Fundamentals (Original quiz) State
  const [fundTopic, setFundTopic] = useState<string>("colours");
  const [fundRound, setFundRound] = useState(0);
  const [fundFeedback, setFundFeedback] = useState<{
    correct: boolean;
    selectedIndex: number;
  } | null>(null);

  const isTelugu = preferences.ttsLanguage === "te";
  const isSilent = preferences.silentMode || preferences.muted;

  // Trigger celebration
  const triggerCelebration = useCallback(() => {
    if (!preferences.quietMode && !preferences.reducedMotion) {
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 2500);
    }
  }, [preferences.quietMode, preferences.reducedMotion]);

  // ==========================================
  // GAME 1 HANDLER: PICTURE DETECTIVE
  // ==========================================
  const currentDetective = pictureDetectiveData[detectiveIndex % pictureDetectiveData.length];

  const handleDetectiveChoice = (optionId: string, isCorrect: boolean, label: string) => {
    if (detectiveFeedback) return;
    setDetectiveFeedback({ selectedId: optionId, isCorrect });
    recordAnswer(isCorrect);

    if (isCorrect) {
      playSound("chime");
      triggerCelebration();
      recordGameCompleted("Picture Detective", 15);
      if (!isSilent) {
        speak(isTelugu ? `అద్భుతం! ఇది ${label}!` : `Wonderful! You found the ${label}!`);
      }
    } else {
      playSound("pop");
      if (!isSilent) {
        speak(isTelugu ? "మరొకటి ప్రయత్నించండి!" : "Good try! Look closely at the clue.");
      }
    }
  };

  const nextDetective = () => {
    setDetectiveIndex((prev) => (prev + 1) % pictureDetectiveData.length);
    setDetectiveFeedback(null);
    playSound("swoosh");
  };

  // ==========================================
  // GAME 2 HANDLER: EMOTION EXPLORER
  // ==========================================
  const currentEmotion = emotionExplorerData[emotionIndex % emotionExplorerData.length];

  const handleEmotionChoice = (selectedEmotion: string, isCorrect: boolean) => {
    if (emotionFeedback) return;
    setEmotionFeedback({ selectedEmotion, isCorrect });
    recordAnswer(isCorrect);

    if (isCorrect) {
      playSound("chime");
      triggerCelebration();
      recordGameCompleted("Emotion Explorer", 15);
      if (!isSilent) {
        speak(
          isTelugu
            ? `అవును! ఇది ${currentEmotion.teluguEmotion}!`
            : `Yes! That feels ${currentEmotion.emotion}!`
        );
      }
    } else {
      playSound("pop");
      if (!isSilent) {
        speak(isTelugu ? "మరొక ఎంపికను చూడండి!" : "That's okay! Try another feeling.");
      }
    }
  };

  const nextEmotion = () => {
    setEmotionIndex((prev) => (prev + 1) % emotionExplorerData.length);
    setEmotionFeedback(null);
    playSound("swoosh");
  };

  // ==========================================
  // GAME 3 HANDLER: BUILD THE SENTENCE
  // ==========================================
  const currentSentencePuzzle = buildSentenceData[sentenceIndex % buildSentenceData.length];

  const handleAddSentenceToken = (token: (typeof currentSentencePuzzle.tokens)[0]) => {
    if (selectedTokens.some((t) => t.id === token.id)) return;
    const updated = [...selectedTokens, token];
    setSelectedTokens(updated);
    playSound("pop");
    if (!isSilent) {
      speak(isTelugu ? token.teluguText : token.text);
    }
  };

  const handleRemoveSentenceToken = (tokenId: string) => {
    setSelectedTokens((prev) => prev.filter((t) => t.id !== tokenId));
    setSentenceFeedback(null);
    playSound("pop");
  };

  const checkSentencePuzzle = () => {
    if (selectedTokens.length !== currentSentencePuzzle.tokens.length) {
      showNotice("Please place all word cards in the sentence slots.");
      return;
    }
    const isCorrect = selectedTokens.every((token, idx) => token.order === idx);
    setSentenceFeedback(isCorrect);
    recordAnswer(isCorrect);

    if (isCorrect) {
      playSound("celebration");
      triggerCelebration();
      recordGameCompleted("Build the Sentence", 20);
      const fullText = isTelugu
        ? currentSentencePuzzle.teluguSentence
        : currentSentencePuzzle.targetSentence;
      if (!isSilent) {
        speak(fullText);
      }
    } else {
      playSound("pop");
      if (!isSilent) {
        speak("Listen carefully and try arranging the cards again.");
      }
    }
  };

  const nextSentencePuzzle = () => {
    setSentenceIndex((prev) => (prev + 1) % buildSentenceData.length);
    setSelectedTokens([]);
    setSentenceFeedback(null);
    playSound("swoosh");
  };

  // ==========================================
  // GAME 4 HANDLER: WHAT HAPPENS NEXT?
  // ==========================================
  const currentSequence = whatHappensNextData[sequenceIndex % whatHappensNextData.length];

  const handleSequenceChoice = (optionId: string, isCorrect: boolean, label: string) => {
    if (sequenceFeedback) return;
    setSequenceFeedback({ selectedId: optionId, isCorrect });
    recordAnswer(isCorrect);

    if (isCorrect) {
      playSound("chime");
      triggerCelebration();
      recordGameCompleted("What Happens Next?", 15);
      if (!isSilent) {
        speak(isTelugu ? `చక్కగా చెప్పారు! తరువాత ${label}!` : `Spot on! Next is ${label}!`);
      }
    } else {
      playSound("pop");
      if (!isSilent) {
        speak(isTelugu ? "మరొకటి ఆలోచించండి!" : "Think what makes sense next!");
      }
    }
  };

  const nextSequence = () => {
    setSequenceIndex((prev) => (prev + 1) % whatHappensNextData.length);
    setSequenceFeedback(null);
    playSound("swoosh");
  };

  // ==========================================
  // GAME 5 HANDLER: EVERYDAY SITUATIONS
  // ==========================================
  const currentSituation = everydaySituationData[situationIndex % everydaySituationData.length];

  const handleSituationChoice = (
    optionId: string,
    isBest: boolean,
    feedbackText: string,
    responseText: string
  ) => {
    if (situationFeedback) return;
    setSituationFeedback({ optionId, isBest, feedback: feedbackText });
    recordAnswer(isBest);

    if (isBest) {
      playSound("celebration");
      triggerCelebration();
      recordGameCompleted("Everyday Situations", 15);
      if (!isSilent) {
        speak(responseText);
      }
    } else {
      playSound("pop");
      if (!isSilent) {
        speak(feedbackText);
      }
    }
  };

  const nextSituation = () => {
    setSituationIndex((prev) => (prev + 1) % everydaySituationData.length);
    setSituationFeedback(null);
    playSound("swoosh");
  };

  // ==========================================
  // FUNDAMENTALS (ORIGINAL QUIZ PRESERVED)
  // ==========================================
  const fundQuestions = learningTopics[fundTopic];
  const fundQ = fundQuestions[fundRound % fundQuestions.length];

  const handleFundAnswer = (idx: number) => {
    if (fundFeedback) return;
    const isCorrect = idx === fundQ.answer;
    setFundFeedback({ correct: isCorrect, selectedIndex: idx });
    recordAnswer(isCorrect);
    if (isCorrect) {
      playSound("chime");
      triggerCelebration();
      recordGameCompleted(`Fundamentals: ${fundTopic}`, 10);
    } else {
      playSound("pop");
    }
  };

  const nextFundQuestion = () => {
    setFundRound((prev) => (prev + 1) % fundQuestions.length);
    setFundFeedback(null);
    playSound("swoosh");
  };

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-6 max-w-[1040px] mx-auto">
      <Confetti active={celebrate} />

      {/* Header Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#B9D5B9] rounded-full text-[#385D40] font-bold text-xs sm:text-sm mb-2 shadow-sm">
          <Gamepad2 size={16} /> Interactive Learning Games
        </div>
        <h1
          className="text-[#5C6F5E] font-bold text-2xl sm:text-3xl md:text-4xl"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {isTelugu ? "ఆడుకుంటూ నేర్చుకుందాం! 🌟" : "Play, Discover & Grow! 🌟"}
        </h1>
        <p className="mt-1 text-[#777572] text-sm sm:text-base max-w-lg mx-auto">
          {isTelugu
            ? "రంగురంగుల చిత్రాలతో సరదా ఆటలు. ఎటువంటి తొందర లేదు!"
            : "Visual-first gentle games. Take your time, discover clues, and collect stars!"}
        </p>

        {/* Live Score & Streak Bar */}
        <div className="mt-4 flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#D7E4D9] text-xs sm:text-sm font-bold text-[#476D4D] shadow-sm">
            <Trophy size={15} className="text-[#EBCB79]" />
            <span>Points: {progress.totalPoints}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#D7E4D9] text-xs sm:text-sm font-bold text-[#476D4D] shadow-sm">
            <Star size={15} className="text-[#EBCB79] fill-[#EBCB79]" />
            <span>Games Done: {progress.totalGamesCompleted}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#D7E4D9] text-xs sm:text-sm font-bold text-[#476D4D] shadow-sm">
            <span className="text-sm">🔥</span>
            <span>Streak: {progress.currentStreak} {progress.currentStreak === 1 ? "day" : "days"}</span>
          </div>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {[
          { id: "detective", label: "Picture Detective", icon: Search, emoji: "🔍" },
          { id: "emotions", label: "Emotion Explorer", icon: Heart, emoji: "💖" },
          { id: "sentence", label: "Build the Sentence", icon: Puzzle, emoji: "🧩" },
          { id: "sequence", label: "What Happens Next?", icon: FastForward, emoji: "⏳" },
          { id: "situations", label: "Everyday Situations", icon: Compass, emoji: "🤝" },
          { id: "fundamentals", label: "Everyday Fundamentals", icon: Sprout, emoji: "🌱" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeGame === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveGame(tab.id as ActiveGameMode);
                playSound("pop");
              }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap border-2 transition-all flex items-center gap-2
                ${
                  isActive
                    ? "bg-[#718D75] border-[#59755D] text-white shadow-md scale-[1.02]"
                    : "bg-white border-[#E9DFE2] text-[#63575B] hover:bg-[#F9F3F5] hover:border-[#D5C2C7]"
                }`}
            >
              <span className="text-base">{tab.emoji}</span>
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TTS Audio Controls Bar */}
      <div className="mb-6">
        <TTSPlayerControls className="w-full text-xs" />
      </div>

      {/* ========================================================
          GAME 1: PICTURE DETECTIVE
      ======================================================== */}
      {activeGame === "detective" && (
        <div className="p-5 sm:p-7 rounded-[26px] bg-[#FFF8F5] border-2 border-[#E7D6DA] shadow-md animate-float-up">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#E5EFF7] text-[#42647E] text-xs font-extrabold uppercase tracking-wide">
                Clue #{detectiveIndex + 1} of {pictureDetectiveData.length}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F5DCE3] text-[#8F596B] text-[11px] font-bold capitalize">
                Level: {currentDetective.level}
              </span>
            </div>
            <button
              onClick={() => speak(isTelugu ? currentDetective.teluguClue : currentDetective.clue)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718D75] bg-white px-3 py-1.5 rounded-full border border-[#D5E4D8] hover:bg-[#F0F7F2]"
              title="Hear Clue"
            >
              <Volume2 size={14} />
              <span>Read Clue</span>
            </button>
          </div>

          {/* Big Clue Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE5E7] mb-6 text-center">
            <span className="text-4xl mb-2 block">{currentDetective.clueEmoji}</span>
            <h2
              className="text-[#514B4B] font-bold text-lg sm:text-xl md:text-2xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "{isTelugu ? currentDetective.teluguClue : currentDetective.clue}"
            </h2>
          </div>

          {/* 4 Picture Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {currentDetective.options.map((option) => {
              const isSelected = detectiveFeedback?.selectedId === option.id;
              let borderClass = "border-[#EADFE1] bg-white hover:border-[#718D75]";
              if (detectiveFeedback) {
                if (option.isCorrect) {
                  borderClass = "border-[#718D75] bg-[#EAF5ED] ring-4 ring-[#718D75]/30";
                } else if (isSelected && !option.isCorrect) {
                  borderClass = "border-[#D98787] bg-[#FDF2F2]";
                } else {
                  borderClass = "border-[#EFE5E7] bg-white opacity-50";
                }
              }

              return (
                <button
                  key={option.id}
                  onClick={() =>
                    handleDetectiveChoice(
                      option.id,
                      option.isCorrect,
                      isTelugu ? option.teluguLabel : option.label
                    )
                  }
                  disabled={detectiveFeedback !== null}
                  className={`p-4 rounded-[20px] border-2 transition-all flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-1 ${borderClass}`}
                >
                  <span className="text-4xl sm:text-5xl mb-2">{option.emoji}</span>
                  <strong className="text-sm font-extrabold text-[#52494C]">
                    {isTelugu ? option.teluguLabel : option.label}
                  </strong>
                  {isSelected && option.isCorrect && (
                    <span className="mt-1 text-xs text-[#4F7354] font-bold flex items-center gap-1">
                      <Check size={14} /> Found it! ⭐
                    </span>
                  )}
                  {isSelected && !option.isCorrect && (
                    <span className="mt-1 text-[11px] text-[#A64545] font-semibold">
                      {option.hint || "Try another!"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-[#EFE5E7]">
            <p className="font-bold text-sm sm:text-base text-[#52494C]">
              {detectiveFeedback?.isCorrect === true && "🎉 Wonderful detective work! You found the right match! ⭐"}
              {detectiveFeedback?.isCorrect === false && "Good observation! Let's discover together. ♡"}
            </p>
            <button
              onClick={nextDetective}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#718D75] text-white font-extrabold text-sm hover:bg-[#5E7962] transition-all shrink-0"
            >
              <span>Next Clue</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          GAME 2: EMOTION EXPLORER
      ======================================================== */}
      {activeGame === "emotions" && (
        <div className="p-5 sm:p-7 rounded-[26px] bg-[#FFF8F5] border-2 border-[#E7D6DA] shadow-md animate-float-up">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#FCEFF2] text-[#8F596B] text-xs font-extrabold uppercase">
              Emotion Scenario #{emotionIndex + 1} of {emotionExplorerData.length}
            </span>
            <button
              onClick={() =>
                speak(isTelugu ? currentEmotion.teluguScenario : currentEmotion.scenario)
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718D75] bg-white px-3 py-1.5 rounded-full border border-[#D5E4D8] hover:bg-[#F0F7F2]"
            >
              <Volume2 size={14} />
              <span>Read Scenario</span>
            </button>
          </div>

          {/* Scenario Display */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFE5E7] mb-6 text-center">
            <span className="text-5xl mb-2 block">{currentEmotion.emoji}</span>
            <p
              className="text-[#514B4B] font-bold text-lg sm:text-xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "{isTelugu ? currentEmotion.teluguScenario : currentEmotion.scenario}"
            </p>
            <p className="text-xs text-[#8F7D82] mt-2 font-bold uppercase tracking-wider">
              {isTelugu ? "బెబ్బోకి ఎలా అనిపిస్తుంది? (How does Bebbo feel?)" : "How does Bebbo feel right now?"}
            </p>
          </div>

          {/* Emotion Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {currentEmotion.options.map((opt) => {
              const isSelected = emotionFeedback?.selectedEmotion === opt.emotion;
              let borderClass = "border-[#EADFE1] bg-white hover:border-[#C9879C]";
              if (emotionFeedback) {
                if (opt.isCorrect) {
                  borderClass = "border-[#718D75] bg-[#EAF5ED] ring-4 ring-[#718D75]/30";
                } else if (isSelected && !opt.isCorrect) {
                  borderClass = "border-[#D98787] bg-[#FDF2F2]";
                } else {
                  borderClass = "border-[#EFE5E7] bg-white opacity-50";
                }
              }

              return (
                <button
                  key={opt.emotion}
                  onClick={() => handleEmotionChoice(opt.emotion, opt.isCorrect)}
                  disabled={emotionFeedback !== null}
                  className={`p-4 rounded-[20px] border-2 transition-all flex items-center justify-center gap-3 shadow-sm hover:-translate-y-1 ${borderClass}`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <strong className="text-base font-extrabold text-[#52494C]">
                    {opt.emotion}
                  </strong>
                  {isSelected && opt.isCorrect && <Check size={18} className="text-[#4F7354]" />}
                  {isSelected && !opt.isCorrect && <X size={18} className="text-[#A64545]" />}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-[#EFE5E7]">
            <p className="font-bold text-sm sm:text-base text-[#52494C]">
              {emotionFeedback?.isCorrect === true && "✨ That's right! You recognized that feeling with kindness! 💖"}
              {emotionFeedback?.isCorrect === false && "Every feeling is valid! Let's explore together. ♡"}
            </p>
            <button
              onClick={nextEmotion}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#718D75] text-white font-extrabold text-sm hover:bg-[#5E7962] transition-all shrink-0"
            >
              <span>Next Feeling</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          GAME 3: BUILD THE SENTENCE
      ======================================================== */}
      {activeGame === "sentence" && (
        <div className="p-5 sm:p-7 rounded-[26px] bg-[#FFF8F5] border-2 border-[#E7D6DA] shadow-md animate-float-up">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#FFF3E0] text-[#7A561E] text-xs font-extrabold uppercase">
              Sentence Puzzle #{sentenceIndex + 1} of {buildSentenceData.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  speak(
                    isTelugu
                      ? currentSentencePuzzle.teluguSentence
                      : currentSentencePuzzle.targetSentence
                  )
                }
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718D75] bg-white px-3 py-1.5 rounded-full border border-[#D5E4D8] hover:bg-[#F0F7F2]"
              >
                <Volume2 size={14} />
                <span>Hear Target Sentence</span>
              </button>
            </div>
          </div>

          <div className="text-center mb-5">
            <span className="text-4xl block mb-1">{currentSentencePuzzle.hintEmoji}</span>
            <h3
              className="text-[#514B4B] font-bold text-lg sm:text-xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {isTelugu ? "క్రింద ఉన్న కార్డులను క్రమంలో అమర్చండి:" : "Arrange the cards in order to build:"}
            </h3>
            <p className="text-[#718D75] font-extrabold text-base mt-1 italic">
              "{isTelugu ? currentSentencePuzzle.teluguSentence : currentSentencePuzzle.targetSentence}"
            </p>
          </div>

          {/* Constructed Sentence Slots */}
          <div className="min-h-[85px] p-4 rounded-2xl bg-white border-2 border-dashed border-[#D2C2C6] mb-6 flex items-center justify-center gap-2.5 flex-wrap">
            {selectedTokens.length === 0 ? (
              <span className="text-sm text-[#A8989C] font-medium">
                Tap cards from below to place them here in order
              </span>
            ) : (
              selectedTokens.map((token) => (
                <button
                  key={token.id}
                  onClick={() => handleRemoveSentenceToken(token.id)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#EAF3EC] border-2 border-[#718D75] text-[#3D5E43] font-extrabold text-sm shadow-sm hover:bg-[#FDEEEE] hover:border-[#D67C7C] hover:text-[#9A3838] transition-all group"
                  title="Click to remove"
                >
                  <span className="text-xl">{token.emoji}</span>
                  <span>{isTelugu ? token.teluguText : token.text}</span>
                  <X size={14} className="opacity-60 group-hover:opacity-100" />
                </button>
              ))
            )}
          </div>

          {/* Word Card Choices Pool */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
            {currentSentencePuzzle.tokens.map((token) => {
              const isUsed = selectedTokens.some((t) => t.id === token.id);
              return (
                <button
                  key={token.id}
                  onClick={() => handleAddSentenceToken(token)}
                  disabled={isUsed}
                  className={`px-4 py-3 rounded-2xl border-2 font-extrabold text-sm flex items-center gap-2 transition-all shadow-sm
                    ${
                      isUsed
                        ? "bg-[#F3EFEF] border-[#E2DADF] text-[#A69B9E] opacity-50 cursor-not-allowed"
                        : "bg-white border-[#E4CAD2] text-[#554549] hover:-translate-y-1 hover:border-[#C9879C] hover:shadow-md cursor-pointer"
                    }`}
                >
                  <span className="text-2xl">{token.emoji}</span>
                  <span>{isTelugu ? token.teluguText : token.text}</span>
                </button>
              );
            })}
          </div>

          {/* Sentence Action Controls */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#EFE5E7] flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={checkSentencePuzzle}
                disabled={selectedTokens.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#718D75] text-white font-extrabold text-sm hover:bg-[#5E7962] disabled:opacity-50 transition-all"
              >
                <Check size={16} />
                <span>Check Sentence</span>
              </button>
              <button
                onClick={() => {
                  setSelectedTokens([]);
                  setSentenceFeedback(null);
                  playSound("swoosh");
                }}
                className="p-2.5 rounded-full bg-[#F3ECEE] text-[#69565B] hover:bg-[#EBDDE0]"
                title="Reset word cards"
              >
                <RotateCcw size={16} />
              </button>
            </div>

            {sentenceFeedback === true && (
              <span className="text-sm font-extrabold text-[#477057] flex items-center gap-1.5">
                <Sparkles size={16} /> Perfectly built! ⭐
              </span>
            )}
            {sentenceFeedback === false && (
              <span className="text-sm font-extrabold text-[#A84A4A]">
                Almost there! Listen and try the words in order.
              </span>
            )}

            <button
              onClick={nextSentencePuzzle}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#D5E4D8] text-[#556958] font-extrabold text-sm hover:bg-[#F0F7F2] transition-all ml-auto"
            >
              <span>Next Sentence</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          GAME 4: WHAT HAPPENS NEXT?
      ======================================================== */}
      {activeGame === "sequence" && (
        <div className="p-5 sm:p-7 rounded-[26px] bg-[#FFF8F5] border-2 border-[#E7D6DA] shadow-md animate-float-up">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#EBF3EC] text-[#476D4D] text-xs font-extrabold uppercase">
              Sequence Story #{sequenceIndex + 1}: {isTelugu ? currentSequence.teluguTitle : currentSequence.title}
            </span>
            <button
              onClick={() =>
                speak(
                  isTelugu
                    ? `${currentSequence.steps.map((s) => s.teluguLabel).join(", ")}. తరువాత ఏమి జరుగుతుంది?`
                    : `${currentSequence.steps.map((s) => s.label).join(", ")}. What happens next?`
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718D75] bg-white px-3 py-1.5 rounded-full border border-[#D5E4D8] hover:bg-[#F0F7F2]"
            >
              <Volume2 size={14} />
              <span>Read Story Steps</span>
            </button>
          </div>

          {/* Visual Sequence Story Flow */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 flex-wrap">
            {currentSequence.steps.map((step) => (
              <div
                key={step.stepNumber}
                className="flex items-center gap-2 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-[#E3D4D7] shadow-sm min-w-[130px] max-w-[200px] text-center flex-col"
              >
                <span className="w-6 h-6 rounded-full bg-[#718D75] text-white text-xs font-extrabold flex items-center justify-center">
                  {step.stepNumber}
                </span>
                <span className="text-3xl sm:text-4xl">{step.emoji}</span>
                <span className="text-xs sm:text-sm font-bold text-[#55494C]">
                  {isTelugu ? step.teluguLabel : step.label}
                </span>
              </div>
            ))}

            <span className="text-2xl text-[#C9879C] font-extrabold">➔</span>

            {/* Target Mystery Step Box */}
            <div className="flex items-center justify-center p-4 rounded-2xl bg-[#FFF0F4] border-2 border-dashed border-[#C9879C] min-w-[130px] max-w-[200px] text-center flex-col animate-pulse">
              <span className="w-6 h-6 rounded-full bg-[#C9879C] text-white text-xs font-extrabold flex items-center justify-center">
                ?
              </span>
              <span className="text-3xl sm:text-4xl my-1">❓</span>
              <span className="text-xs font-extrabold text-[#8F596B]">What happens next?</span>
            </div>
          </div>

          <h4 className="text-center text-sm font-extrabold text-[#52494C] mb-4">
            {isTelugu ? "సరైన తదుపరి చర్యను ఎంచుకోండి:" : "Choose what happens next:"}
          </h4>

          {/* Candidate Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {currentSequence.options.map((opt) => {
              const isSelected = sequenceFeedback?.selectedId === opt.id;
              let borderClass = "border-[#EADFE1] bg-white hover:border-[#718D75]";
              if (sequenceFeedback) {
                if (opt.isCorrect) {
                  borderClass = "border-[#718D75] bg-[#EAF5ED] ring-4 ring-[#718D75]/30";
                } else if (isSelected && !opt.isCorrect) {
                  borderClass = "border-[#D98787] bg-[#FDF2F2]";
                } else {
                  borderClass = "border-[#EFE5E7] bg-white opacity-50";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() =>
                    handleSequenceChoice(
                      opt.id,
                      opt.isCorrect,
                      isTelugu ? opt.teluguLabel : opt.label
                    )
                  }
                  disabled={sequenceFeedback !== null}
                  className={`p-4 rounded-[20px] border-2 transition-all flex flex-col items-center justify-center text-center shadow-sm hover:-translate-y-1 ${borderClass}`}
                >
                  <span className="text-3xl sm:text-4xl mb-1.5">{opt.emoji}</span>
                  <strong className="text-xs sm:text-sm font-extrabold text-[#52494C]">
                    {isTelugu ? opt.teluguLabel : opt.label}
                  </strong>
                  {isSelected && opt.isCorrect && (
                    <span className="mt-1 text-xs text-[#4F7354] font-bold flex items-center gap-1">
                      <Check size={14} /> Correct sequence! ⭐
                    </span>
                  )}
                  {isSelected && !opt.isCorrect && (
                    <span className="mt-1 text-xs text-[#A64545] font-semibold">
                      Think about the next step!
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sequence Footer */}
          <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-[#EFE5E7]">
            <p className="font-bold text-sm sm:text-base text-[#52494C]">
              {sequenceFeedback?.isCorrect === true && "🌟 Brilliant! You followed the story steps perfectly! 🌸"}
              {sequenceFeedback?.isCorrect === false && "Nice try! Every day has its little steps. ♡"}
            </p>
            <button
              onClick={nextSequence}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#718D75] text-white font-extrabold text-sm hover:bg-[#5E7962] transition-all shrink-0"
            >
              <span>Next Sequence</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          GAME 5: EVERYDAY SITUATION CHALLENGE
      ======================================================== */}
      {activeGame === "situations" && (
        <div className="p-5 sm:p-7 rounded-[26px] bg-[#FFF8F5] border-2 border-[#E7D6DA] shadow-md animate-float-up">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#FCEFF2] text-[#8F596B] text-xs font-extrabold uppercase">
              Real-Life Situation #{situationIndex + 1} of {everydaySituationData.length}
            </span>
            <button
              onClick={() =>
                speak(
                  isTelugu
                    ? currentSituation.teluguSituation
                    : currentSituation.situation
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718D75] bg-white px-3 py-1.5 rounded-full border border-[#D5E4D8] hover:bg-[#F0F7F2]"
            >
              <Volume2 size={14} />
              <span>Read Situation</span>
            </button>
          </div>

          {/* Situation Context Box */}
          <div className="p-5 rounded-2xl bg-white border border-[#EFE5E7] mb-6 text-center">
            <span className="text-5xl mb-2 block">{currentSituation.contextEmoji}</span>
            <h3
              className="text-[#514B4B] font-bold text-lg sm:text-xl md:text-2xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              "{isTelugu ? currentSituation.teluguSituation : currentSituation.situation}"
            </h3>
            <p className="text-xs text-[#8F7D82] mt-2 font-bold uppercase tracking-wider">
              {isTelugu ? "మీరు ఏమి చేస్తారు? (What would you do?)" : "What is a gentle and helpful thing to do?"}
            </p>
          </div>

          {/* Situation Response Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {currentSituation.options.map((opt) => {
              const isSelected = situationFeedback?.optionId === opt.id;
              let borderClass = "border-[#EADFE1] bg-white hover:border-[#718D75]";
              if (situationFeedback) {
                if (opt.isBest) {
                  borderClass = "border-[#718D75] bg-[#EAF5ED] ring-4 ring-[#718D75]/30";
                } else if (isSelected && !opt.isBest) {
                  borderClass = "border-[#D98787] bg-[#FDF2F2]";
                } else {
                  borderClass = "border-[#EFE5E7] bg-white opacity-50";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() =>
                    handleSituationChoice(
                      opt.id,
                      opt.isBest,
                      opt.feedback,
                      isTelugu ? opt.teluguResponse : opt.response
                    )
                  }
                  disabled={situationFeedback !== null}
                  className={`p-4 sm:p-5 rounded-[20px] border-2 transition-all flex items-center gap-3 text-left shadow-sm hover:-translate-y-1 ${borderClass}`}
                >
                  <span className="text-3xl sm:text-4xl shrink-0">{opt.emoji}</span>
                  <div className="flex-1">
                    <strong className="text-sm sm:text-base font-extrabold text-[#52494C] block leading-snug">
                      {isTelugu ? opt.teluguResponse : opt.response}
                    </strong>
                    {isSelected && (
                      <p className={`text-xs mt-1 font-semibold ${opt.isBest ? "text-[#4F7354]" : "text-[#A64545]"}`}>
                        {opt.feedback}
                      </p>
                    )}
                  </div>
                  {isSelected && opt.isBest && <Check size={20} className="text-[#4F7354] shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Footer & Next */}
          <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-[#EFE5E7]">
            <p className="font-bold text-sm sm:text-base text-[#52494C]">
              {situationFeedback?.isBest === true && "💖 Excellent social care! You handled that situation wonderfully! ⭐"}
              {situationFeedback?.isBest === false && "It's always okay to take a moment and ask someone for help. ♡"}
            </p>
            <button
              onClick={nextSituation}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#718D75] text-white font-extrabold text-sm hover:bg-[#5E7962] transition-all shrink-0"
            >
              <span>Next Challenge</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          FUNDAMENTALS (ORIGINAL COLOURS, NUMBERS, SHAPES)
      ======================================================== */}
      {activeGame === "fundamentals" && (
        <div className="p-5 sm:p-7 rounded-[26px] bg-[#FFF8F5] border-2 border-[#E7D6DA] shadow-md animate-float-up">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[
              { key: "colours", label: "Colours", emoji: "🎨" },
              { key: "numbers", label: "Numbers", emoji: "🔢" },
              { key: "shapes", label: "Shapes", emoji: "🔷" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setFundTopic(t.key);
                  setFundRound(0);
                  setFundFeedback(null);
                  playSound("pop");
                }}
                className={`px-4 py-2 rounded-full border-2 font-bold transition-all text-xs sm:text-sm
                  ${
                    fundTopic === t.key
                      ? "border-[#718D75] bg-[#EAF5ED] text-[#34593C] shadow-sm"
                      : "border-[#E8CAD2] bg-white text-[#5B5555] hover:bg-[#FBF4F6]"
                  }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#EFE5E7] mb-6">
            <span className="text-[#92787B] text-[11px] font-extrabold tracking-[.14em] uppercase mb-1 block">
              Question #{fundRound + 1}
            </span>
            <h3
              className="text-lg sm:text-xl font-bold text-[#514B4B] mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {fundQ.prompt}
            </h3>

            <div className="grid gap-2.5">
              {fundQ.choices.map((choice, idx) => {
                const isCorrect = idx === fundQ.answer;
                const isSelected = fundFeedback?.selectedIndex === idx;
                let choiceClass = "border-[#E7DEDE] bg-white text-[#514B4B] hover:bg-[#F9F5F4]";
                if (fundFeedback) {
                  if (isCorrect) choiceClass = "border-[#7DB5A4] bg-[#E6F4ED] text-[#315C55]";
                  else if (isSelected) choiceClass = "border-[#D99B9B] bg-[#F8EEEE] text-[#77565A]";
                  else choiceClass = "border-[#E7DEDE] bg-white text-[#AAA] opacity-60";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleFundAnswer(idx)}
                    disabled={fundFeedback !== null}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left font-bold transition-all ${choiceClass}`}
                  >
                    <span className="text-base sm:text-lg">{choice}</span>
                    {fundFeedback && isCorrect && <Check size={20} className="text-[#5B9B7E]" />}
                    {fundFeedback && isSelected && !isCorrect && (
                      <X size={20} className="text-[#C47878]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#EFE5E7]">
            <p className="font-bold text-sm text-[#514B4B]">
              {fundFeedback?.correct === true && "Wonderful! You got it! ⭐"}
              {fundFeedback?.correct === false && "Good try! Let's learn together. ♡"}
            </p>
            <button
              onClick={nextFundQuestion}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#718D75] text-white font-extrabold text-sm hover:bg-[#5E7962] transition-all"
            >
              <span>Next Question</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
