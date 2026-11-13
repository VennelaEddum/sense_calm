import { useApp } from "@/context/AppContext";

export default function NoticeToast() {
  const { notice } = useApp();
  if (!notice) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 bg-[#e8f4f0] text-[#315c55] font-bold rounded-2xl shadow-lg animate-float-up">
      {notice}
    </div>
  );
}
