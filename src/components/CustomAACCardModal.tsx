import { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import type { AACCardItem } from "@/types";
import {
  X,
  Upload,
  Image as ImageIcon,
  Heart,
  Smile,
  AlertCircle,
  Plus,
} from "lucide-react";

interface CustomAACCardModalProps {
  onClose: () => void;
  initialCard?: AACCardItem;
}

const CATEGORIES = [
  { key: "people", label: "People & Friends", emoji: "👫" },
  { key: "family", label: "Family", emoji: "👨‍👩‍👧" },
  { key: "needs", label: "Needs", emoji: "🆘" },
  { key: "feelings", label: "Feelings", emoji: "💖" },
  { key: "food", label: "Food & Drinks", emoji: "🍎" },
  { key: "actions", label: "Actions", emoji: "🏃" },
  { key: "school", label: "School", emoji: "🎒" },
  { key: "places", label: "Places", emoji: "🏠" },
  { key: "emergency", label: "Emergency", emoji: "🚨" },
] as const;

export default function CustomAACCardModal({
  onClose,
  initialCard,
}: CustomAACCardModalProps) {
  const { addCustomAACCard, updateCustomAACCard, showNotice } = useApp();

  const [text, setText] = useState(initialCard?.text || "");
  const [teluguText, setTeluguText] = useState(initialCard?.teluguText || "");
  const [category, setCategory] = useState<AACCardItem["category"]>(
    initialCard?.category || "family"
  );
  const [emoji, setEmoji] = useState(initialCard?.emoji || "⭐");
  const [familiarRole, setFamiliarRole] = useState(initialCard?.familiarRole || "");
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialCard?.imageUrl || null
  );
  const [imageBlob, setImageBlob] = useState<Blob | string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Image size should be less than 2MB for smooth performance.");
      return;
    }

    setErrorMsg(null);
    setImageBlob(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setErrorMsg("Please provide an English card name.");
      return;
    }

    const cardId = initialCard?.id || `custom-${Date.now()}`;
    const newCard: AACCardItem = {
      id: cardId,
      text: text.trim(),
      teluguText: teluguText.trim() || text.trim(),
      emoji: emoji.trim() || "⭐",
      category,
      color: "text-[#5B484D]",
      bgColor: "bg-[#FFF8F6]",
      borderColor: "border-[#E8CAD2]",
      isCustom: true,
      imageUrl: imagePreview || undefined,
      familiarRole: familiarRole.trim() || undefined,
    };

    try {
      if (initialCard) {
        await updateCustomAACCard(newCard, imageBlob || undefined);
      } else {
        await addCustomAACCard(newCard, imageBlob || undefined);
      }
      onClose();
    } catch (err) {
      setErrorMsg("Failed to save card: " + String(err));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[rgba(30,25,27,0.7)] backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Create Custom AAC Picture Card"
    >
      <div className="relative w-full max-w-[540px] bg-white border-2 border-[#EADFE0] rounded-[30px] p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F5ECEF] text-[#69565B] flex items-center justify-center hover:bg-[#EEDFE3] transition-all"
          title="Cancel"
        >
          <X size={18} />
        </button>

        <div className="text-center mb-5">
          <div className="w-11 h-11 rounded-full bg-[#FCEFF2] text-[#AD5972] flex items-center justify-center mx-auto mb-2">
            <Plus size={22} />
          </div>
          <h2
            className="text-2xl font-bold text-[#514B4B]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {initialCard ? "Edit Picture Card" : "Add Custom Picture Card"}
          </h2>
          <p className="text-xs text-[#7A6D71] mt-1">
            Create cards for familiar people, personal foods, toys, or school needs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          {/* 1. Image Upload / Photo of Familiar Person */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wide text-[#77666A] mb-1.5">
              Card Image / Photo (Optional)
            </label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#C9879C] bg-[#FFF8FA] flex flex-col items-center justify-center cursor-pointer hover:bg-[#FDF0F3] transition-all relative overflow-hidden shrink-0 group"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Upload size={22} className="text-[#C9879C] mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-[#A67886] font-bold">Upload Photo</span>
                  </>
                )}
              </div>

              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-[#F5ECEF] text-[#755963] font-bold text-xs hover:bg-[#EDDFE4] transition-all"
                >
                  Choose File from Device
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageBlob(null);
                    }}
                    className="ml-2 text-xs text-[#B83E3E] font-bold hover:underline"
                  >
                    Remove Photo
                  </button>
                )}
                <p className="text-[11px] text-[#8C7D82] mt-1 leading-snug">
                  Safe local storage in browser IndexedDB. Max 2MB (Mom, Dad, Teacher photos).
                </p>
              </div>
            </div>
          </div>

          {/* 2. English & Telugu Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="cardNameEn" className="block text-xs font-extrabold text-[#524447] mb-1">
                English Name *
              </label>
              <input
                id="cardNameEn"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. My Mother, Teddy, Pizza"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2C7] bg-[#FFFDFD] text-[#524447] text-sm font-semibold outline-none focus:border-[#718D75]"
              />
            </div>
            <div>
              <label htmlFor="cardNameTe" className="block text-xs font-extrabold text-[#524447] mb-1">
                Telugu Translation (తెలుగు)
              </label>
              <input
                id="cardNameTe"
                type="text"
                value={teluguText}
                onChange={(e) => setTeluguText(e.target.value)}
                placeholder="ఉదా: మా అమ్మ, బొమ్మ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2C7] bg-[#FFFDFD] text-[#524447] text-sm font-semibold outline-none focus:border-[#C9879C]"
              />
            </div>
          </div>

          {/* 3. Familiar Role & Emoji fallback */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="familiarRole" className="block text-xs font-extrabold text-[#524447] mb-1">
                Familiar Person Role (Optional)
              </label>
              <input
                id="familiarRole"
                type="text"
                value={familiarRole}
                onChange={(e) => setFamiliarRole(e.target.value)}
                placeholder="e.g. Mother, Father, Teacher"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2C7] bg-[#FFFDFD] text-[#524447] text-sm font-semibold outline-none"
              />
            </div>
            <div>
              <label htmlFor="cardEmoji" className="block text-xs font-extrabold text-[#524447] mb-1">
                Icon Emoji (Fallback)
              </label>
              <input
                id="cardEmoji"
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="e.g. 👩, 🧸, 🍕"
                maxLength={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5C2C7] bg-[#FFFDFD] text-[#524447] text-sm font-semibold outline-none text-center text-lg"
              />
            </div>
          </div>

          {/* 4. Category Selector */}
          <div>
            <label className="block text-xs font-extrabold text-[#524447] mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`py-2 px-2.5 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1.5 transition-all
                    ${
                      category === cat.key
                        ? "border-[#718D75] bg-[#EAF5ED] text-[#34593C] shadow-sm"
                        : "border-[#ECE2E4] bg-white text-[#63575B] hover:bg-[#FAF5F7]"
                    }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-[#B83E3E] flex items-center gap-1 bg-[#FDF2F2] p-2 rounded-lg border border-[#F5C2C2]">
              <AlertCircle size={14} className="shrink-0" /> {errorMsg}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-2 flex items-center justify-end gap-3 pt-3 border-t border-[#F0E5E7]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-white border border-[#DDD3D6] text-[#716165] font-bold text-xs hover:bg-[#F2EBED]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#718D75] text-white font-extrabold text-xs shadow-md hover:bg-[#5C7760] transition-all"
            >
              Save Card ♡
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
