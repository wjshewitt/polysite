import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  systemTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const THEME_STORAGE_KEY = "theme-storage";
const DARK_HEX = "#0B0B0B";
const LIGHT_HEX = "#FFFFFF";
let mediaQueryListenerAttached = false;

// Function to get system preference
const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "dark"; // Default for SSR
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "dark", // Default to dark, will be updated on hydration
      systemTheme: "dark",
      setTheme: (theme) => {
        set({ theme });
        // Update DOM immediately
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          root.classList.add(theme);
          root.style.setProperty("color-scheme", theme);
          
          // Update meta theme-color
          const metaThemeColor = document.querySelector('meta[name="theme-color"]');
          if (metaThemeColor) {
            metaThemeColor.setAttribute(
              "content",
              theme === "dark" ? DARK_HEX : LIGHT_HEX
            );
          }
        }
      },
      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        get().setTheme(newTheme);
      },
      initializeTheme: () => {
        if (typeof window === "undefined") return;

        const systemTheme = getSystemTheme();
        set({ systemTheme });
        
        // Get stored theme
        let themeToApply: Theme = systemTheme;

        try {
          const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            const persisted = parsed.state?.theme as Theme | undefined;
            if (persisted === "light" || persisted === "dark") {
              themeToApply = persisted;
            }
          }
        } catch {
          themeToApply = systemTheme;
        }

        get().setTheme(themeToApply);

        if (!mediaQueryListenerAttached) {
          const media = window.matchMedia("(prefers-color-scheme: dark)");
          const updateSystemTheme = (event: MediaQueryListEvent | MediaQueryList) => {
            const nextTheme = event.matches ? "dark" : "light";
            set({ systemTheme: nextTheme });
          };

          if (typeof media.addEventListener === "function") {
            media.addEventListener("change", updateSystemTheme);
          } else if (typeof media.addListener === "function") {
            media.addListener(updateSystemTheme);
          }

          updateSystemTheme(media);
          mediaQueryListenerAttached = true;
        }
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // Skip hydration to prevent SSR mismatch
    }
  )
);
