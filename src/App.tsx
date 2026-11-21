import { useState, useEffect } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import type { ModuleName } from "@/types";
import NavBar from "@/components/NavBar";
import NoticeToast from "@/components/NoticeToast";
import WelcomeScreen from "@/components/WelcomeScreen";
import EmergencyModal from "@/components/EmergencyModal";
import BreathingExercise from "@/components/BreathingExercise";
import CaregiverGateModal from "@/components/CaregiverGateModal";
import HomePage from "@/pages/HomePage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import CommunicationPage from "@/pages/CommunicationPage";
import EmotionAssistantPage from "@/pages/EmotionAssistantPage";
import LearningPage from "@/pages/LearningPage";
import RoutinePage from "@/pages/RoutinePage";
import SensoryPage from "@/pages/SensoryPage";
import ProgressPage from "@/pages/ProgressPage";
import CaregiverDashboardPage from "@/pages/CaregiverDashboardPage";

function AppContent() {
  const {
    visitorName,
    preferences,
    breathingModalOpen,
    setBreathingModalOpen,
    caregiverGateModalOpen,
    setCaregiverGateModalOpen,
    setIsCaregiverAuthenticated,
  } = useApp();

  const [page, setPage] = useState<ModuleName>("home");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!visitorName) {
      setShowWelcome(true);
    }
  }, [visitorName]);

  useEffect(() => {
    const classList = document.body.classList;
    classList.toggle("quiet-mode", preferences.quietMode);
    classList.toggle("reduced-motion", preferences.reducedMotion);
    classList.toggle("high-contrast", preferences.highContrast);
  }, [preferences.quietMode, preferences.reducedMotion, preferences.highContrast]);

  const handleNavigate = (m: ModuleName) => {
    setPage(m);
    window.scrollTo({
      top: 0,
      behavior: preferences.quietMode ? "auto" : "smooth",
    });
  };

  const handleCaregiverUnlockSuccess = () => {
    setIsCaregiverAuthenticated(true);
    setCaregiverGateModalOpen(false);
    handleNavigate("caregiver");
  };

  // Sensory theme container classes
  const getThemeClass = () => {
    switch (preferences.sensoryTheme) {
      case "sage":
        return "bg-[#EFF5F0] text-[#2C3B2E]";
      case "cream":
        return "bg-[#FAF7F0] text-[#3F3931]";
      case "night":
        return "bg-[#1E232A] text-[#E2E8F0]";
      case "sky":
        return "bg-[#EDF5FA] text-[#243747]";
      case "default":
      default:
        return "bg-[#FCEFF2] text-[#42383B]";
    }
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "activities":
        return <ActivitiesPage onNavigate={handleNavigate} />;
      case "communication":
        return <CommunicationPage />;
      case "emotions":
        return <EmotionAssistantPage onNavigate={handleNavigate} />;
      case "learning":
        return <LearningPage />;
      case "routine":
        return <RoutinePage />;
      case "sensory":
        return <SensoryPage />;
      case "progress":
        return <ProgressPage />;
      case "caregiver":
        return <CaregiverDashboardPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 relative ${getThemeClass()}`}
    >
      {/* Light Sensitivity Dimmer Overlays */}
      {preferences.brightnessOverlay === "soft" && (
        <div
          className="fixed inset-0 bg-black/15 pointer-events-none z-[450] transition-opacity"
          aria-hidden="true"
        />
      )}
      {preferences.brightnessOverlay === "dim" && (
        <div
          className="fixed inset-0 bg-black/35 pointer-events-none z-[450] transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Welcome Screen on first visit */}
      {showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} />}

      {/* Main Navigation Bar */}
      <NavBar current={page} onNavigate={handleNavigate} />

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col">{renderPage()}</main>

      {/* Footer */}
      <footer className="py-5 px-5 bg-[#FFF8F5]/80 backdrop-blur-xs text-[#93858A] text-center text-[13px] border-t border-[#F2E5E8]/60">
        SenseCalm © 2026 · A gentle space to grow, communicate, and smile.
      </footer>

      {/* Persistent & Global Modals */}
      <EmergencyModal />

      {breathingModalOpen && (
        <BreathingExercise onClose={() => setBreathingModalOpen(false)} />
      )}

      {caregiverGateModalOpen && (
        <CaregiverGateModal
          onSuccess={handleCaregiverUnlockSuccess}
          onCancel={() => setCaregiverGateModalOpen(false)}
        />
      )}

      <NoticeToast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
