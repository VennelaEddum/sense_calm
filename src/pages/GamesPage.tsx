import { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  gameList,
  pictureDetectiveQuestions,
  emotionQuestions,
  buildSentencePuzzles,
  sequenceQuestions,
  situationQuestions,
} from "@/data/learningData";
import type { GameId } from "@/types";
import Confetti from "@/components/Confetti";
import SpeakerButton from "@/components/SpeechControls";
import { Gamepad2, ArrowLeft, Check, X, ArrowRight, RefreshCw } from "lucide-react";

type GameMeta = (typeof gameList)[number];

export default function GamesPage() {
  const { recordGameComplete, recordAnswer, addPoints, preferences } = useApp();
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const triggerCelebrate = () => {
    if (preferences.quietMode || preferences.reducedMotion) return;
    setCelebrate(false);
    requestAnimationFrame(() => {
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 3000);
    });
  };

  const handleCorrect = (gameLabel: string) => {
    recordAnswer(true);
    addPoints(5);
    triggerCelebrate();
  };

  const handleGameComplete = (gameLabel: string) => {
    recordGameComplete(gameLabel, 10);
    triggerCelebrate();
  };

  if (activeGame) {
    const meta = gameList.find((g) => g.id === activeGame)!;
    return (
      <>
        <Confetti active={celebrate} />
        <GameRenderer
          gameId={activeGame}
          onCorrect={() => handleCorrect(meta.title)}
          onComplete={() => handleGameComplete(meta.title)}
          onBack={() => setActiveGame(null)}
        />
      </>
    );
  }

  return (
    <div className="w-full flex-1 px-5 py-8 max-w-[1000px] mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EBCB79] rounded-full text-[#73531E] font-bold text-sm mb-3">
          <Gamepad2 size={18} /> Games
        </div>
        <h1 className="text-[#5C6F5E] font-bold text-3xl md:text-4xl" style={{ fontFamily: "Georgia, serif" }}>
          Let's play and learn! 🎮
        </h1>
        <p className="mt-3 text-[#777572] text-base">
          Pick a game. Use pictures to play — no reading needed!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {gameList.map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`relative p-6 rounded-[22px] flex flex-col items-center text-center border-2 ${game.color} ${game.borderColor} shadow-[0_8px_24px_rgba(110,90,90,0.08)] transition-all hover:-translate-y-2 hover:shadow-[0_14px_28px_rgba(100,85,85,0.12)] cursor-pointer`}
          >
            <span className="text-5xl mb-3">{game.emoji}</span>
            <h2 className={`font-bold text-lg ${game.textColor}`} style={{ fontFamily: "Georgia, serif" }}>
              {game.title}
            </h2>
            <p className="mt-2 text-sm text-[#555653] leading-relaxed">{game.description}</p>
            <span className={`mt-4 text-sm font-extrabold ${game.textColor}`}>Play now →</span>
          </button>
        ))}
      </div>

      {preferences.silentMode && (
        <div className="mt-6 p-3 rounded-xl bg-[#FFF3E0] border border-[#EBCB79] text-[#73531E] font-bold text-sm text-center">
          🔇 Silent Mode is ON — games work with pictures and animations, but audio is muted.
        </div>
      )}
    </div>
  );
}

