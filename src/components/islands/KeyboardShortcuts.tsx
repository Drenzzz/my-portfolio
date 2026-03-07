import { useEffect, useState } from "react";

export function KeyboardShortcuts() {
  const [showToast, setShowToast] = useState(false);
  const [pressedKey, setPressedKey] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      
      const navigateList: Record<string, string> = {
        h: "/",
        p: "/project",
        a: "/about",
        d: "/donate",
      };

      if (navigateList[key]) {
        e.preventDefault();
        setPressedKey(key.toUpperCase());
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        window.location.href = navigateList[key];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-3 bg-[#C4A1FF] border-[3px] border-black px-4 py-3 shadow-brutal font-head">
        <div className="bg-white border-2 border-black px-2 py-0.5 font-bold rounded text-sm shadow-brutal-sm">
          {pressedKey}
        </div>
        <span className="font-bold text-sm">Navigating...</span>
      </div>
    </div>
  );
}
