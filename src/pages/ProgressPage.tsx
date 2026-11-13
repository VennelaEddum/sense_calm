import { useApp } from "@/context/AppContext";
import { routineItems } from "@/data/learningData";
import { BarChart3, Download, Award, MessageCircle, Sprout, CalendarCheck, Target } from "lucide-react";

export default function ProgressPage() {
  const { progress, routines, todayKey } = useApp();
  const today = routines[todayKey] || [];
  const accuracy = progress.totalAnswers
    ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100)
    : 0;

  const stats = [
    { icon: Sprout, value: progress.completedActivities, label: "Activities completed", bg: "bg-[#B9D5B9]", color: "text-[#385D40]" },
    { icon: MessageCircle, value: progress.communicationUses, label: "Messages selected", bg: "bg-[#F5DCE3]", color: "text-[#754D5B]" },
    { icon: Target, value: `${accuracy}%`, label: "Practice accuracy", bg: "bg-[#EBCB79]", color: "text-[#73531E]" },
    { icon: CalendarCheck, value: `${today.length}/${routineItems.length}`, label: "Today's routine steps", bg: "bg-[#D99B7F]", color: "text-[#713F2E]" },
  ];

  const handleExport = () => {
    const report = {
      generatedAt: new Date().toLocaleString(),
      completedActivities: progress.completedActivities,
      correctAnswers: progress.correctAnswers,
      totalAnswers: progress.totalAnswers,
      communicationUses: progress.communicationUses,
      routineToday: today.map((i) => routineItems[i]),
      recentActivity: progress.activityHistory,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sensecalm-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex-1 px-5 py-8 max-w-[800px] mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFF3E0] rounded-full text-[#73531E] font-bold text-sm mb-3">
          <BarChart3 size={18} /> Progress Dashboard
        </div>
        <h1 className="text-[#5C6F5E] font-bold text-3xl md:text-4xl" style={{ fontFamily: "Georgia, serif" }}>
          Look how far you've come! ⭐
        </h1>
        <p className="mt-3 text-[#777572] text-base">
          This progress is stored locally on this device. Ask a parent or teacher before sharing it.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`rounded-2xl p-5 text-center animate-float-up ${stat.bg}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Icon size={28} className={`mx-auto mb-2 ${stat.color}`} />
              <strong className={`block text-3xl font-extrabold ${stat.color}`}>{stat.value}</strong>
              <span className="text-xs text-[#555653]">{stat.label}</span>
            </div>
          );
        })}
      </div>

      {/* Accuracy bar */}
      {progress.totalAnswers > 0 && (
        <div className="mt-6 p-5 rounded-2xl bg-[#f5efed]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#514b4b] flex items-center gap-2">
              <Award size={18} className="text-[#EBCB79]" /> Practice accuracy
            </span>
            <span className="font-extrabold text-[#718D75]">{accuracy}%</span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#EBCB79] to-[#718D75] rounded-full transition-all duration-700"
              style={{ width: `${accuracy}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[#817878]">
            {progress.correctAnswers} correct out of {progress.totalAnswers} answers
          </p>
        </div>
      )}

      {/* Activity history */}
      <h3 className="mt-8 mb-3 text-lg font-bold text-[#514b4b]">Recent activity</h3>
      {progress.activityHistory.length > 0 ? (
        <ul className="grid gap-2">
          {progress.activityHistory.slice(0, 8).map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#eadfe0] animate-float-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="font-bold text-[#514b4b] text-sm">{item.label}</span>
              <small className="text-[#887e7e] text-xs">{item.date}</small>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-6 rounded-xl bg-[#f5efed] text-center text-[#817878]">
          No activities recorded yet. Try a learning activity!
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-[#817878]">
        This is a basic on-device progress view, not a secure parent/teacher account system.
        Do not use it to store sensitive personal information.
      </p>

      <button
        onClick={handleExport}
        className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#f6e9e7] text-[#77565a] font-bold border-0 cursor-pointer transition-all hover:bg-[#f0dfdc]"
      >
        <Download size={18} /> Download progress summary
      </button>
    </div>
  );
}
