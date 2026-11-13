import { useEffect, useState } from "react";

interface ConfettiProps {
  active: boolean;
}

const colors = ["#F5DCE3", "#B9D5B9", "#EBCB79", "#D99B7F", "#E5EFF7", "#718D75"];
const emojis = ["⭐", "🌸", "🍃", "♡", "🌟"];

export default function Confetti({ active }: ConfettiProps) {
  const [pieces, setPieces] = useState<
    { id: number; left: number; delay: number; duration: number; color: string; emoji: string; rotate: number }[]
  >([]);

  useEffect(() => {
    if (!active) {
      setPieces([]);
      return;
    }
    const newPieces = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      rotate: Math.random() * 360,
    }));
    setPieces(newPieces);
    const timer = window.setTimeout(() => setPieces([]), 3000);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[200] flex justify-center overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute text-2xl"
          style={{
            left: `${p.left}%`,
            top: "10%",
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        >
          {p.emoji}
        </div>
      ))}
    </div>
  );
}