/* ===== Game renderer ===== */
function GameRenderer({
  gameId,
  onCorrect,
  onComplete,
  onBack,
}: {
  gameId: GameId;
  onCorrect: () => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  switch (gameId) {
    case "picture-detective":
      return <PictureDetectiveGame onCorrect={onCorrect} onComplete={onComplete} onBack={onBack} />;
    case "emotion-explorer":
      return <EmotionExplorerGame onCorrect={onCorrect} onComplete={onComplete} onBack={onBack} />;
    case "build-sentence":
      return <BuildSentenceGame onCorrect={onCorrect} onComplete={onComplete} onBack={onBack} />;
    case "what-happens-next":
      return <WhatHappensNextGame onCorrect={onCorrect} onComplete={onComplete} onBack={onBack} />;
    case "everyday-challenge":
      return <EverydayChallengeGame onCorrect={onCorrect} onComplete={onComplete} onBack={onBack} />;
    default:
      return null;
  }
}

/* ===== Shared game wrapper ===== */
function GameShell({ title, emoji, onBack, children }: { title: string; emoji: string; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="w-full flex-1 px-5 py-8 max-w-[700px] mx-auto">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[#6C846F] text-sm font-extrabold mb-4 transition-all hover:text-[#A66D80] hover:-translate-x-1"
      >
        <ArrowLeft size={16} /> All Games
      </button>
      <div className="text-center mb-6">
        <span className="text-5xl block mb-2">{emoji}</span>
        <h2 className="text-[#5C6F5E] font-bold text-2xl md:text-3xl" style={{ fontFamily: "Georgia, serif" }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}

/* ===== Feedback banner ===== */
function FeedbackBanner({ show, correct }: { show: boolean; correct: boolean }) {
  if (!show) return <div className="min-h-[28px]" />;
  return (
    <div
      className={`p-3 rounded-xl text-center font-bold text-lg animate-float-up ${
        correct ? "bg-[#e6f4ed] text-[#315c55] border border-[#7db5a4]" : "bg-[#f8eeee] text-[#77565a] border border-[#d99b9b]"
      }`}
    >
      {correct ? "🎉 Wonderful! You got it! ⭐" : "💪 Good try! Let's try again. ♡"}
    </div>
  );
}

/* ===== Game 1: Picture Detective ===== */
function PictureDetectiveGame({ onCorrect, onComplete, onBack }: { onCorrect: () => void; onComplete: () => void; onBack: () => void }) {
  const { recordAnswer } = useApp();
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null);
  const [completed, setCompleted] = useState(false);

  const q = pictureDetectiveQuestions[qIndex];

  const handleAnswer = (correct: boolean) => {
    if (answered) return;
    setAnswered(true);
    setFeedback({ correct });
    recordAnswer(correct);
    if (correct) onCorrect();
  };

  const handleNext = () => {
    if (qIndex + 1 >= pictureDetectiveQuestions.length) {
      setCompleted(true);
      onComplete();
    } else {
      setQIndex((i) => i + 1);
      setAnswered(false);
      setFeedback(null);
    }
  };

  return (
    <GameShell title="Picture Detective" emoji="🔍" onBack={onBack}>
      {completed ? (
        <div className="text-center p-8 rounded-2xl bg-[#e6f4ed] border border-[#7db5a4]">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-[#315c55] mb-2">You finished all rounds!</h3>
          <p className="text-[#5b9b7e] mb-4">You are a great detective! ⭐</p>
          <button onClick={onBack} className="px-6 py-3 rounded-full bg-[#718D75] text-white font-bold cursor-pointer hover:bg-[#5F7D64]">
            Back to Games
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-[17px] bg-[#f5efed]">
          <p className="text-[#92787b] text-[11px] font-extrabold tracking-[.14em] mb-2">ROUND {qIndex + 1} of {pictureDetectiveQuestions.length}</p>

          <div className="text-center mb-4">
            <div className="text-5xl mb-2">{q.sceneEmoji}</div>
            <p className="text-[#514b4b] font-bold">{q.sceneDescription}</p>
            <p className="text-lg font-bold text-[#5C6F5E] mt-2">{q.prompt}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {q.options.map((opt, i) => {
              let cls = "border-[#e7dede] bg-white text-[#514b4b] hover:bg-[#f9f5f4]";
              if (answered) {
                if (opt.correct) cls = "border-[#7db5a4] bg-[#e6f4ed] text-[#315c55]";
                else if (feedback?.correct === false && answered) cls = "border-[#d99b9b] bg-[#f8eeee] text-[#77565a]";
                else cls = "border-[#e7dede] bg-white text-[#aaa] opacity-60";
              }
              return (
                <button key={i} onClick={() => handleAnswer(opt.correct)} disabled={answered}
                  className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all ${cls}`}>
                  <span className="text-4xl">{opt.emoji}</span>
                  <span className="text-sm font-bold">{opt.label}</span>
                  {answered && opt.correct && <Check size={18} className="text-[#5b9b7e]" />}
                  {answered && !opt.correct && feedback?.correct === false && <X size={18} className="text-[#c47878]" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <FeedbackBanner show={answered} correct={feedback?.correct ?? false} />
            {answered && (
              <div className="flex justify-center mt-3">
                <button onClick={handleNext} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#718D75] text-white font-bold cursor-pointer hover:bg-[#5F7D64]">
                  {qIndex + 1 >= pictureDetectiveQuestions.length ? "Finish 🏆" : "Next →"} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </GameShell>
  );
}

/* ===== Game 2: Emotion Explorer ===== */
function EmotionExplorerGame({ onCorrect, onComplete, onBack }: { onCorrect: () => void; onComplete: () => void; onBack: () => void }) {
  const { recordAnswer } = useApp();
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null);
  const [completed, setCompleted] = useState(false);

  const q = emotionQuestions[qIndex];

  const handleAnswer = (correct: boolean) => {
    if (answered) return;
    setAnswered(true);
    setFeedback({ correct });
    recordAnswer(correct);
    if (correct) onCorrect();
  };

  const handleNext = () => {
    if (qIndex + 1 >= emotionQuestions.length) {
      setCompleted(true);
      onComplete();
    } else {
      setQIndex((i) => i + 1);
      setAnswered(false);
      setFeedback(null);
    }
  };

  return (
    <GameShell title="Emotion Explorer" emoji="😀" onBack={onBack}>
      {completed ? (
        <div className="text-center p-8 rounded-2xl bg-[#e6f4ed] border border-[#7db5a4]">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-[#315c55] mb-2">You know all the feelings!</h3>
          <p className="text-[#5b9b7e] mb-4">You are an emotion expert! ⭐</p>
          <button onClick={onBack} className="px-6 py-3 rounded-full bg-[#718D75] text-white font-bold cursor-pointer hover:bg-[#5F7D64]">
            Back to Games
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-[17px] bg-[#f5efed]">
          <p className="text-[#92787b] text-[11px] font-extrabold tracking-[.14em] mb-2">ROUND {qIndex + 1} of {emotionQuestions.length}</p>

          <div className="text-center mb-6">
            <p className="text-[#5C6F5E] font-bold text-lg mb-3">How does this face feel?</p>
            <div className="text-7xl inline-block gentle-bob">{q.emoji}</div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {q.options.map((opt, i) => {
              let cls = "border-[#e7dede] bg-white text-[#514b4b] hover:bg-[#f9f5f4]";
              if (answered) {
                if (opt.correct) cls = "border-[#7db5a4] bg-[#e6f4ed] text-[#315c55]";
                else cls = "border-[#e7dede] bg-white text-[#aaa] opacity-60";
              }
              return (
                <button key={i} onClick={() => handleAnswer(opt.correct)} disabled={answered}
                  className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all ${cls}`}>
                  <span className="text-4xl">{opt.emoji}</span>
                  <span className="text-sm font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <FeedbackBanner show={answered} correct={feedback?.correct ?? false} />
            {answered && (
              <div className="flex justify-center mt-3">
                <button onClick={handleNext} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#718D75] text-white font-bold cursor-pointer hover:bg-[#5F7D64]">
                  {qIndex + 1 >= emotionQuestions.length ? "Finish 🏆" : "Next →"} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </GameShell>
  );
}

/* ===== Game 3: Build the Sentence ===== */
function BuildSentenceGame({ onCorrect, onComplete, onBack }: { onCorrect: () => void; onComplete: () => void; onBack: () => void }) {
  const { speak, preferences } = useApp();
  const [pIndex, setPIndex] = useState(0);
  const [arranged, setArranged] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null);
  const [completed, setCompleted] = useState(false);

  const puzzle = buildSentencePuzzles[pIndex];

  const handleAdd = (pieceIndex: number) => {
    if (arranged.includes(pieceIndex) || feedback) return;
    setArranged((prev) => [...prev, pieceIndex]);
  };

  const handleRemove = (slotIdx: number) => {
    if (feedback) return;
    setArranged((prev) => prev.filter((_, i) => i !== slotIdx));
  };

  const handleCheck = () => {
    if (arranged.length !== puzzle.correctOrder.length) return;
    const correct = arranged.every((val, i) => val === puzzle.correctOrder[i]);
    setFeedback({ correct });
    if (correct) {
      onCorrect();
      if (!preferences.silentMode && !preferences.muted && preferences.speechEnabled) {
        speak(puzzle.sentence);
      }
    }
  };

  const handleNext = () => {
    if (pIndex + 1 >= buildSentencePuzzles.length) {
      setCompleted(true);
      onComplete();
    } else {
      setPIndex((i) => i + 1);
      setArranged([]);
      setFeedback(null);
    }
  };

  const handleRetry = () => {
    setArranged([]);
    setFeedback(null);
  };

  return (
    <GameShell title="Build the Sentence" emoji="🧩" onBack={onBack}>
      {completed ? (
        <div className="text-center p-8 rounded-2xl bg-[#e6f4ed] border border-[#7db5a4]">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-[#315c55] mb-2">You built all the sentences!</h3>
          <p className="text-[#5b9b7e] mb-4">You are a sentence builder! ⭐</p>
          <button onClick={onBack} className="px-6 py-3 rounded-full bg-[#718D75] text-white font-bold cursor-pointer hover:bg-[#5F7D64]">
            Back to Games
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-[17px] bg-[#f5efed]">
          <p className="text-[#92787b] text-[11px] font-extrabold tracking-[.14em] mb-2">PUZZLE {pIndex + 1} of {buildSentencePuzzles.length}</p>
          <p className="text-[#5C6F5E] font-bold text-lg text-center mb-4">Put the pictures in order to make a sentence</p>

          {/* Sentence building area */}
          <div className="min-h-[90px] p-4 rounded-2xl bg-white border-2 border-dashed border-[#D5C5C9] mb-4">
            <div className="flex items-center gap-2 flex-wrap justify-center min-h-[60px]">
              {arranged.length === 0 ? (
                <span className="text-[#aaa] font-bold">👆 Tap pictures below to build the sentence</span>
              ) : (
                arranged.map((pieceIdx, slotIdx) => (
                  <button key={slotIdx} onClick={() => handleRemove(slotIdx)} disabled={!!feedback}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 border-[#9dc8bd] bg-[#e8f4f0] transition-all hover:border-[#d99b9b] animate-float-up">
                    <span className="text-3xl">{puzzle.pieces[pieceIdx].emoji}</span>
                    <span className="text-xs font-bold text-[#315c55]">{puzzle.pieces[pieceIdx].label}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Available pieces */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
            {puzzle.pieces.map((piece, i) => (
              <button key={i} onClick={() => handleAdd(i)} disabled={arranged.includes(i) || !!feedback}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border-2 transition-all
                  ${arranged.includes(i) ? "border-[#e7dede] bg-[#f0eae9] opacity-40" : "border-[#eadfe0] bg-white hover:-translate-y-1 hover:shadow-md cursor-pointer"}`}>
                <span className="text-4xl">{piece.emoji}</span>
                <span className="text-xs font-bold text-[#514b4b]">{piece.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <FeedbackBanner show={!!feedback} correct={feedback?.correct ?? false} />
            {feedback?.correct && (
              <div className="text-center mt-2">
                <p className="text-xl font-bold text-[#315c55] mb-2">✅ {puzzle.sentence}</p>
                <SpeakerButton text={puzzle.sentence} />
              </div>
            )}
            <div className="flex justify-center gap-2 mt-3 flex-wrap">
              {!feedback && arranged.length === puzzle.correctOrder.length && (
                <button onClick={handleCheck} className="px-5 py-3 rounded-full bg-[#718D75] text-white font-bold cursor-pointer hover:bg-[#5F7D64]">
                  Check Answer ✓
                </button>
              )}
              {feedback?.correct === false && (
                <button onClick={handleRetry} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#EBCB79] text-[#73531E] font-bold cursor-pointer hover:bg-[#DDBB63]">
                  <RefreshCw size={16} /> Try Again
                </button>
              )}
              {feedback?.correct && (
                <button onClick={handleNext} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#718D75] text-white font-bold cursor-pointer hover:bg-[#5F7D64]">
                  {pIndex + 1 >= buildSentencePuzzles.length ? "Finish 🏆" : "Next →"} <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}

/* ===== Game 4: What Happens Next? ===== */
function WhatHappensNextGame({ onCorrect, onComplete, onBack }: { onCorrect: () => void; onComplete: () => void; onBack: () => void }) {
  const { recordAnswer } = useApp();
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null);
  const [completed, setCompleted] = useState(false);

  const q = sequenceQuestions[qIndex];

  const handleAnswer = (correct: boolean) => {
    if (answered) return;
    setAnswered(true);
    setFeedback({ correct });
    recordAnswer(correct);
    if (correct) onCorrect();
  };

  const handleNext = () => {
    if (qIndex + 1 >= sequenceQuestions.length) {
      setCompleted(true);
      onComplete();
    } else {
      setQIndex((i) => i + 1);
      setAnswered(false);
      setFeedback(null);
    }
  };

  return (
    <GameShell title="What Happens Next?" emoji="🔮" onBack={onBack}>
      {completed ? (
        <div className="text-center p-8 rounded-2xl bg-[#e6f4ed] border border-[#7db5a4]">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-[#315c55] mb-2">You finished all the stories!</h3>
          <p className="text-[#5b9b7e] mb-4">Great thinking! ⭐</p>
          <button onClick={onBack} className="px-6 py-3 rounded-full bg-[#718D75] text-white font-bold cursor-pointer hover:bg-[#5F7D64]">
            Back to Games
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-[17px] bg-[#f5efed]">
          <p className="text-[#92787b] text-[11px] font-extrabold tracking-[.14em] mb-2">STORY {qIndex + 1} of {sequenceQuestions.length}</p>

          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 flex-wrap mb-3">
              {q.sequence.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white border border-[#eadfe0]">
                    <span className="text-4xl">{step.emoji}</span>
                    <span className="text-xs font-bold text-[#514b4b] text-center max-w-[100px]">{step.description}</span>
                  </div>
                  {i < q.sequence.length - 1 && <span className="text-2xl text-[#9dc8bd]">→</span>}
                </div>
              ))}
              <span className="text-2xl text-[#EBCB79]">❓</span>
            </div>
            <p className="text-center text-lg font-bold text-[#5C6F5E]">{q.prompt}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {q.options.map((opt, i) => {
              let cls = "border-[#e7dede] bg-white text-[#514b4b] hover:bg-[#f9f5f4]";
              if (answered) {
                if (opt.correct) cls = "border-[#7db5a4] bg-[#e6f4ed] text-[#315c55]";
                else cls = "border-[#e7dede] bg-white text-[#aaa] opacity-60";
              }
              return (
                <button key={i} onClick={() => handleAnswer(opt.correct)} disabled={answered}
                  className={`flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all ${cls}`}>
                  <span className="text-4xl">{opt.emoji}</span>
                  <span className="text-sm font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <FeedbackBanner show={answered} correct={feedback?.correct ?? false} />
            {answered && (
              <div className="flex justify-center mt-3">
                <button onClick={handleNext} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#718D75] text-white font-bold cursor-pointer hover:bg-[#5F7D64]">
                  {qIndex + 1 >= sequenceQuestions.length ? "Finish 🏆" : "Next →"} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </GameShell>
  );
}

/* ===== Game 5: Everyday Situation Challenge ===== */
function EverydayChallengeGame({ onCorrect, onComplete, onBack }: { onCorrect: () => void; onComplete: () => void; onBack: () => void }) {
  const { recordAnswer } = useApp();
  const [qIndex, setQIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean } | null>(null);
  const [completed, setCompleted] = useState(false);

  const q = situationQuestions[qIndex];

  const handleAnswer = (correct: boolean) => {
    if (answered) return;
    setAnswered(true);
    setFeedback({ correct });
    recordAnswer(correct);
    if (correct) onCorrect();
  };

  const handleNext = () => {
    if (qIndex + 1 >= situationQuestions.length) {
      setCompleted(true);
      onComplete();
    } else {
      setQIndex((i) => i + 1);
      setAnswered(false);
      setFeedback(null);
    }
  };

  return (
    <GameShell title="Everyday Challenge" emoji="🏫" onBack={onBack}>
      {completed ? (
        <div className="text-center p-8 rounded-2xl bg-[#e6f4ed] border border-[#7db5a4]">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-[#315c55] mb-2">You are ready for anything!</h3>
          <p className="text-[#5b9b7e] mb-4">Great choices! ⭐</p>
          <button onClick={onBack} className="px-6 py-3 rounded-full bg-[#718D75] text-white font-bold cursor-pointer hover:bg-[#5F7D64]">
            Back to Games
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-[17px] bg-[#f5efed]">
          <p className="text-[#92787b] text-[11px] font-extrabold tracking-[.14em] mb-2">SITUATION {qIndex + 1} of {situationQuestions.length}</p>

          <div className="text-center mb-4">
            <div className="text-5xl mb-2">{q.scenario.emoji}</div>
            <p className="text-[#514b4b] font-bold">{q.scenario.description}</p>
            <p className="text-lg font-bold text-[#5C6F5E] mt-2">{q.prompt}</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, i) => {
              let cls = "border-[#e7dede] bg-white text-[#514b4b] hover:bg-[#f9f5f4]";
              if (answered) {
                if (opt.correct) cls = "border-[#7db5a4] bg-[#e6f4ed] text-[#315c55]";
                else cls = "border-[#e7dede] bg-white text-[#aaa] opacity-60";
              }
              return (
                <button key={i} onClick={() => handleAnswer(opt.correct)} disabled={answered}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${cls}`}>
                  <span className="text-4xl">{opt.emoji}</span>
                  <span className="text-base font-bold">{opt.label}</span>
                  {answered && opt.correct && <Check size={20} className="text-[#5b9b7e] ml-auto" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <FeedbackBanner show={answered} correct={feedback?.correct ?? false} />
            {answered && (
              <div className="flex justify-center mt-3">
                <button onClick={handleNext} className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#718D75] text-white font-bold cursor-pointer hover:bg-[#5F7D64]">
                  {qIndex + 1 >= situationQuestions.length ? "Finish 🏆" : "Next →"} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </GameShell>
  );
}
