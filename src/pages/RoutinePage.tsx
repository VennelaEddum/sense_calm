import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { routineItems } from "@/data/learningData";
import Confetti from "@/components/Confetti";
import {
  CalendarCheck,
  Save,
  Check,
  Clock,
  Volume2,
  Sparkles,
  ArrowRight,
  ListCheck,
  Sparkle,
} from "lucide-react";

export default function RoutinePage() {
  const {
    routines,
    todayKey,
    saveRoutines,
    showNotice,
    playSound,
    timelineSteps,
    toggleTimelineStep,
    preferences,
    speak,
  } = useApp();

  const [viewMode, setViewMode] = useState<"timeline" | "checklist">("timeline");
  const [celebrate, setCelebrate] = useState(false);

  const isTelugu = preferences.ttsLanguage === "te";
  const todayRoutine = routines[todayKey] || [];

  // Timeline completion calculations
  const completedTimelineCount = useMemo(
    () => timelineSteps.filter((s) => s.isCompleted).length,
    [timelineSteps]
  );
  const totalTimelineCount = timelineSteps.length;
  const timelinePercent = Math.round((completedTimelineCount / totalTimelineCount) * 100);

  // Identify current activity (first incomplete step) and next step
  const firstIncompleteIndex = timelineSteps.findIndex((s) => !s.isCompleted);
  const currentStep = firstIncompleteIndex !== -1 ? timelineSteps[firstIncompleteIndex] : null;
  const nextStep =
    firstIncompleteIndex !== -1 && firstIncompleteIndex + 1 < timelineSteps.length
      ? timelineSteps[firstIncompleteIndex + 1]
      : null;

  const handleToggleTimelineStep = (stepId: string, title: string) => {
    toggleTimelineStep(stepId);
    playSound("pop");

    if (completedTimelineCount + 1 === totalTimelineCount) {
      playSound("celebration");
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 3000);
      speak(
        isTelugu
          ? "అద్భుతం! ఈ రోజు అన్ని రోజువారీ పనులు పూర్తయ్యాయి! 🌸"
          : "Hooray! You completed all your routine steps today! 🌸"
      );
    }
  };

  const handleSpeakStep = (title: string, note?: string) => {
    const speech = note ? `${title}. ${note}` : title;
    speak(speech, preferences.ttsLanguage);
  };

  // Checklist handler (original)
  const handleToggleChecklist = (index: number) => {
    const current = todayRoutine.includes(index)
      ? todayRoutine.filter((i) => i !== index)
      : [...todayRoutine, index];
    saveRoutines(todayKey, current);
    playSound("pop");
  };

  const handleSaveChecklist = () => {
    saveRoutines(todayKey, todayRoutine);
    showNotice("Your routine has been saved. Well done! ♡");
    playSound("chime");
    if (todayRoutine.length === routineItems.length) {
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 2500);
    }
  };

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-8 max-w-[840px] mx-auto">
      <Confetti active={celebrate} />

      {/* Header Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#D99B7F] rounded-full text-white font-bold text-xs sm:text-sm mb-2 shadow-sm">
          <CalendarCheck size={16} /> Visual Daily Routine Assistant
        </div>
        <h1
          className="text-[#5C6F5E] font-bold text-2xl sm:text-3xl md:text-4xl"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {isTelugu ? "నా రోజువారీ అడుగులు 🌷" : "My Little Daily Steps 🌷"}
        </h1>
        <p className="mt-1 text-[#777572] text-xs sm:text-sm max-w-md mx-auto">
          {isTelugu
            ? "ప్రతి చిన్న పని ఒక విజయం. సమయానికి తగినట్లుగా పనులను పూర్తి చేయండి."
            : "Follow your day with visual picture steps. No rush, celebrate each step!"}
        </p>

        {/* View Mode Switcher */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setViewMode("timeline")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5
              ${
                viewMode === "timeline"
                  ? "bg-[#718D75] text-white border-[#5C7760] shadow-sm"
                  : "bg-white text-[#63575B] border-[#E8CCD5] hover:bg-[#FAF0F3]"
              }`}
          >
            <Clock size={13} />
            <span>Visual Daily Timeline</span>
          </button>
          <button
            onClick={() => setViewMode("checklist")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5
              ${
                viewMode === "checklist"
                  ? "bg-[#718D75] text-white border-[#5C7760] shadow-sm"
                  : "bg-white text-[#63575B] border-[#E8CCD5] hover:bg-[#FAF0F3]"
              }`}
          >
            <ListCheck size={13} />
            <span>Simple Checklist</span>
          </button>
        </div>
      </div>

      {/* VISUAL TIMELINE VIEW */}
      {viewMode === "timeline" ? (
        <div className="animate-float-up">
          {/* Progress Bar */}
          <div className="mb-6 p-4 rounded-2xl bg-white border border-[#E9DFE2] shadow-sm">
            <div className="flex justify-between items-center mb-1.5 text-xs sm:text-sm">
              <span className="font-extrabold text-[#5E7863]">
                {completedTimelineCount} of {totalTimelineCount} daily steps finished
              </span>
              <span className="font-extrabold text-[#718D75]">{timelinePercent}%</span>
            </div>
            <div className="w-full h-3 bg-[#E8E0DC] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B9D5B9] to-[#718D75] rounded-full transition-all duration-500"
                style={{ width: `${timelinePercent}%` }}
              />
            </div>
          </div>

          {/* Current Activity Highlight Box & Next Activity Reminder */}
          {currentStep && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {/* Current Activity */}
              <div className="p-4 rounded-2xl bg-[#FFF9EC] border-2 border-[#EBCB79] shadow-sm flex items-center gap-3.5">
                <span className="text-4xl p-2 rounded-xl bg-white border border-[#F0DFA2] shrink-0">
                  {currentStep.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase text-[#73531E]">
                    <span className="w-2 h-2 rounded-full bg-[#EBCB79] animate-ping" />
                    <span>Current Step · {currentStep.timeEstimate}</span>
                  </div>
                  <strong className="text-sm font-extrabold text-[#4F3E42] block truncate">
                    {isTelugu ? currentStep.teluguTitle : currentStep.title}
                  </strong>
                  <button
                    onClick={() =>
                      handleSpeakStep(
                        isTelugu ? currentStep.teluguTitle : currentStep.title,
                        currentStep.reminderNote
                      )
                    }
                    className="mt-1 text-[11px] font-bold text-[#718D75] inline-flex items-center gap-1 hover:underline"
                  >
                    <Volume2 size={12} />
                    <span>Listen Instructions</span>
                  </button>
                </div>
              </div>

              {/* Next Step Preview */}
              {nextStep ? (
                <div className="p-4 rounded-2xl bg-[#F8F4F5] border border-[#EADFE2] flex items-center gap-3.5">
                  <span className="text-3xl p-2 rounded-xl bg-white border border-[#ECE2E5] shrink-0 opacity-80">
                    {nextStep.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold uppercase text-[#88787C] block">
                      Next Up · {nextStep.timeEstimate}
                    </span>
                    <strong className="text-sm font-extrabold text-[#615155] block truncate">
                      {isTelugu ? nextStep.teluguTitle : nextStep.title}
                    </strong>
                    <span className="text-[11px] text-[#8F7E83] mt-0.5 block truncate">
                      {nextStep.reminderNote || "Get ready for the next step"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#EAF5ED] border border-[#B9D5B9] flex items-center justify-center gap-2 text-center text-xs font-extrabold text-[#385D40]">
                  <Sparkle size={16} /> All upcoming steps for today are almost complete!
                </div>
              )}
            </div>
          )}

          {/* Timeline Steps Cards List */}
          <div className="grid gap-3">
            {timelineSteps.map((step, idx) => {
              const isCurrent = currentStep?.id === step.id;
              return (
                <div
                  key={step.id}
                  className={`p-3.5 sm:p-4 rounded-[20px] border-2 transition-all flex items-center justify-between gap-3 shadow-sm
                    ${
                      step.isCompleted
                        ? "bg-[#EAF5ED] border-[#718D75]/70 opacity-90"
                        : isCurrent
                        ? "bg-[#FFFDFB] border-[#EBCB79] ring-3 ring-[#EBCB79]/30"
                        : "bg-white border-[#EADFE0] hover:border-[#C9879C]"
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Checkbox Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleTimelineStep(step.id, step.title)}
                      className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer
                        ${
                          step.isCompleted
                            ? "bg-[#718D75] border-[#718D75] text-white shadow-sm"
                            : "border-[#C9BDC0] bg-white hover:border-[#718D75]"
                        }
                      `}
                      aria-label={step.isCompleted ? `Mark ${step.title} incomplete` : `Mark ${step.title} complete`}
                    >
                      {step.isCompleted && <Check size={16} />}
                    </button>

                    {/* Step Icon */}
                    <span className="text-3xl shrink-0">{step.emoji}</span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold text-[#92787B] uppercase">
                          {step.timeEstimate}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#73531E] text-[10px] font-extrabold">
                            In Progress
                          </span>
                        )}
                      </div>
                      <strong
                        className={`text-sm sm:text-base font-extrabold block truncate ${
                          step.isCompleted ? "line-through text-[#6F8873]" : "text-[#514B4B]"
                        }`}
                      >
                        {isTelugu ? step.teluguTitle : step.title}
                      </strong>
                      {step.reminderNote && (
                        <p className="text-xs text-[#817878] truncate mt-0.5">
                          {step.reminderNote}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Audio Instruction Speaker */}
                  <button
                    onClick={() =>
                      handleSpeakStep(
                        isTelugu ? step.teluguTitle : step.title,
                        step.reminderNote
                      )
                    }
                    className="p-2 rounded-full bg-[#FAF5F7] text-[#716165] hover:bg-[#F2E8EB] shrink-0"
                    title="Read Step Instructions"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {completedTimelineCount === totalTimelineCount && (
            <div className="mt-6 p-4 bg-[#EAF5ED] border-2 border-[#718D75] rounded-2xl text-center text-[#34593C] font-extrabold animate-float-up shadow-md">
              🎉 Amazing job! You completed all your daily routine steps today! 🌷
            </div>
          )}
        </div>
      ) : (
        /* SIMPLE CHECKLIST VIEW (Original functionality preserved) */
        <div className="animate-float-up">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-[#5E7863]">
                {todayRoutine.length} of {routineItems.length} steps completed today
              </span>
              <span className="text-sm font-extrabold text-[#718D75]">
                {Math.round((todayRoutine.length / routineItems.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 bg-[#E8E0DC] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#B9D5B9] to-[#718D75] rounded-full transition-all duration-500"
                style={{ width: `${(todayRoutine.length / routineItems.length) * 100}%` }}
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
                    ${
                      isChecked
                        ? "border-[#9dc8bd] bg-[#e8f4f0]"
                        : "border-[#eadfe0] bg-white hover:bg-[#f9f5f4]"
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleChecklist(index)}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                      ${isChecked ? "bg-[#75a99a] border-[#75a99a]" : "border-[#ccc] bg-white"}
                    `}
                    aria-label={isChecked ? `Uncheck ${item}` : `Check ${item}`}
                  >
                    {isChecked && <Check size={16} className="text-white" />}
                  </button>
                  <span
                    className={`flex-1 ${
                      isChecked ? "text-[#315c55] font-bold line-through" : "text-[#514b4b]"
                    }`}
                  >
                    {item}
                  </span>
                  <span className="text-2xl">{isChecked ? "✅" : "⬜"}</span>
                </label>
              );
            })}
          </div>

          <button
            onClick={handleSaveChecklist}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full bg-[#718D75] text-white font-bold border-0 cursor-pointer transition-all hover:bg-[#5F7D64] hover:-translate-y-0.5 shadow-md"
          >
            <Save size={18} /> Save Today's Checklist
          </button>
        </div>
      )}
    </div>
  );
}
