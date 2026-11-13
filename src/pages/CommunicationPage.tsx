import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { communicationMessages } from "@/data/learningData";
import { Volume2, MessageCircle } from "lucide-react";

export default function CommunicationPage() {
  const { speak, recordCommunication, preferences, showNotice } = useApp();
  const [selected, setSelected] = useState<string>("");

  const handleSelect = (phrase: string) => {
    setSelected(phrase);
    recordCommunication();
    if (preferences.speechEnabled && !preferences.muted) {
      speak(phrase);
    } else {
      showNotice("Turn on spoken messages in Comfort settings to hear this.");
    }
  };

  return (
    <div className="w-full flex-1 px-5 py-8 max-w-[900px] mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5DCE3] rounded-full text-[#8F596B] font-bold text-sm mb-3">
          <MessageCircle size={18} /> Communication Board
        </div>
        <h1 className="text-[#5C6F5E] font-bold text-3xl md:text-4xl" style={{ fontFamily: "Georgia, serif" }}>
          What would you like to say? ♡
        </h1>
        <p className="mt-3 text-[#777572] text-base">
          Choose a picture or message. Your choice will appear below.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {communicationMessages.map(([emoji, phrase], index) => (
          <button
            key={index}
            onClick={() => handleSelect(phrase)}
            className={`flex flex-col items-center justify-center gap-2 min-h-[110px] p-3 rounded-2xl border-2 bg-white transition-all hover:-translate-y-1 hover:shadow-md
              ${selected === phrase ? "border-[#9dc8bd] bg-[#e8f4f0] scale-[1.03]" : "border-[#eadfe0] hover:border-[#D5C5C9]"}
            `}
          >
            <span className="text-3xl">{emoji}</span>
            <strong className="text-[13px] text-center text-[#514b4b]">{phrase}</strong>
          </button>
        ))}
      </div>

      <div className="mt-6 p-5 rounded-[17px] bg-[#f5efed]">
        <span className="text-[#92787b] text-[10px] font-extrabold tracking-[.12em]">MY MESSAGE</span>
        <p className={`min-h-[25px] text-lg font-bold mt-1 ${selected ? "text-[#514b4b]" : "text-[#aaa]"}`}>
          {selected || "Choose a message above."}
        </p>
        <button
          onClick={() => {
            if (!selected) return;
            if (preferences.speechEnabled && !preferences.muted) {
              speak(selected);
            } else {
              showNotice("Turn on spoken messages in Comfort settings to hear this.");
            }
          }}
          disabled={!selected}
          className="mt-3 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#dcefe8] text-[#315c55] font-bold border-0 cursor-pointer transition-all hover:bg-[#c8e6dd] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Volume2 size={18} /> Speak message
        </button>
      </div>
    </div>
  );
}
