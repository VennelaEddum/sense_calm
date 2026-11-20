import { useApp } from "@/context/AppContext";

export default function WeeklyCalendar() {
  const { progress, todayKey } = useApp();
  const activeDays = new Set(progress.streak.activeDays);

  const days: { label: string; dateKey: string; isToday: boolean }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
    days.push({ label: dayLabel, dateKey: key, isToday: key === todayKey });
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {days.map((day) => {
        const isActive = activeDays.has(day.dateKey);
        return (
          <div key={day.dateKey} className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-[#8a7e80]">{day.label}</span>
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all
                ${isActive
                  ? "bg-gradient-to-br from-[#718D75] to-[#5F7D64] text-white shadow-md"
                  : "bg-[#f0eae9] text-[#c4b8b6]"}
                ${day.isToday ? "ring-2 ring-[#EBCB79] ring-offset-2" : ""}`}
            >
              {isActive ? "✓" : "○"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
