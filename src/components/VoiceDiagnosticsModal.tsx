import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import {
  isNativeAndroid,
  openAndroidTtsSettings,
  getVoiceDiagnostics,
  VoiceDiagnosticsInfo,
} from "@/utils/nativeTTS";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Square,
  Settings,
  Languages,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Play,
  Info,
} from "lucide-react";

interface VoiceDiagnosticsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  isInline?: boolean; // When true, renders inline without modal backdrop
}

export default function VoiceDiagnosticsModal({
  isOpen = true,
  onClose,
  isInline = false,
}: VoiceDiagnosticsModalProps) {
  const {
    preferences,
    updatePreferences,
    speak,
    stopSpeech,
    repeatSpeech,
    ttsStatus,
    showNotice,
  } = useApp();

  const [diagnostics, setDiagnostics] = useState<VoiceDiagnosticsInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<{
    status: "idle" | "success" | "error" | "warning";
    message: string;
    timestamp: string;
  }>({
    status: "idle",
    message: "Ready for testing. Tap a test button below.",
    timestamp: "",
  });

  const refreshDiagnostics = useCallback(async () => {
    setIsLoading(true);
    try {
      const diag = await getVoiceDiagnostics(preferences.ttsLanguage, ttsStatus);
      setDiagnostics(diag);
    } catch (err: any) {
      console.warn("Error getting voice diagnostics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [preferences.ttsLanguage, ttsStatus]);

  useEffect(() => {
    refreshDiagnostics();
  }, [refreshDiagnostics]);

  const handleTestEnglish = () => {
    const text = "Hello! Welcome to Sense Calm.";
    const time = new Date().toLocaleTimeString();

    if (preferences.silentMode || preferences.muted) {
      setTestResult({
        status: "warning",
        message: "Silent Mode is active. Turn off Silent Mode to hear voice output.",
        timestamp: time,
      });
      return;
    }

    try {
      speak(text, "en");
      setTestResult({
        status: "success",
        message: `Speaking English: "${text}"`,
        timestamp: time,
      });
    } catch (err: any) {
      setTestResult({
        status: "error",
        message: `English test failed: ${err?.message || "Unknown error"}`,
        timestamp: time,
      });
    }
  };

  const handleTestTelugu = () => {
    const text = "నమస్కారం! సెన్స్ కామ్కు స్వాగతం.";
    const time = new Date().toLocaleTimeString();

    if (preferences.silentMode || preferences.muted) {
      setTestResult({
        status: "warning",
        message: "Silent Mode is active. Turn off Silent Mode to hear voice output.",
        timestamp: time,
      });
      return;
    }

    if (diagnostics && !diagnostics.isTeluguAvailable) {
      setTestResult({
        status: "warning",
        message:
          "Telugu voice package is not detected on this device. Install Telugu voice data in Android Text-to-Speech settings.",
        timestamp: time,
      });
      showNotice("Telugu voice data is not installed on this device.");
      return;
    }

    try {
      speak(text, "te");
      setTestResult({
        status: "success",
        message: `Speaking Telugu: "${text}"`,
        timestamp: time,
      });
    } catch (err: any) {
      setTestResult({
        status: "error",
        message: `Telugu test failed: ${err?.message || "Unknown error"}`,
        timestamp: time,
      });
    }
  };

  const handleStop = () => {
    const time = new Date().toLocaleTimeString();
    stopSpeech();
    setTestResult({
      status: "idle",
      message: "Voice playback stopped immediately.",
      timestamp: time,
    });
  };

  const handleRepeat = () => {
    const time = new Date().toLocaleTimeString();
    if (preferences.silentMode || preferences.muted) {
      setTestResult({
        status: "warning",
        message: "Silent Mode is active. Turn off Silent Mode to hear voice output.",
        timestamp: time,
      });
      return;
    }

    repeatSpeech();
    setTestResult({
      status: "success",
      message: "Repeating last voice utterance.",
      timestamp: time,
    });
  };

  const handleOpenSettings = async () => {
    const opened = await openAndroidTtsSettings();
    if (opened) {
      showNotice("Opening Android Text-to-Speech settings...");
    } else {
      showNotice("Could not open system settings automatically. Please open Android Settings manually.");
    }
  };

  const handleToggleDefaultLanguage = () => {
    const next = preferences.ttsLanguage === "en" ? "te" : "en";
    updatePreferences({ ttsLanguage: next });
    showNotice(next === "te" ? "Preferred language set to Telugu" : "Preferred language set to English");
    setTimeout(refreshDiagnostics, 200);
  };

  if (!isOpen && !isInline) return null;

  const content = (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EADFE0]">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#4F3F42] flex items-center gap-2">
            <Volume2 className="text-[#718D75]" size={26} />
            Voice & Text-to-Speech Diagnostics
          </h2>
          <p className="text-xs text-[#7A6A6E] mt-0.5">
            Real-time status of speech synthesis engines, language voices, and device audio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshDiagnostics}
            disabled={isLoading}
            className="p-2 rounded-xl bg-[#F4ECF0] hover:bg-[#EADFE4] text-[#634E54] transition-all cursor-pointer"
            title="Refresh Diagnostics"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          {!isInline && onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#F4ECF0] hover:bg-[#EADFE4] text-[#634E54] transition-all cursor-pointer"
              title="Close"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Diagnostics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Platform Card */}
        <div className="p-4 rounded-2xl bg-[#FDFBFB] border-2 border-[#EAE1E3] shadow-xs">
          <span className="text-[11px] font-bold text-[#8C7B80] uppercase tracking-wider block mb-1">
            Execution Platform
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {isNativeAndroid() ? "🤖" : "🌐"}
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#4C3B3F]">
                {isNativeAndroid() ? "Android Native App (Capacitor)" : "Web Browser Environment"}
              </p>
              <span className="text-[11px] text-[#7A6A6E]">
                {isNativeAndroid()
                  ? "Uses native android.speech.tts.TextToSpeech"
                  : "Uses window.speechSynthesis (Web Speech API)"}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Language Card */}
        <div className="p-4 rounded-2xl bg-[#FDFBFB] border-2 border-[#EAE1E3] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#8C7B80] uppercase tracking-wider block mb-1">
              Selected Voice Language
            </span>
            <p className="text-sm font-extrabold text-[#4C3B3F] flex items-center gap-2">
              <Languages size={16} className="text-[#718D75]" />
              {preferences.ttsLanguage === "te" ? "Telugu (తెలుగు 🇮🇳)" : "English (🇬🇧 / 🇺🇸)"}
            </p>
          </div>
          <button
            onClick={handleToggleDefaultLanguage}
            className="px-3 py-1.5 rounded-xl bg-[#EAF5ED] text-[#385D40] text-xs font-bold hover:bg-[#D9EEDB] transition-all cursor-pointer"
          >
            Switch to {preferences.ttsLanguage === "en" ? "Telugu" : "English"}
          </button>
        </div>

        {/* TTS Engine Status */}
        <div className="p-4 rounded-2xl bg-[#FDFBFB] border-2 border-[#EAE1E3] shadow-xs">
          <span className="text-[11px] font-bold text-[#8C7B80] uppercase tracking-wider block mb-1">
            TTS Engine Status
          </span>
          <div className="flex items-center gap-2">
            {diagnostics?.ttsEngineAvailable ? (
              <CheckCircle2 size={18} className="text-[#3E7A4A] shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-[#B34B3B] shrink-0" />
            )}
            <div>
              <p className="text-sm font-extrabold text-[#4C3B3F]">
                {diagnostics?.ttsEngineAvailable ? "Engine Ready & Initialized" : "Engine Unavailable"}
              </p>
              <span className="text-[11px] text-[#7A6A6E]">
                {diagnostics?.engineName || "Detecting..."} ({diagnostics?.voicesCount || 0} voices)
              </span>
            </div>
          </div>
        </div>

        {/* Current Voice Status */}
        <div className="p-4 rounded-2xl bg-[#FDFBFB] border-2 border-[#EAE1E3] shadow-xs">
          <span className="text-[11px] font-bold text-[#8C7B80] uppercase tracking-wider block mb-1">
            Current Voice Status
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                ttsStatus === "playing"
                  ? "bg-[#4CAF50] animate-pulse"
                  : preferences.silentMode || preferences.muted
                  ? "bg-[#E57373]"
                  : "bg-[#9E9E9E]"
              }`}
            />
            <div>
              <p className="text-sm font-extrabold text-[#4C3B3F] capitalize">
                {preferences.silentMode || preferences.muted
                  ? "Silent Mode Active (Muted)"
                  : ttsStatus === "playing"
                  ? "Speaking Aloud..."
                  : ttsStatus}
              </p>
              <span className="text-[11px] text-[#7A6A6E]">
                Rate: {preferences.ttsRate || 0.9}x | Pitch: {preferences.ttsPitch || 1.0}x
              </span>
            </div>
          </div>
        </div>

        {/* English Voice Availability */}
        <div className="p-4 rounded-2xl bg-[#FDFBFB] border-2 border-[#EAE1E3] shadow-xs">
          <span className="text-[11px] font-bold text-[#8C7B80] uppercase tracking-wider block mb-1">
            English Voice Availability
          </span>
          <div className="flex items-center gap-2">
            {diagnostics?.isEnglishAvailable ? (
              <CheckCircle2 size={18} className="text-[#3E7A4A] shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-[#C27D29] shrink-0" />
            )}
            <div>
              <p className="text-sm font-extrabold text-[#4C3B3F]">
                {diagnostics?.isEnglishAvailable ? "English Voice Available" : "English Voice Not Found"}
              </p>
              <span className="text-[11px] text-[#7A6A6E]">
                Standard en-US / en-IN pronunciation ready
              </span>
            </div>
          </div>
        </div>

        {/* Telugu Voice Availability */}
        <div className="p-4 rounded-2xl bg-[#FDFBFB] border-2 border-[#EAE1E3] shadow-xs">
          <span className="text-[11px] font-bold text-[#8C7B80] uppercase tracking-wider block mb-1">
            Telugu Voice Availability
          </span>
          <div className="flex items-center gap-2">
            {diagnostics?.isTeluguAvailable ? (
              <CheckCircle2 size={18} className="text-[#3E7A4A] shrink-0" />
            ) : (
              <AlertTriangle size={18} className="text-[#B34B3B] shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-[#4C3B3F]">
                {diagnostics?.isTeluguAvailable
                  ? "Telugu Voice Installed (తెలుగు 🇮🇳)"
                  : "Telugu Voice Not Installed"}
              </p>
              <span className="text-[11px] text-[#7A6A6E] block truncate">
                {diagnostics?.isTeluguAvailable
                  ? "Ready for native Telugu speech"
                  : "Requires voice data download in Android settings"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Voice Error Banner */}
      {diagnostics?.lastError && (
        <div className="p-3.5 rounded-2xl bg-[#FFF1F0] border border-[#F5C2BE] flex items-start gap-2.5 text-xs text-[#8A2922]">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-[#B33529]" />
          <div>
            <span className="font-bold">Last Recorded Voice Error:</span>
            <p className="mt-0.5 font-mono text-[11px]">{diagnostics.lastError}</p>
          </div>
        </div>
      )}

      {/* Android TTS Settings Action for Missing Telugu */}
      {isNativeAndroid() && (
        <div className="p-4 rounded-2xl bg-[#F4F9F5] border-2 border-[#D1E8D7] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Info size={18} className="text-[#3A7545] shrink-0 mt-0.5" />
            <div className="text-xs text-[#355E3D]">
              <span className="font-bold block">Android Text-to-Speech Engine Settings:</span>
              <p className="text-[11px] text-[#4E7756] mt-0.5">
                If Telugu or other languages are missing, install them via Android Settings &gt; System &gt; Languages &gt; Text-to-speech output &gt; Install voice data.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenSettings}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#718D75] text-white text-xs font-bold hover:bg-[#5C7760] transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Settings size={14} />
            <span>Open Android TTS Settings</span>
          </button>
        </div>
      )}

      {/* Test Buttons Section */}
      <div className="p-5 rounded-[22px] bg-white border-2 border-[#EAE1E3] shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-[#4F3F42] uppercase tracking-wider">
          Interactive Voice Playback Verification
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* 1. Test English Voice */}
          <button
            onClick={handleTestEnglish}
            className="p-3 rounded-2xl bg-[#EDF5EF] hover:bg-[#DCEEE0] border border-[#CADECF] text-[#345E3B] font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Play size={18} className="text-[#345E3B]" />
            <span>Test English Voice</span>
            <span className="text-[10px] font-normal opacity-80 text-center">
              "Hello! Welcome to Sense Calm."
            </span>
          </button>

          {/* 2. Test Telugu Voice */}
          <button
            onClick={handleTestTelugu}
            className="p-3 rounded-2xl bg-[#FDF3EE] hover:bg-[#F9E3D8] border border-[#F0D0C2] text-[#8C4A26] font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Languages size={18} className="text-[#8C4A26]" />
            <span>Test Telugu Voice</span>
            <span className="text-[10px] font-normal opacity-80 text-center">
              "నమస్కారం! సెన్స్ కామ్కు స్వాగతం."
            </span>
          </button>

          {/* 3. Stop Voice */}
          <button
            onClick={handleStop}
            className="p-3 rounded-2xl bg-[#FBEBE7] hover:bg-[#F5D7CF] border border-[#E9BFB5] text-[#9A3824] font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Square size={18} className="text-[#9A3824]" />
            <span>Test Stop Voice</span>
            <span className="text-[10px] font-normal opacity-80 text-center">
              Stop speech immediately
            </span>
          </button>

          {/* 4. Repeat Voice */}
          <button
            onClick={handleRepeat}
            className="p-3 rounded-2xl bg-[#F5ECEF] hover:bg-[#EDDCE1] border border-[#DEC4CC] text-[#714E59] font-extrabold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <RotateCcw size={18} className="text-[#714E59]" />
            <span>Test Repeat Voice</span>
            <span className="text-[10px] font-normal opacity-80 text-center">
              Repeat last spoken text
            </span>
          </button>
        </div>

        {/* Test Result Message Box */}
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-2.5 transition-all text-xs ${
            testResult.status === "success"
              ? "bg-[#F0F8F2] border-[#CDE5D2] text-[#2F6137]"
              : testResult.status === "error"
              ? "bg-[#FFF2F0] border-[#F7C6C1] text-[#912D23]"
              : testResult.status === "warning"
              ? "bg-[#FFF9EC] border-[#F3DFC1] text-[#7C5A20]"
              : "bg-[#F9F7F8] border-[#E8DFE1] text-[#69585C]"
          }`}
        >
          {testResult.status === "success" && <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#387542]" />}
          {testResult.status === "error" && <AlertTriangle size={16} className="shrink-0 mt-0.5 text-[#912D23]" />}
          {testResult.status === "warning" && <AlertTriangle size={16} className="shrink-0 mt-0.5 text-[#A36D19]" />}
          {testResult.status === "idle" && <Info size={16} className="shrink-0 mt-0.5 text-[#7F6F73]" />}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold">Test Status:</span>
              {testResult.timestamp && (
                <span className="text-[10px] opacity-75">{testResult.timestamp}</span>
              )}
            </div>
            <p className="mt-0.5 text-xs font-medium">{testResult.message}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (isInline) {
    return <div className="w-full">{content}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-[28px] p-6 shadow-2xl border-2 border-[#E8DFE1] max-h-[90vh] overflow-y-auto animate-float-up">
        {content}
      </div>
    </div>
  );
}
