"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:bg-muted transition-colors font-mono text-sm"
        disabled
      >
        <div className="w-4 h-4" />
        <span className="hidden sm:inline">THEME</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 bg-card border border-border hover:bg-muted transition-colors font-mono text-sm group"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <>
          <Moon className="w-4 h-4 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="hidden sm:inline">DARK</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-primary group-hover:text-primary/80 transition-colors" />
          <span className="hidden sm:inline">LIGHT</span>
        </>
      )}
    </button>
  );
}
