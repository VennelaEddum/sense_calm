import { useApp, getLocalDateKey } from "@/context/AppContext";
import { routineItems } from "@/data/learningData";
import { achievementBadges } from "@/data/badgesData";
import {
  BarChart3,
  Download,
  Award,
  MessageCircle,
  Sprout,
  CalendarCheck,
  Target,
  Flame,
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";

export default function ProgressPage() {
  const { progress, routines, todayKey } = useApp();
  const today = routines[todayKey] || [];
  const accuracy = progress.totalAnswers
    ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100)
    : 0;

  // Build current week calendar (Monday to Sunday)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((name, idx) => {
    const d = new Date(now);
    d.setDate(now.getDate() + mondayOffset + idx);
    const key = getLocalDateKey(d);
    const isActive = progress.activeDates?.includes(key) || key === todayKey && progress.completedActivities > 0;
    return {
      name,
      dayNum: d.getDate(),
      key,
      isToday: key === todayKey,
      isActive,
    };
  });

  const stats = [
    {
      icon: Flame,
      value: `${progress.currentStreak || 0} ${progress.currentStreak === 1 ? "day" : "days"}`,
      subValue: `Longest: ${progress.longestStreak || 0}d`,
      label: "Current Streak",
      bg: "bg-[#FDF0ED]",
      color: "text-[#B85741]",
      border: "border-[#F2C7BD]",
    },
    {
      icon: Trophy,
      value: progress.totalPoints || 0,
      subValue: "Joyful points",
      label: "Total Points",
      bg: "bg-[#FFF9EC]",
      color: "text-[#9E6F18]",
      border: "border-[#F8E2A7]",
    },
    {
      icon: Target,
      value: `${accuracy}%`,
      subValue: `${progress.correctAnswers}/${progress.totalAnswers} correct`,
      label: "Practice Accuracy",
      bg: "bg-[#EBF3EC]",
      color: "text-[#476D4D]",
      border: "border-[#D0E2D3]",
    },
    {
      icon: Sprout,
      value: progress.totalGamesCompleted || 0,
      subValue: `${progress.completedActivities} all activities`,
      label: "Games Completed",
      bg: "bg-[#EAF0F6]",
      color: "text-[#3D6E8E]",
      border: "border-[#BFD3E6]",
    },
  ];

  const handleExport = () => {
    const report = {
      generatedAt: new Date().toLocaleString(),
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      totalPoints: progress.totalPoints,
      totalGamesCompleted: progress.totalGamesCompleted,
      completedActivities: progress.completedActivities,
      correctAnswers: progress.correctAnswers,
      totalAnswers: progress.totalAnswers,
      accuracyPercent: accuracy,
      communicationUses: progress.communicationUses,
      routineToday: today.map((i) => routineItems[i]),
      unlockedBadges: progress.unlockedBadges,
      activeDates: progress.activeDates,
      recentActivity: progress.activityHistory,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sensecalm-progress-${todayKey}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-8 max-w-[920px] mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFF3E0] rounded-full text-[#73531E] font-bold text-xs sm:text-sm mb-3 shadow-sm">
          <BarChart3 size={16} /> Progress & Streak Dashboard
        </div>
        <h1
          className="text-[#5C6F5E] font-bold text-3xl sm:text-4xl"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Look how far you've come! ⭐
        </h1>
        <p className="mt-2 text-[#777572] text-sm sm:text-base max-w-lg mx-auto">
          Every little effort counts! Your streaks and milestones are safely saved on this device.
        </p>
      </div>

      {/* 1. KEY STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`rounded-[22px] p-4 sm:p-5 text-center border-2 ${stat.bg} ${stat.border} shadow-sm animate-float-up flex flex-col justify-between`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div>
                <Icon size={26} className={`mx-auto mb-2 ${stat.color}`} />
                <span className="text-xs font-bold text-[#6D6366] block mb-1 uppercase tracking-wider">
                  {stat.label}
                </span>
                <strong className={`block text-2xl sm:text-3xl font-extrabold ${stat.color} leading-none mb-1`}>
                  {stat.value}
                </strong>
              </div>
              <span className="text-[11px] text-[#8C7D82] font-semibold block mt-1">
                {stat.subValue}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. WEEKLY ACTIVITY CALENDAR */}
      <section className="p-5 sm:p-6 rounded-[24px] bg-white border-2 border-[#E9DFE2] shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <h2 className="font-extrabold text-[#524549] text-base sm:text-lg">
              Weekly Activity Calendar
            </h2>
          </div>
          <span className="text-xs font-bold text-[#718D75] bg-[#EBF3EC] px-3 py-1 rounded-full border border-[#D0E2D3]">
            Active Days: {progress.activeDates?.length || 0}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
          {weekDays.map((day) => (
            <div
              key={day.key}
              className={`p-2.5 sm:p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-between min-h-[92px]
                ${
                  day.isActive
                    ? "bg-[#EAF5ED] border-[#718D75] shadow-sm"
                    : day.isToday
                    ? "bg-[#FFF8F5] border-[#C9879C] ring-2 ring-[#C9879C]/30"
                    : "bg-[#FAFAFA] border-[#ECE4E6]"
                }
              `}
            >
              <span className="text-xs font-extrabold text-[#756A6D]">{day.name}</span>
              <span className="text-sm sm:text-base font-bold text-[#4F4648]">{day.dayNum}</span>

              {day.isActive ? (
                <span className="text-lg animate-bounce" title="Activity completed!">
                  ⭐
                </span>
              ) : day.isToday ? (
                <span className="text-[10px] text-[#C9879C] font-extrabold uppercase">Today</span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-[#E2D8DA] my-1" />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-[#8F7D82]">
          ✨ Complete any game, routine, or AAC sentence to keep your daily star!
        </p>
      </section>

      {/* 3. MILESTONE BADGES SECTION */}
      <section className="p-5 sm:p-6 rounded-[24px] bg-[#FFF8F6] border-2 border-[#EADFE0] shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Award size={22} className="text-[#C9879C]" />
            <h2 className="font-extrabold text-[#524549] text-base sm:text-lg">
              Achievement Badges & Milestones
            </h2>
          </div>
          <span className="text-xs font-bold text-[#C9879C] bg-[#FCEFF2] px-3 py-1 rounded-full border border-[#EACBD5]">
            Unlocked: {progress.unlockedBadges?.length || 0} / {achievementBadges.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {achievementBadges.map((badge) => {
            const isUnlocked = progress.unlockedBadges?.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center relative
                  ${
                    isUnlocked
                      ? `${badge.bgColor} border-[#C9879C] shadow-sm hover:scale-[1.02]`
                      : "bg-[#F7F4F4] border-[#E8DFE1] opacity-60"
                  }
                `}
              >
                {/* Status indicator badge */}
                <div className="absolute top-2 right-2">
                  {isUnlocked ? (
                    <CheckCircle2 size={16} className="text-[#718D75]" />
                  ) : (
                    <Lock size={14} className="text-[#A89FA2]" />
                  )}
                </div>

                <span className={`text-4xl mb-2 ${isUnlocked ? "" : "grayscale"}`}>{badge.icon}</span>

                <strong className={`text-xs sm:text-sm font-extrabold mb-1 ${isUnlocked ? badge.color : "text-[#756A6D]"}`}>
                  {badge.title}
                </strong>

                <span className="text-[11px] text-[#736569] font-medium leading-tight mb-2">
                  {badge.description}
                </span>

                <span
                  className={`mt-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full border
                    ${
                      isUnlocked
                        ? "bg-white text-[#4F7354] border-[#B9D5B9]"
                        : "bg-white/80 text-[#8C7D82] border-[#DDD3D6]"
                    }
                  `}
                >
                  {isUnlocked ? "Unlocked! 🌟" : badge.requirementText}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. PRACTICE ACCURACY & ROUTINE SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Accuracy Progress */}
        <div className="p-5 rounded-2xl bg-white border border-[#E9DFE2] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#514B4B] flex items-center gap-2 text-sm">
              <Award size={17} className="text-[#EBCB79]" /> Practice Accuracy
            </span>
            <span className="font-extrabold text-[#718D75] text-sm">{accuracy}%</span>
          </div>
          <div className="w-full h-3 bg-[#EFE9EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#EBCB79] to-[#718D75] rounded-full transition-all duration-700"
              style={{ width: `${Math.max(5, accuracy)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#817878]">
            {progress.correctAnswers} correct out of {progress.totalAnswers} questions answered
          </p>
        </div>

        {/* Daily Routine Summary */}
        <div className="p-5 rounded-2xl bg-white border border-[#E9DFE2] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#514B4B] flex items-center gap-2 text-sm">
              <CalendarCheck size={17} className="text-[#D99B7F]" /> Daily Routine Progress
            </span>
            <span className="font-extrabold text-[#D99B7F] text-sm">
              {today.length}/{routineItems.length}
            </span>
          </div>
          <div className="w-full h-3 bg-[#EFE9EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#D99B7F] to-[#718D75] rounded-full transition-all duration-700"
              style={{ width: `${(today.length / routineItems.length) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#817878]">
            {today.length === routineItems.length
              ? "All daily routine steps completed today! 🌷"
              : `${routineItems.length - today.length} steps remaining today`}
          </p>
        </div>
      </div>

      {/* 5. RECENT ACTIVITY HISTORY */}
      <section className="mb-6">
        <h3 className="mb-3 text-base font-extrabold text-[#514B4B] flex items-center gap-2">
          <Sparkles size={16} className="text-[#C9879C]" /> Recent Activity History
        </h3>
        {progress.activityHistory && progress.activityHistory.length > 0 ? (
          <ul className="grid gap-2">
            {progress.activityHistory.slice(0, 8).map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#EADFE0] shadow-sm animate-float-up text-xs sm:text-sm"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="font-extrabold text-[#514B4B]">{item.label}</span>
                <small className="text-[#887E7E]">{item.date}</small>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-6 rounded-2xl bg-white border border-[#EADFE0] text-center text-[#817878] text-sm">
            No activities recorded yet. Try an AAC sentence, a game, or daily routine!
          </div>
        )}
      </section>

      {/* Export Button */}
      <div className="text-center pt-2">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border-2 border-[#D7E4D9] text-[#476D4D] font-extrabold text-sm shadow-sm hover:bg-[#F2F8F3] hover:border-[#718D75] transition-all cursor-pointer"
        >
          <Download size={17} /> Download Progress Summary (.JSON)
        </button>
      </div>
    </div>
  );
}
