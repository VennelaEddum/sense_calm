import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { emergencyCards } from "@/data/emergencyData";
import type { EmergencyCard } from "@/types";
import {
  AlertTriangle,
  X,
  Volume2,
  ArrowLeft,
  Eye,
  Info,
} from "lucide-react";

export default function EmergencyModal() {
  const {
    emergencyModalOpen,
    setEmergencyModalOpen,
    preferences,
    speak,
    playSound,
  } = useApp();

  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyCard | null>(null);

  if (!emergencyModalOpen) return null;

  const isTelugu = preferences.ttsLanguage === "te";

  const handleSelectCard = (card: EmergencyCard) => {
    setSelectedEmergency(card);
    playSound("pop");
    const phrase = isTelugu ? `${card.teluguTitle}. ${card.teluguDetail}` : `${card.title}. ${card.detail}`;
    // Speak immediately - emergency announcement can bypass silent mode
    speak(phrase, preferences.ttsLanguage, true);
  };

  const handleClose = () => {
    setSelectedEmergency(null);
    setEmergencyModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-5 bg-[rgba(25,18,20,0.85)] backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Emergency Communication Screen"
    >
      <div className="relative w-full max-w-[780px] bg-white border-4 border-[#E63946] rounded-[32px] p-5 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#FCE8EB] text-[#B31E2B] flex items-center justify-center hover:bg-[#F8D2D7] transition-all hover:scale-105"
          title="Close Emergency Screen"
          aria-label="Close emergency screen"
        >
          <X size={22} />
        </button>

        {/* Selected Card "Show to Adult" Full-Screen View */}
        {selectedEmergency ? (
          <div className="text-center py-4 sm:py-6 animate-float-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F2] border border-[#F2BDC4] text-[#B31E2B] font-extrabold text-xs uppercase tracking-wider mb-4">
              <Eye size={16} /> Show this screen to a teacher or adult nearby
            </div>

            <div
              className={`p-6 sm:p-8 rounded-[28px] border-4 ${selectedEmergency.borderColor} ${selectedEmergency.bgColor} mb-6 shadow-lg`}
            >
              <span className="text-6xl sm:text-7xl mb-3 block animate-bounce">
                {selectedEmergency.emoji}
              </span>
              <h1 className={`text-3xl sm:text-5xl font-black ${selectedEmergency.textColor} tracking-tight`}>
                {selectedEmergency.title}
              </h1>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#523F43] mt-2">
                {selectedEmergency.teluguTitle}
              </h2>
              <p className="text-base sm:text-lg text-[#6B555A] mt-3 font-semibold max-w-md mx-auto">
                {isTelugu ? selectedEmergency.teluguDetail : selectedEmergency.detail}
              </p>
            </div>

            {/* Audio & Return Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() =>
                  speak(
                    isTelugu
                      ? `${selectedEmergency.teluguTitle}. ${selectedEmergency.teluguDetail}`
                      : `${selectedEmergency.title}. ${selectedEmergency.detail}`,
                    preferences.ttsLanguage,
                    true
                  )
                }
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#E63946] text-white font-extrabold text-base shadow-md hover:bg-[#CC2A37] flex items-center justify-center gap-2"
              >
                <Volume2 size={20} />
                <span>Speak Message Again</span>
              </button>

              <button
                onClick={() => setSelectedEmergency(null)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white border-2 border-[#DCD0D3] text-[#55474B] font-extrabold text-base hover:bg-[#F8F3F4] flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} />
                <span>Choose Another Need</span>
              </button>
            </div>

            {/* Transparent Note on Local Notification */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#8C7B80] bg-[#FAF6F7] p-2.5 rounded-xl border border-[#EFE7E9]">
              <Info size={14} className="shrink-0 text-[#C9879C]" />
              <span>
                Note: This message is visually displayed here on this device. Please hand or show this screen directly to a nearby adult.
              </span>
            </div>
          </div>
        ) : (
          /* Cards Grid */
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FFF0F2] border border-[#F5C2C7] rounded-full text-[#B31E2B] font-extrabold text-xs sm:text-sm mb-2 shadow-sm">
                <AlertTriangle size={17} /> Urgent / Emergency Communication
              </div>
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-[#4F3F43]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {isTelugu ? "మీకు ఏమి కావాలి? ఒక చిత్రాన్ని తాకండి" : "Tap an urgent card below"}
              </h2>
              <p className="text-xs sm:text-sm text-[#776B6F] mt-1">
                Your choice will become big on screen and read aloud for an adult.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {emergencyCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className={`p-3.5 sm:p-4 rounded-[22px] border-3 ${card.borderColor} ${card.bgColor} transition-all hover:scale-[1.03] active:scale-95 shadow-sm text-center flex flex-col items-center justify-between min-h-[140px]`}
                >
                  <span className="text-4xl sm:text-5xl my-1">{card.emoji}</span>
                  <div>
                    <strong className={`block text-xs sm:text-sm font-black leading-tight ${card.textColor}`}>
                      {card.title}
                    </strong>
                    <span className="text-[11px] text-[#69565B] font-bold mt-0.5 block leading-tight">
                      {card.teluguTitle}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-full bg-[#F3ECEE] text-[#69565B] font-bold text-xs hover:bg-[#EBDDE1] transition-all"
              >
                I am okay now · Back to Sense Calm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
