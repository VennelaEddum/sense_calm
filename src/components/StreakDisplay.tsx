import { useApp } from "@/context/AppContext";
import { Flame, TrendingUp } from "lucide-react";

export default function StreakDisplay() {
  const { progress } = useApp();
  const { currentStreak, longestStreak } = progress.streak;

  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold transition-all
        ${currentStreak > 0 ? "bg-gradient-to-r from-[#FFF3E0] to-[#FFE0B2] text-[#73531E]" : "bg-[#f0eae9] text-[#b0a5a3]"}`}>
        <Flame
          size={24}
          className={currentStreak > 0 ? "text-[#E8740C] flame-flicker" : "text-[#b0a5a3]"}
        />
        <span className="text-lg">{currentStreak} day{currentStreak !== 1 ? "s" : ""}</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#E5EFF7] text-[#58758C] font-bold">
        <TrendingUp size={20} />
        <span>Best: {longestStreak}</span>
      </div>
    </div>
  );
}
