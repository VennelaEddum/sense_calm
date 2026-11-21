import { useState } from "react";
import { useApp } from "@/context/AppContext";
import type { ModuleName } from "@/types";
import {
  Heart,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface LoginPageProps {
  onNavigate: (m: ModuleName) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, isSupabaseActive, showNotice } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    const result = await login(cleanEmail, password, rememberMe);
    setIsLoading(false);

    if (result.success) {
      showNotice("Welcome back to Sense Calm ♡");
      onNavigate("caregiver");
    } else {
      setErrorMessage(
        result.error ||
          "Could not sign in. Please verify your email and password."
      );
    }
  };

  return (
    <div className="w-full flex-1 px-4 sm:px-6 py-10 flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-[460px] bg-white rounded-[28px] border-2 border-[#EADFE0] p-6 sm:p-8 shadow-sm">
        {/* Brand & Mascot Greeting */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FCEFF2] border border-[#E8CCD5] text-3xl mb-3 shadow-xs gentle-bob">
            🐰
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-[#5C6F5E] tracking-tight"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Caregiver Sign In
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#777572]">
            Access your child's profile, AAC customizer, and learning insights.
          </p>
        </div>

        {/* Configuration Notice if Supabase is offline/local */}
        {!isSupabaseActive && (
          <div className="mb-5 p-3 rounded-2xl bg-[#FFF8EB] border border-[#F3DFB6] text-xs text-[#8A6318] flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong>Local Mode Active:</strong> You can test sign-in with your email.
              To connect to a live Supabase project, configure{" "}
              <code>.env</code> with your Supabase URL & Key.
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-[#FDF0ED] border border-[#F2C6BB] text-xs text-[#B85741] font-bold flex items-start gap-2.5 animate-shake">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-[#554C4F] mb-1.5">
              Caregiver or Teacher Email
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

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#554C4F]">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate("forgot-password")}
                className="text-xs font-bold text-[#718D75] hover:text-[#527056] transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
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
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-[#E6D9DC] bg-[#FAF7F8] text-sm text-[#4E4447] placeholder:text-[#A89FA3] focus:border-[#718D75] focus:bg-white focus:outline-none transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A8F92] hover:text-[#655A5D] cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember session checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#6D6366]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded accent-[#718D75] cursor-pointer"
              />
              <span>Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-5 rounded-full bg-[#718D75] text-white text-sm font-extrabold shadow-sm hover:bg-[#5E7962] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Sign up prompt */}
        <div className="mt-6 pt-5 border-t border-[#F2E5E8] text-center">
          <p className="text-xs text-[#7E7477]">
            New to Sense Calm?{" "}
            <button
              onClick={() => onNavigate("register")}
              className="font-extrabold text-[#C9879C] hover:text-[#AC6A7F] transition-colors cursor-pointer"
            >
              Create a free Caregiver Account
            </button>
          </p>
        </div>

        {/* Child Privacy Guarantee */}
        <div className="mt-5 p-3 rounded-2xl bg-[#F6F9F6] border border-[#DEECDF] flex items-center gap-2.5 text-[11px] text-[#4F7354]">
          <ShieldCheck size={16} className="shrink-0 text-[#718D75]" />
          <span>
            Children do not need email accounts. All child data is privately isolated under your caregiver profile.
          </span>
        </div>
      </div>
    </div>
  );
}
