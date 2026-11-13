import { useApp } from "@/context/AppContext";
import { routineItems } from "@/data/learningData";
import { CalendarCheck, Save, Check } from "lucide-react";

export default function RoutinePage() {
  const { routines, todayKey, saveRoutines, recordActivity, showNotice } = useApp();
  const todayRoutine = routines[todayKey] || [];

  const handleToggle = (index: number) => {
    const current = todayRoutine.includes(index)
      ? todayRoutine.filter((i) => i !== index)
      : [...todayRoutine, index];
    saveRoutines(todayKey, current);
  };

  const handleSave = () => {
    recordActivity("Daily routine");
    showNotice("Your routine has been saved. Well done! ♡");
  };

  const completedCount = todayRoutine.length;

  return (
    <div className="w-full flex-1 px-5 py-8 max-w-[600px] mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D99B7F] rounded-full text-white font-bold text-sm mb-3">
          <CalendarCheck size={18} /> Daily Routines
        </div>
        <h1 className="text-[#5C6F5E] font-bold text-3xl md:text-4xl" style={{ fontFamily: "Georgia, serif" }}>
          My little daily steps 🌷
        </h1>
        <p className="mt-3 text-[#777572] text-base">
          Tick the steps you have done today. Choose the steps that matter to you.
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-[#5E7863]">
            {completedCount} of {routineItems.length} steps completed today
          </span>
          <span className="text-sm font-extrabold text-[#718D75]">
            {Math.round((completedCount / routineItems.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-3 bg-[#E8E0DC] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#B9D5B9] to-[#718D75] rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / routineItems.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid gap-2.5">
        {routineItems.map((item, index) => {
          const isChecked = todayRoutine.includes(index);
          return (
            <label
              key={index}
              className={`flex items-center gap-3 p-3.5 rounded-[14px] border-2 cursor-pointer transition-all
                ${isChecked ? "border-[#9dc8bd] bg-[#e8f4f0]" : "border-[#eadfe0] bg-white hover:bg-[#f9f5f4]"}
              `}
            >
              <button
                type="button"
                onClick={() => handleToggle(index)}
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                  ${isChecked ? "bg-[#75a99a] border-[#75a99a]" : "border-[#ccc] bg-white"}
                `}
                aria-label={isChecked ? `Uncheck ${item}` : `Check ${item}`}
              >
                {isChecked && <Check size={16} className="text-white" />}
              </button>
              <span className={`flex-1 ${isChecked ? "text-[#315c55] font-bold" : "text-[#514b4b]"}`}>
                {item}
              </span>
              <span className="text-2xl">{isChecked ? "✅" : "⬜"}</span>
            </label>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#718D75] text-white font-bold border-0 cursor-pointer transition-all hover:bg-[#5F7D64] hover:-translate-y-0.5"
      >
        <Save size={18} /> Save today's routine
      </button>

      {completedCount === routineItems.length && (
        <div className="mt-4 p-4 bg-[#e6f4ed] border border-[#7db5a4] rounded-2xl text-center text-[#315c55] font-bold animate-float-up">
          🎉 Amazing! You completed all your steps today! 🎉
        </div>
      )}
    </div>
  );
}
