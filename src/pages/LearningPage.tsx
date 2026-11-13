import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { learningTopics } from "@/data/learningData";
import Confetti from "@/components/Confetti";
import type { LearningQuestion } from "@/types";
import { Sprout, Check, X, ArrowRight } from "lucide-react";

export default function LearningPage() {
  const { recordActivity, recordAnswer, preferences } = useApp();
  const [topic, setTopic] = useState<string>("colours");
  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; selectedIndex: number } | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  const questions = learningTopics[topic];
  const question: LearningQuestion = questions[round % questions.length];

  const handleAnswer = (index: number) => {
    if (answered) return;
    const correct = index === question.answer;
    setAnswered(true);
    setFeedback({ correct, selectedIndex: index });
    recordAnswer(correct);
    if (correct) {
      recordActivity(`Learning: ${topic}`);
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 3000);
    }
  };

  const handleNext = () => {
    setRound((r) => (r + 1) % questions.length);
    setAnswered(false);
    setFeedback(null);
  };

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    setRound(0);
    setAnswered(false);
    setFeedback(null);
  };

  const topics: { key: string; label: string; emoji: string }[] = [
    { key: "colours", label: "Colours", emoji: "🎨" },
    { key: "numbers", label: "Numbers", emoji: "🔢" },
    { key: "shapes", label: "Shapes", emoji: "🔷" },
  ];

  return (
    <div className="w-full flex-1 px-5 py-8 max-w-[700px] mx-auto">
      <Confetti active={celebrate} />

      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#B9D5B9] rounded-full text-[#385D40] font-bold text-sm mb-3">
          <Sprout size={18} /> Learning Activities
        </div>
        <h1 className="text-[#5C6F5E] font-bold text-3xl md:text-4xl" style={{ fontFamily: "Georgia, serif" }}>
          Let's learn together! 🌱
        </h1>
        <p className="mt-3 text-[#777572] text-base">
          Choose a topic. There is no rush. Try one question at a time.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {topics.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTopicChange(t.key)}
            className={`px-4 py-2.5 rounded-full border font-bold transition-all
              ${topic === t.key
                ? "border-[#9dc8bd] bg-[#e8f4f0] text-[#315c55]"
                : "border-[#eadbdc] bg-white text-[#5b5555] hover:bg-[#f9f5f4]"
              }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 rounded-[17px] bg-[#f5efed]">
        <p className="text-[#92787b] text-[11px] font-extrabold tracking-[.14em] mb-2">
          QUESTION {round + 1}
        </p>
        <h3 className="text-[21px] font-bold text-[#514b4b] mb-4">{question.prompt}</h3>

        <div className="grid gap-2.5">
          {question.choices.map((choice, index) => {
            const isCorrect = index === question.answer;
            const isSelected = feedback?.selectedIndex === index;
            let className = "border-[#e7dede] bg-white text-[#514b4b] hover:bg-[#f9f5f4]";
            if (answered) {
              if (isCorrect) className = "border-[#7db5a4] bg-[#e6f4ed] text-[#315c55]";
              else if (isSelected) className = "border-[#d99b9b] bg-[#f8eeee] text-[#77565a]";
              else className = "border-[#e7dede] bg-white text-[#aaa] opacity-60";
            }
            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                className={`flex items-center justify-between px-4 py-3 rounded-[13px] border-2 text-left font-bold transition-all ${className}`}
              >
                <span className="text-lg">{choice}</span>
                {answered && isCorrect && <Check size={20} className="text-[#5b9b7e]" />}
                {answered && isSelected && !isCorrect && <X size={20} className="text-[#c47878]" />}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="font-bold text-[#514b4b] min-h-[24px]" aria-live="polite">
            {feedback?.correct === true && "Wonderful! You got it! ⭐"}
            {feedback?.correct === false && "Good try! Let's learn together. ♡"}
          </p>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#dcefe8] text-[#315c55] font-bold border-0 cursor-pointer transition-all hover:bg-[#c8e6dd] whitespace-nowrap"
          >
            Next question <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {preferences.quietMode && (
        <p className="mt-6 text-center text-[#A29A97] text-sm">
          Quiet Mode is on — gentle pace, no flashy animations.
        </p>
      )}
    </div>
  );
}
