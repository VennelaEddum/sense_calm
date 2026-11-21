import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { ModuleName } from "@/types";
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

interface ForgotPasswordPageProps {
  onNavigate: (m: ModuleName) => void;
}

export default function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const { resetPassword, showNotice } = useApp();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(cleanEmail);
    setIsLoading(false);

    if (result.success) {
      setIsSubmitted(true);
      showNotice("Password reset email sent! Check your inbox.");
    } else {
      setErrorMessage(
        result.error || "Could not send reset link. Please check the email entered."
      );
    }
  };

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-10 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-[460px] bg-white rounded-[28px] border-2 border-[#EADFE0] p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFF3E0] border border-[#F5DEBE] text-3xl mb-3 shadow-xs">
            <KeyRound size={26} className="text-[#9C6D1F]" />
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#5C6F5E] tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Reset Password
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#777572]">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-6 rounded-2xl bg-[#EAF5ED] border-2 border-[#C5DEC8] text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-[#718D75] text-white flex items-center justify-center mx-auto text-2xl shadow-xs">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#385D40]">
                Check Your Email
              </h3>
              <p className="text-xs text-[#527859] mt-1.5 leading-relaxed">
                If an account exists for <span className="font-bold">{email}</span>, you will receive a password reset link shortly.
              </p>
            </div>
            <button
              onClick={() => onNavigate("login")}
              className="w-full py-2.5 px-4 rounded-full bg-[#718D75] text-white text-xs font-bold hover:bg-[#5E7962] transition-all cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-[#FDF0ED] border border-[#F2C6BB] text-xs text-[#B85741] font-bold flex items-start gap-2.5 animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#554C4F] mb-1.5">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8F92]"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="caregiver@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E6D9DC] bg-[#FAF7F8] text-sm text-[#4E4447] placeholder:text-[#A89FA3] focus:border-[#718D75] focus:bg-white focus:outline-none transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 rounded-full bg-[#718D75] text-white text-sm font-extrabold shadow-sm hover:bg-[#5E7962] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Sending reset link...</span>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#F2E5E8] text-center">
              <button
                onClick={() => onNavigate("login")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718D75] hover:text-[#527056] transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Sign In</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
