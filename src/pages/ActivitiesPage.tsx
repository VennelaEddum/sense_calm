import { useState } from "react";
import { useApp } from "@/context/AppContext";
import Bebbo from "@/components/Bebbo";
import type { ModuleName } from "@/types";
import { ArrowLeft, Sprout, Gamepad2, CalendarCheck, Heart } from "lucide-react";

interface ActivitiesPageProps {
  onNavigate: (m: ModuleName) => void;
}

interface ActivityCard {
  id: string;
  number: string;
  icon: typeof Sprout;
  title: string;
  description: string;
  link: string;
  bg: string;
  border: string;
  text: string;
  numberColor: string;
  module: ModuleName;
}

const cards: ActivityCard[] = [
  {
    id: "fundamentals",
    number: "01",
    icon: Sprout,
    title: "Everyday Fundamentals",
    description: "Explore colours, shapes, numbers and more!",
    link: "Let's learn →",
    bg: "bg-[#B9D5B9]",
    border: "border-[#A3C5A5]",
    text: "text-[#385D40]",
    numberColor: "text-[#476D4D]",
    module: "learning",
  },
  {
    id: "games",
    number: "02",
    icon: Gamepad2,
    title: "Interactive Games",
    description: "Play, match and discover something new!",
    link: "Let's play →",
    bg: "bg-[#EBCB79]",
    border: "border-[#DDBB63]",
    text: "text-[#73531E]",
    numberColor: "text-[#795C28]",
    module: "communication",
  },
  {
    id: "routines",
    number: "03",
    icon: CalendarCheck,
    title: "Daily Routines + Progress",
    description: "Build little habits and celebrate your wins!",
    link: "Let's begin →",
    bg: "bg-[#D99B7F]",
    border: "border-[#CA896C]",
    text: "text-[#713F2E]",
    numberColor: "text-[#754A38]",
    module: "routine",
  },
];

export default function ActivitiesPage({ onNavigate }: ActivitiesPageProps) {
  const { visitorName, preferences } = useApp();
  const [bouncingCard, setBouncingCard] = useState<string | null>(null);

  const greeting = visitorName
    ? `Hello ${visitorName}! What shall we explore today? ♡`
    : "Hello, buddy! What shall we explore today? ♡";

  const handleCardClick = (card: ActivityCard) => {
    if (!preferences.quietMode && !preferences.reducedMotion) {
      setBouncingCard(card.id);
      window.setTimeout(() => setBouncingCard(null), 600);
    }
    window.setTimeout(() => onNavigate(card.module), preferences.quietMode ? 0 : 200);
  };

  return (
    <div className="w-full flex-1 px-5 py-8 max-w-[1180px] mx-auto text-center">
      <section className="flex flex-col items-center">
        <Bebbo greeting={greeting} />

        <p className="mt-3 text-[#A87988] text-xs font-extrabold tracking-[3px]">YOUR HAPPY LITTLE SPACE</p>

        <h1 className="mt-3 max-w-[850px] text-[#5C6F5E] font-bold text-[clamp(29px,4.5vw,42px)] leading-tight" style={{ fontFamily: "Georgia, serif" }}>
          Pick something you like, buddy! <span className="text-[#D58FA2]">♡</span>
        </h1>

        <p className="mt-3 text-[#777572] text-[17px]">Choose an activity and let's have some fun!</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-[480px] md:max-w-none mx-auto">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.id}
              onClick={() => handleCardClick(card)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick(card);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={card.title}
              className={`relative min-h-[280px] p-7 rounded-[25px] flex flex-col items-center justify-center cursor-pointer border-2 ${card.bg} ${card.border} shadow-[0_10px_30px_rgba(110,90,90,0.09)] transition-all hover:-translate-y-2 hover:shadow-[0_15px_28px_rgba(100,85,85,0.12)] ${bouncingCard === card.id ? "card-bounce" : ""}`}
            >
              <span className={`absolute top-[17px] left-5 text-[13px] font-extrabold tracking-[2px] ${card.numberColor}`}>
                {card.number}
              </span>
              <Icon size={48} className={`mb-4 ${card.text}`} />
              <h2 className={`font-bold text-[21px] leading-snug ${card.text}`} style={{ fontFamily: "Georgia, serif" }}>
                {card.title}
              </h2>
              <p className="mt-3 text-[#555653] text-sm leading-relaxed">{card.description}</p>
              <span className={`mt-5 text-[15px] font-extrabold ${card.text}`}>{card.link}</span>
            </article>
          );
        })}
      </section>

      <div className="mt-9 mx-auto w-fit max-w-full px-7 py-4 bg-[#F8E6EB] border border-[#EFD2DC] rounded-[25px] text-[#895F70] text-[17px] font-bold leading-relaxed flex items-center gap-2">
        <Heart size={23} className="fill-[#CE8CA0] text-[#CE8CA0]" />
        You can take a break whenever you need, buddy!
      </div>

      <button
        onClick={() => onNavigate("home")}
        className="mt-7 inline-flex items-center gap-2 text-[#6C846F] text-[15px] font-extrabold transition-all hover:text-[#A66D80] hover:-translate-x-1"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>
    </div>
  );
}
