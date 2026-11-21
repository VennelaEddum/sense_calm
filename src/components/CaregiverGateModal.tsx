import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Lock, ShieldCheck, X, KeyRound, AlertCircle } from "lucide-react";

interface CaregiverGateModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CaregiverGateModal({
  onSuccess,
  onCancel,
}: CaregiverGateModalProps) {
  const { childProfile, showNotice } = useApp();

  // Generate simple random math question (e.g. 5 + 3)
  const [num1] = useState(() => Math.floor(Math.random() * 6) + 3);
  const [num2] = useState(() => Math.floor(Math.random() * 5) + 2);
  const [mathAnswer, setMathAnswer] = useState("");
  const [pinAnswer, setPinAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasPin = Boolean(childProfile.caregiverPIN && childProfile.caregiverPIN.length >= 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // If PIN is enabled, verify PIN
    if (hasPin) {
      if (pinAnswer !== childProfile.caregiverPIN) {
        setErrorMsg("Incorrect PIN. Please try again.");
        return;
      }
    }

    // Verify Maths barrier
    const expected = num1 + num2;
    if (parseInt(mathAnswer.trim(), 10) !== expected) {
      setErrorMsg(`Incorrect answer for ${num1} + ${num2}. Please try again.`);
      return;
    }

    showNotice("Welcome to Teacher & Caregiver Mode ♡");
    onSuccess();
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[rgba(30,25,27,0.75)] backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Caregiver Access Verification"
    >
      <div className="relative w-full max-w-[420px] bg-white border-2 border-[#EADFE0] rounded-[28px] p-6 sm:p-7 shadow-2xl text-center">
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F5ECEF] text-[#69565B] flex items-center justify-center hover:bg-[#EEDFE3] transition-all"
          title="Cancel"
          aria-label="Cancel caregiver login"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-full bg-[#EAF5ED] text-[#3E6546] flex items-center justify-center mx-auto mb-3 shadow-sm">
          <ShieldCheck size={26} />
        </div>

        <h2
          className="text-2xl font-bold text-[#514B4B]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Teacher & Parent Gate
        </h2>
        <p className="text-xs text-[#7A6D71] mt-1 leading-relaxed">
          Please solve the challenge below to open caregiver settings.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 text-left flex flex-col gap-3">
          {/* Maths Barrier */}
          <div className="p-3.5 bg-[#FFF9EA] border border-[#F4E3B7] rounded-2xl">
            <label htmlFor="mathChallenge" className="block text-xs font-extrabold text-[#755519] mb-1">
              Maths Barrier: What is {num1} + {num2}?
            </label>
            <input
              id="mathChallenge"
              type="number"
              inputMode="numeric"
              value={mathAnswer}
              onChange={(e) => setMathAnswer(e.target.value)}
              placeholder="Enter answer..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DECDB3] bg-white text-[#524447] font-bold text-base outline-none focus:border-[#718D75]"
            />
          </div>

          {/* Optional PIN if configured */}
          {hasPin && (
            <div className="p-3.5 bg-[#FAF5F7] border border-[#ECD9DF] rounded-2xl">
              <label htmlFor="pinChallenge" className="block text-xs font-extrabold text-[#8F596B] mb-1 flex items-center gap-1.5">
                <KeyRound size={13} /> Caregiver 4-Digit PIN:
              </label>
              <input
                id="pinChallenge"
                type="password"
                maxLength={8}
                inputMode="numeric"
                value={pinAnswer}
                onChange={(e) => setPinAnswer(e.target.value)}
                placeholder="Enter PIN..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2C7] bg-white text-[#524447] font-bold text-base outline-none focus:border-[#C9879C]"
              />
            </div>
          )}

          {errorMsg && (
            <p className="text-xs font-bold text-[#B83E3E] flex items-center gap-1">
              <AlertCircle size={14} /> {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-full bg-[#718D75] text-white font-extrabold text-sm shadow-md hover:bg-[#5C7760] transition-all flex items-center justify-center gap-2"
          >
            <Lock size={15} />
            <span>Open Caregiver Dashboard</span>
          </button>
        </form>

        <p className="mt-4 text-[11px] text-[#A29498] leading-tight">
          Note: This challenge serves as a child navigation barrier to prevent accidental adjustments. Child data is stored privately on this device.
        </p>
      </div>
    </div>
  );
}
