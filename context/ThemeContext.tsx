"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

export type ThemeType = "classic" | "soft-blue" | "lemon" | "mint";

interface ThemeColors {
  bg: string;
  accent: string;
}

export const themeColors: Record<ThemeType, ThemeColors> = {
  classic: { bg: "#FFF9F5", accent: "#FFAEBC" },
  "soft-blue": { bg: "#F0F7FF", accent: "#7EC8E3" },
  lemon: { bg: "#FFFEF0", accent: "#FBE7C6" },
  mint: { bg: "#F0FFF4", accent: "#B4F8C8" },
};

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("classic");
  const [isLoaded, setIsLoaded] = useState(false);
  const supabase = createClient();

  // Load theme from localStorage on mount, then from database
  useEffect(() => {
    // First, check localStorage for immediate load
    const savedTheme = localStorage.getItem("rambl-theme") as ThemeType | null;
    if (savedTheme && themeColors[savedTheme]) {
      setThemeState(savedTheme);
    }

    // Then fetch from database for authenticated users
    const loadThemeFromDB = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: preferences } = await supabase
          .from("preferences")
          .select("background_colour")
          .eq("user_id", session.user.id)
          .single();

        if (preferences?.background_colour) {
          const dbTheme = preferences.background_colour as ThemeType;
          setThemeState(dbTheme);
          localStorage.setItem("rambl-theme", dbTheme);
        }
      }
      setIsLoaded(true);
    };

    loadThemeFromDB();
  }, [supabase]);

  // Update theme and persist to localStorage
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem("rambl-theme", newTheme);
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--theme-bg",
      themeColors[theme].bg
    );
    document.documentElement.style.setProperty(
      "--theme-accent",
      themeColors[theme].accent
    );
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, colors: themeColors[theme] }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
