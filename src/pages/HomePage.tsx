import { useApp } from "@/context/AppContext";
import Bebbo from "@/components/Bebbo";
import type { ModuleName } from "@/types";
import { ArrowRight, Sprout } from "lucide-react";

interface HomePageProps {
  onNavigate: (m: ModuleName) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { visitorName } = useApp();

  const greeting = visitorName
    ? `Hello ${visitorName}! Welcome to SenseCalm! I'm Bebbo! ♡`
    : "Hello, buddy! Welcome to SenseCalm! ♡";

  return (
    <div className="w-full flex-1 px-5 py-8">
      <section className="max-w-[760px] mx-auto flex flex-col items-center text-center">
        <Bebbo greeting={greeting} />

        <p className="mt-3 text-[#A87988] text-xs font-extrabold tracking-[3px]">A LITTLE SPACE JUST FOR YOU</p>

        <h1 className="mt-3 text-[#5C6F5E] font-bold text-[clamp(32px,5vw,47px)] leading-tight" style={{ fontFamily: "Georgia, serif" }}>
          Hello, Little Explorer! <span className="text-[#CF8EA1]">♡</span>
        </h1>

        <p className="mt-3 text-[#777572] text-[17px] leading-[1.7] max-w-md">
          Learn, play and grow at your own pace. Every little step is special!
        </p>

        <div className="w-full max-w-[510px] mt-7 p-5 flex items-center gap-4 bg-[#E5EFF7] border border-[#D2E2EF] rounded-[22px] shadow-sm text-left">
          <Sprout size={34} className="text-[#58758C] shrink-0" />
          <div>
            <h2 className="text-[#58758C] text-lg font-bold mb-1">Take your time, buddy!</h2>
            <p className="text-[#6D8292] text-sm leading-relaxed">There is no hurry. You can learn at your own pace.</p>
          </div>
        </div>

        <button
          onClick={() => onNavigate("activities")}
          className="mt-8 px-8 py-4 inline-flex items-center gap-3 bg-[#718D75] text-white rounded-[35px] text-lg font-extrabold shadow-[0_7px_18px_rgba(90,125,95,0.19)] transition-all hover:bg-[#5F7D64] hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(90,125,95,0.22)]"
        >
          Explore Activities <ArrowRight size={23} />
        </button>

        <p className="mt-8 text-[#A87586] font-script text-[29px] italic">Made with love, just for you ♡</p>
      </section>
    </div>
  );
}
