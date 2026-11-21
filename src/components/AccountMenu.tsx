import { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import type { ModuleName } from "@/types";
import {
  User,
  LogOut,
  Settings,
  Sparkles,
  Cloud,
  Wifi,
  WifiOff,
  ChevronDown,
  Shield,
  Plus,
  AlertTriangle,
  X,
} from "lucide-react";

interface AccountMenuProps {
  onNavigate: (m: ModuleName) => void;
}

export default function AccountMenu({ onNavigate }: AccountMenuProps) {
  const {
    isAuthenticated,
    caregiverProfile,
    childProfiles,
    activeChildProfile,
    selectActiveChild,
    logout,
    syncStatus,
    isOnline,
    isSupabaseActive,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    setIsOpen(false);
    await logout();
    onNavigate("login");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onNavigate("login")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8CCD5] text-xs font-extrabold text-[#754D5B] hover:bg-[#FAF0F3] transition-all cursor-pointer shadow-xs"
        >
          <User size={13} />
          <span>Sign In</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Account trigger pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#EBF3EC] border border-[#CFE4D2] text-xs font-bold text-[#385D40] hover:bg-[#E0EFE2] transition-all cursor-pointer shadow-xs"
        aria-expanded={isOpen}
      >
        <span className="text-sm">{activeChildProfile?.avatarEmoji || "🐰"}</span>
        <span className="max-w-[90px] truncate font-extrabold">
          {activeChildProfile?.name || caregiverProfile?.fullName || "Caregiver"}
        </span>
        <ChevronDown size={13} className="opacity-70" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border-2 border-[#EADFE0] shadow-xl py-2 z-50 animate-scale-up">
          {/* User Info Header */}
          <div className="px-4 py-2.5 border-b border-[#F2E5E8]">
            <div className="text-xs font-extrabold text-[#52494C] truncate">
              {caregiverProfile?.fullName || "Caregiver"}
            </div>
            <div className="text-[11px] text-[#8C7D81] truncate">
              {caregiverProfile?.email}
            </div>

            {/* Sync Status Badge */}
            <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
              <span className="text-[#6D6366]">Cloud Database:</span>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${
                  isSupabaseActive && isOnline
                    ? "bg-[#EAF5ED] text-[#385D40]"
                    : "bg-[#FFF4E5] text-[#9A6214]"
                }`}
              >
                <Cloud size={10} />
                <span>
                  {isSupabaseActive
                    ? isOnline
                      ? "Synced"
                      : "Offline Queue"
                    : "Local Storage"}
                </span>
              </span>
            </div>
          </div>

          {/* Child Profiles list */}
          {childProfiles.length > 0 && (
            <div className="px-3 py-2 border-b border-[#F2E5E8]">
              <div className="text-[10px] font-extrabold text-[#9A8B8F] uppercase tracking-wider mb-1 px-1">
                Child Profiles
              </div>
              <div className="space-y-1">
                {childProfiles.map((cp) => {
                  const isSelected = activeChildProfile?.id === cp.id;
                  return (
                    <button
                      key={cp.id || cp.name}
                      onClick={() => {
                        selectActiveChild(cp);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                        ${
                          isSelected
                            ? "bg-[#EAF3EC] text-[#385D40]"
                            : "text-[#63575A] hover:bg-[#FAF4F5]"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{cp.avatarEmoji || "🐰"}</span>
                        <span>{cp.name}</span>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] bg-[#718D75] text-white px-1.5 py-0.2 rounded-full">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Menu links */}
          <div className="p-1 space-y-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate("child-setup");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#554A4D] hover:bg-[#FDF6F7] transition-all cursor-pointer text-left"
            >
              <Plus size={14} className="text-[#C9879C]" />
              <span>Add / Edit Child Profile</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onNavigate("caregiver");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#554A4D] hover:bg-[#FDF6F7] transition-all cursor-pointer text-left"
            >
              <Shield size={14} className="text-[#718D75]" />
              <span>Teacher & Caregiver Portal</span>
            </button>

            {/* Logout Trigger */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#C53030] hover:bg-[#FDF2F2] transition-all cursor-pointer text-left"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-[rgba(30,25,27,0.7)] backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl border-2 border-[#EADFE0] p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FDF0ED] border border-[#F2C6BB] text-[#B85741] flex items-center justify-center mx-auto text-xl shadow-xs">
              <LogOut size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#52494C]">
                Sign Out of Sense Calm?
              </h3>
              <p className="text-xs text-[#7E7477] mt-1.5 leading-relaxed">
                Your child profiles, AAC cards, and learning progress remain safely preserved in your secure database.
              </p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-full border-2 border-[#E6D9DC] text-xs font-bold text-[#63575A] hover:bg-[#FAF4F5] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 px-4 rounded-full bg-[#C53030] text-white text-xs font-extrabold hover:bg-[#A82525] shadow-sm cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
