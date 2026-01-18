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
  accentDark: string; // Darker version for text/buttons
  accentLight: string; // Light version for backgrounds
}

export const themeColors: Record<ThemeType, ThemeColors> = {
  classic: {
    bg: "#FFF9F5",
    accent: "#FF8FA3",
    accentDark: "#E85D75",
    accentLight: "#FFAEBC",
  },
  "soft-blue": {
    bg: "#F0F7FF",
    accent: "#5BB5D5",
    accentDark: "#3A9BC5",
    accentLight: "#7EC8E3",
  },
  lemon: {
    bg: "#FFFEF0",
    accent: "#F5C842",
    accentDark: "#D4A82E",
    accentLight: "#FBE7C6",
  },
  mint: {
    bg: "#F0FFF4",
    accent: "#4FD18B",
    accentDark: "#2FB36E",
    accentLight: "#B4F8C8",
  },
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
    const colors = themeColors[theme];
    document.documentElement.style.setProperty("--theme-bg", colors.bg);
    document.documentElement.style.setProperty("--theme-accent", colors.accent);
    document.documentElement.style.setProperty("--theme-accent-dark", colors.accentDark);
    document.documentElement.style.setProperty("--theme-accent-light", colors.accentLight);
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
