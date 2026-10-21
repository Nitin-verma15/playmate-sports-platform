import { createContext, useContext, useState } from "react";

const light = {
  dark: false,
  bg: "#F7F9FC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  title: "#111827",
  subtitle: "#64748B",
  input: "#FFFFFF",
  inputText: "#111827",
  placeholder: "#94A3B8",
  rowBorder: "#F1F5F9",
  searchBg: "#FFFFFF",
  pressedBg: "#F1F5F9",
};

const dark = {
  dark: true,
  bg: "#0F172A",
  card: "#1E293B",
  border: "#334155",
  title: "#F1F5F9",
  subtitle: "#94A3B8",
  input: "#1E293B",
  inputText: "#F1F5F9",
  placeholder: "#64748B",
  rowBorder: "#334155",
  searchBg: "#1E293B",
  pressedBg: "#0F172A",
};

export type Theme = typeof light;

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: light,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  function toggleTheme() {
    setIsDark((prev) => !prev);
  }

  return (
    <ThemeContext.Provider value={{ theme: isDark ? dark : light, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
