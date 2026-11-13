import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Bebbo from "./Bebbo";
import { Heart } from "lucide-react";

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { setVisitorName, speak, preferences } = useApp();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setVisitorName(trimmed);
    speak(`Hello ${trimmed}! Welcome to SenseCalm!`);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-5 bg-[rgba(252,239,242,0.97)]">
      <div className="w-full max-w-[440px] p-8 bg-[#FFFCFA] border border-[#F0DDE1] rounded-[30px] shadow-[0_18px_50px_rgba(120,90,100,0.12)] text-center animate-float-up">
        <Heart className="mx-auto fill-[#D58FA2] text-[#D58FA2]" size={32} />

        <div className="my-3">
          <Bebbo greeting="" size="mini" />
        </div>

        <p className="text-[#A87988] text-[11px] font-extrabold tracking-[2px]">A LITTLE SPACE JUST FOR YOU</p>
        <h1 className="mt-3 text-[#607563] font-bold text-3xl" style={{ fontFamily: "Georgia, serif" }}>
          Welcome to SenseCalm!
        </h1>
        <p className="mt-3 mb-5 text-[#77716F] text-[15px] leading-relaxed">
          I'm Bebbo! Before we begin, what should I call you?
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 text-left">
          <label htmlFor="visitorName" className="text-[#725C63] text-sm font-extrabold">
            Your name
          </label>
          <input
            id="visitorName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={30}
            autoComplete="given-name"
            required
            className="w-full px-4 py-[15px] border border-[#E7CCD4] rounded-[15px] bg-[#FFF8F8] text-[var(--text)] outline-none text-base focus:border-[#C9879C] focus:shadow-[0_0_0_3px_rgba(201,135,156,0.13)]"
          />
          <button
            type="submit"
            className="mt-2 py-[15px] rounded-[25px] bg-[#718D75] text-white text-base font-extrabold cursor-pointer transition-all hover:bg-[#5F7D64] hover:-translate-y-0.5"
          >
            Let's begin ♡
          </button>
        </form>

        <p className="mt-4 text-[#A29A97] text-xs">
          You only need to do this once on this device.
        </p>
        {preferences.quietMode && (
          <p className="mt-1 text-[#A29A97] text-xs">Quiet Mode is on — animations are gentle.</p>
        )}
      </div>
    </div>
  );
}
