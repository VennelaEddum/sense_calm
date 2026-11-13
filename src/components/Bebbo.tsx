import { useState, useRef, useCallback } from "react";
import { useApp } from "@/context/AppContext";

interface BebboProps {
  greeting: string;
  size?: "full" | "mini";
  className?: string;
}

export default function Bebbo({ greeting, size = "full", className = "" }: BebboProps) {
  const { speak, preferences } = useApp();
  const [showBubble, setShowBubble] = useState(false);
  const [dancing, setDancing] = useState(false);
  const danceTimer = useRef<number | null>(null);

  const handleInteract = useCallback(() => {
    setShowBubble((prev) => !prev);
    speak(greeting);

    if (preferences.quietMode || preferences.reducedMotion) return;

    setDancing(false);
    requestAnimationFrame(() => {
      setDancing(true);
      if (danceTimer.current) window.clearTimeout(danceTimer.current);
      danceTimer.current = window.setTimeout(() => setDancing(false), 900);
    });
  }, [greeting, speak, preferences.quietMode, preferences.reducedMotion]);

  if (size === "mini") {
    return (
      <div className={`relative w-[100px] h-[115px] ${className}`} aria-hidden="true">
        <div className="absolute top-0 left-[22px] w-[25px] h-[62px] bg-white rounded-full border border-[#E9E0DD] -rotate-12">
          <div className="absolute top-[7px] left-[6px] w-[12px] h-[45px] bg-[#F2C9D3] rounded-full" />
        </div>
        <div className="absolute top-0 right-[22px] w-[25px] h-[62px] bg-white rounded-full border border-[#E9E0DD] rotate-12">
          <div className="absolute top-[7px] left-[6px] w-[12px] h-[45px] bg-[#F2C9D3] rounded-full" />
        </div>
        <div className="absolute top-[36px] left-[13px] w-[74px] h-[61px] bg-white rounded-full border border-[#E9E0DD] z-10">
          <div className="absolute top-[25px] left-[20px] w-[5px] h-[7px] bg-[#504844] rounded-full" />
          <div className="absolute top-[25px] right-[20px] w-[5px] h-[7px] bg-[#504844] rounded-full" />
          <div className="absolute top-[37px] left-[32px] w-[9px] h-[6px] bg-[#D88FA2] rounded-full" />
        </div>
        <div className="absolute bottom-0 left-[31px] w-[38px] h-[37px] bg-white rounded-full border border-[#E9E0DD]" />
        <div className="absolute bottom-0 left-[22px] w-[27px] h-[14px] bg-white rounded-full border border-[#E9E0DD]" />
        <div className="absolute bottom-0 right-[22px] w-[27px] h-[14px] bg-white rounded-full border border-[#E9E0DD]" />
      </div>
    );
  }

  return (
    <div className={`relative w-[300px] h-[300px] flex justify-center items-center ${className}`}>
      {showBubble && (
        <div className="bubble-appear absolute top-[-8px] left-1/2 -translate-x-1/2 min-w-[245px] max-w-[310px] px-[22px] py-[17px] bg-[#FFFDFC] border-2 border-[#EED9DE] rounded-3xl shadow-lg z-20 text-center text-[15px] font-bold text-[#68535A] leading-relaxed">
          {greeting} <span className="text-[#D58FA2] ml-1">♡</span>
          <div className="absolute -bottom-[13px] left-1/2 -translate-x-1/2 w-[23px] h-[23px] bg-[#FFFDFC] border-r-2 border-b-2 border-[#EED9DE] rotate-45" />
        </div>
      )}

      <div className="hint-float absolute top-[75px] right-[-5px] z-10 flex flex-col items-center text-[#A76D80] font-extrabold -rotate-7">
        <span className="text-base">Click me!</span>
        <span className="text-[34px] leading-none mt-[3px] rotate-[135deg]">↘</span>
      </div>

      <button
        type="button"
        onClick={handleInteract}
        className={`bebbo-button ${dancing ? "dancing" : ""}`}
        aria-label="Click Bebbo to hear a greeting"
        aria-expanded={showBubble}
      >
        <span className="bebbo-ear left" />
        <span className="bebbo-ear right" />
        <span className="bebbo-head">
          <span className="bebbo-eye left" />
          <span className="bebbo-eye right" />
          <span className="bebbo-nose" />
          <span className="bebbo-mouth" />
          <span className="bebbo-cheek left" />
          <span className="bebbo-cheek right" />
        </span>
        <span className="bebbo-body" />
        <span className="bebbo-arm left" />
        <span className="bebbo-arm right" />
        <span className="bebbo-foot left" />
        <span className="bebbo-foot right" />
        <span className="bebbo-tail" />
      </button>

      <div className="bebbo-ground-shadow" />
    </div>
  );
}
