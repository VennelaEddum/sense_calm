import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { ModuleName } from "@/types";
import {
  Heart,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface RegisterPageProps {
  onNavigate: (m: ModuleName) => void;
}

export default function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { register, isSupabaseActive, showNotice } = useApp();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeConsent, setAgreeConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [requireVerification, setRequireVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation
    const cleanName = fullName.trim();
    if (!cleanName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address (e.g., parent@example.com).");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (!agreeConsent) {
      setErrorMessage("Please check the consent box to agree to the terms and privacy policy.");
      return;
    }

    // 2. Perform registration
    setIsLoading(true);
    const result = await register(cleanName, cleanEmail, password);
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      if (result.requireVerification) {
        setRequireVerification(true);
        showNotice("Registration successful! Please check your email to verify your account.");
      } else {
        showNotice("Account created! Let's set up your child profile. ♡");
        // Automatically guide to Child Profile setup
        setTimeout(() => {
          onNavigate("child-setup");
        }, 800);
      }
    } else {
      setErrorMessage(
        result.error ||
          "Could not create account. If this email is already registered, please sign in instead."
      );
    }
  };

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-10 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-[500px] bg-white rounded-[28px] border-2 border-[#EADFE0] p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EAF5ED] border border-[#C5DEC8] text-3xl mb-3 shadow-xs gentle-bob">
            🌿
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#5C6F5E] tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Create Caregiver Account
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#777572]">
            Connect your child to custom AAC cards, routines, and calming tools.
          </p>
        </div>

        {/* Success Message */}
        {isSuccess ? (
          <div className="p-6 rounded-2xl bg-[#EAF5ED] border-2 border-[#C5DEC8] text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-[#718D75] text-white flex items-center justify-center mx-auto text-2xl shadow-xs">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#385D40]">
                {requireVerification
                  ? "Verification Link Sent!"
                  : "Welcome to Sense Calm! ♡"}
              </h3>
              <p className="text-xs text-[#527859] mt-1.5 leading-relaxed">
                {requireVerification
                  ? `We sent a confirmation link to ${email}. Please verify your email, then sign in.`
                  : "Your caregiver account is ready. Let's set up your child's communication profile!"}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              {requireVerification ? (
                <button
                  onClick={() => onNavigate("login")}
                  className="w-full py-2.5 px-4 rounded-full bg-[#718D75] text-white text-xs font-bold hover:bg-[#5E7962] transition-all cursor-pointer"
                >
                  Go to Sign In
                </button>
              ) : (
                <button
                  onClick={() => onNavigate("child-setup")}
                  className="w-full py-2.5 px-4 rounded-full bg-[#718D75] text-white text-xs font-bold hover:bg-[#5E7962] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Continue to Child Profile Setup</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Error message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-[#FDF0ED] border border-[#F2C6BB] text-xs text-[#B85741] font-bold flex items-start gap-2.5 animate-shake">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#554C4F] mb-1">
                  Caregiver or Teacher Full Name
                </label>
                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8F92]"
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vennela / Teacher Sarah"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E6D9DC] bg-[#FAF7F8] text-sm text-[#4E4447] placeholder:text-[#A89FA3] focus:border-[#718D75] focus:bg-white focus:outline-none transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#554C4F] mb-1">
                  Email Address
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
                    placeholder="parent@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E6D9DC] bg-[#FAF7F8] text-sm text-[#4E4447] placeholder:text-[#A89FA3] focus:border-[#718D75] focus:bg-white focus:outline-none transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#554C4F] mb-1">
                  Create Password (minimum 6 characters)
                </label>
                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8F92]"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-[#E6D9DC] bg-[#FAF7F8] text-sm text-[#4E4447] placeholder:text-[#A89FA3] focus:border-[#718D75] focus:bg-white focus:outline-none transition-all"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A8F92] hover:text-[#655A5D] cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-[#554C4F] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A8F92]"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E6D9DC] bg-[#FAF7F8] text-sm text-[#4E4447] placeholder:text-[#A89FA3] focus:border-[#718D75] focus:bg-white focus:outline-none transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Terms and Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#63595C] leading-relaxed">
                  <input
                    type="checkbox"
                    checked={agreeConsent}
                    onChange={(e) => setAgreeConsent(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded accent-[#718D75] shrink-0 cursor-pointer"
                  />
                  <span>
                    I agree to the Terms of Service and Privacy Policy. I understand that all child communication and sensory profiles remain strictly private, encrypted, and isolated under this caregiver account.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-5 mt-2 rounded-full bg-[#718D75] text-white text-sm font-extrabold shadow-sm hover:bg-[#5E7962] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account & Setup Profile</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Back to sign in */}
            <div className="mt-5 pt-4 border-t border-[#F2E5E8] text-center">
              <p className="text-xs text-[#7E7477]">
                Already have an account?{" "}
                <button
                  onClick={() => onNavigate("login")}
                  className="font-extrabold text-[#718D75] hover:text-[#58735C] transition-colors cursor-pointer"
                >
                  Sign In here
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
