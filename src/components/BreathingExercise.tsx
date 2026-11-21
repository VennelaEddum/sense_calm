import { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { X, Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface BreathingExerciseProps {
  onClose: () => void;
}

type BreathingPhase = "inhale" | "hold" | "exhale";

export default function BreathingExercise({ onClose }: BreathingExerciseProps) {
  const { preferences, playSound, speak } = useApp();
  const [phase, setPhase] = useState<BreathingPhase>("inhale");
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [isActive, setIsActive] = useState(true);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  const isTelugu = preferences.ttsLanguage === "te";
  const isSilent = preferences.silentMode || preferences.muted;

  const timerRef = useRef<number | null>(null);

  // Phase timings: 4-4-4 Box Breathing
  useEffect(() => {
    if (!isActive) return;

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Advance phase
          if (phase === "inhale") {
            setPhase("hold");
            playSound("breathing");
            if (!isSilent && preferences.speechEnabled) {
              speak(isTelugu ? "శ్వాసను పట్టి ఉంచండి" : "Hold gently", preferences.ttsLanguage);
            }
            return 4;
          } else if (phase === "hold") {
            setPhase("exhale");
            playSound("breathing");
            if (!isSilent && preferences.speechEnabled) {
              speak(isTelugu ? "నెమ్మదిగా శ్వాస వదలండి" : "Breathe out slowly", preferences.ttsLanguage);
            }
            return 4;
          } else {
            setPhase("inhale");
            playSound("breathing");
            setCyclesCompleted((c) => c + 1);
            if (!isSilent && preferences.speechEnabled) {
              speak(isTelugu ? "లోతుగా శ్వాస తీసుకోండి" : "Breathe in deeply", preferences.ttsLanguage);
            }
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase, isTelugu, isSilent, preferences.speechEnabled, playSound, speak]);

  // Visual phase descriptors
  const phaseInfo = {
    inhale: {
      title: isTelugu ? "లోతుగా శ్వాస తీసుకోండి 🌸" : "Breathe In Deeply 🌸",
      subtitle: isTelugu ? "మీ ఊపిరితిత్తులను మంచితనంతో నింపండి" : "Fill your chest with calm, gentle air",
      scale: "scale-125",
      ringColor: "border-[#718D75] bg-[#EAF5ED]",
      circleBg: "from-[#B9D5B9] to-[#718D75]",
      instruction: "Inhale",
    },
    hold: {
      title: isTelugu ? "శాంతంగా పట్టి ఉంచండి ☁️" : "Hold Gently ☁️",
      subtitle: isTelugu ? "నిశ్శబ్ద క్షణాన్ని అనుభవించండి" : "Rest in this quiet, peaceful space",
      scale: "scale-125",
      ringColor: "border-[#EBCB79] bg-[#FFF9EA]",
      circleBg: "from-[#E8C87A] to-[#D5A947]",
      instruction: "Hold",
    },
    exhale: {
      title: isTelugu ? "నెమ్మదిగా శ్వాస వదలండి 🍃" : "Breathe Out Slowly 🍃",
      subtitle: isTelugu ? "అన్ని ఆందోళనలను బయటకు పంపండి" : "Release any worry or tightness softly",
      scale: "scale-90",
      ringColor: "border-[#C9879C] bg-[#FDF0F3]",
      circleBg: "from-[#E7B4C2] to-[#C9879C]",
      instruction: "Exhale",
    },
  }[phase];

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-[rgba(35,45,38,0.7)] backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Guided breathing exercise"
    >
      <div className="relative w-full max-w-[480px] p-6 sm:p-8 bg-[#FFFDFB] border-2 border-[#E7D6DA] rounded-[32px] shadow-2xl text-center flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#F5ECEF] text-[#69565B] flex items-center justify-center hover:bg-[#EEDFE3] transition-all hover:scale-105"
          title="Exit Calming Exercise"
          aria-label="Exit breathing exercise"
        >
          <X size={20} />
        </button>

        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#EAF5ED] text-[#3D6946] text-xs font-extrabold uppercase tracking-wider mb-2">
          <span>🌿 Guided Breathing</span>
          {isSilent ? (
            <span className="flex items-center gap-1 text-[#B85741] font-bold">
              <VolumeX size={12} /> Silent
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#4F7354] font-bold">
              <Volume2 size={12} /> Audio Ready
            </span>
          )}
        </div>

        <h2
          className="text-[#514B4B] font-bold text-2xl sm:text-3xl mt-1"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {phaseInfo.title}
        </h2>
        <p className="text-xs sm:text-sm text-[#7A6D71] mt-1 max-w-xs">{phaseInfo.subtitle}</p>

        {/* Breathing Animation Visual Circle */}
        <div className="my-8 relative w-[220px] h-[220px] flex items-center justify-center">
          {/* Outer Ripple Ring */}
          <div
            className={`absolute inset-0 rounded-full border-4 transition-all duration-[3500ms] ease-in-out ${phaseInfo.ringColor} ${
              preferences.reducedMotion ? "" : phaseInfo.scale
            }`}
          />

          {/* Inner Pulsing Circle */}
          <div
            className={`w-[160px] h-[160px] rounded-full bg-gradient-to-tr ${phaseInfo.circleBg} shadow-xl flex flex-col items-center justify-center text-white transition-all duration-[3800ms] ease-in-out ${
              preferences.reducedMotion ? "" : phaseInfo.scale
            }`}
          >
            <span className="text-4xl sm:text-5xl font-extrabold leading-none">{secondsLeft}</span>
            <span className="text-xs font-bold uppercase tracking-widest mt-1 opacity-90">
              {phaseInfo.instruction}
            </span>
          </div>
        </div>

        {/* Cycle count pill */}
        <div className="text-xs font-bold text-[#6D6064] mb-6 flex items-center gap-2">
          <span>Cycles completed:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#EAF5ED] text-[#3E6546] font-extrabold">
            {cyclesCompleted} {cyclesCompleted === 1 ? "time" : "times"}
          </span>
        </div>

        {/* Controls: Pause / Play, Reset, and Exit */}
        <div className="flex items-center justify-center gap-3 w-full max-w-xs">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#718D75] text-white font-extrabold text-sm shadow-md hover:bg-[#5C7760] transition-all"
          >
            {isActive ? (
              <>
                <Pause size={16} /> Pause
              </>
            ) : (
              <>
                <Play size={16} /> Resume
              </>
            )}
          </button>

          <button
            onClick={() => {
              setPhase("inhale");
              setSecondsLeft(4);
              setCyclesCompleted(0);
            }}
            className="p-3 rounded-full bg-[#F5ECEF] text-[#69565B] hover:bg-[#EEDFE3] transition-all"
            title="Reset timer"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={onClose}
            className="py-3 px-5 rounded-full bg-white border-2 border-[#E5D7DA] text-[#6E5C61] font-extrabold text-sm hover:bg-[#FAF4F5] transition-all"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
