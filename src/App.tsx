import { useState, useEffect } from "react";
import { AppProvider, useApp } from "@/context/AppContext";
import type { ModuleName } from "@/types";
import NavBar from "@/components/NavBar";
import NoticeToast from "@/components/NoticeToast";
import WelcomeScreen from "@/components/WelcomeScreen";
import HomePage from "@/pages/HomePage";
import ActivitiesPage from "@/pages/ActivitiesPage";
import CommunicationPage from "@/pages/CommunicationPage";
import LearningPage from "@/pages/LearningPage";
import RoutinePage from "@/pages/RoutinePage";
import SensoryPage from "@/pages/SensoryPage";
import ProgressPage from "@/pages/ProgressPage";

function AppContent() {
  const { visitorName, preferences } = useApp();
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
  }, [preferences.quietMode, preferences.reducedMotion]);

  const handleNavigate = (m: ModuleName) => {
    setPage(m);
    window.scrollTo({ top: 0, behavior: preferences.quietMode ? "auto" : "smooth" });
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "activities":
        return <ActivitiesPage onNavigate={handleNavigate} />;
      case "communication":
        return <CommunicationPage />;
      case "learning":
        return <LearningPage />;
      case "routine":
        return <RoutinePage />;
      case "sensory":
        return <SensoryPage />;
      case "progress":
        return <ProgressPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCEFF2]">
      {showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} />}
      <NavBar current={page} onNavigate={handleNavigate} />
      <main className="flex-1 flex flex-col">{renderPage()}</main>
      <footer className="py-5 px-5 bg-[#FFF8F5] text-[#93858A] text-center text-[13px]">
        SenseCalm © 2026 · A gentle space to grow.
      </footer>
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
