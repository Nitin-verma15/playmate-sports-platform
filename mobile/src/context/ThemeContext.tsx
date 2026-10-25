import { createContext, useContext, useState } from "react";
import { COLORS } from "../theme/tokens";

const light = {
  dark: false,
  bg: COLORS.paper,
  card: COLORS.card,
  border: COLORS.ink,
  title: COLORS.ink,
  subtitle: COLORS.muted,
  input: COLORS.card,
  inputText: COLORS.ink,
  placeholder: COLORS.muted,
  rowBorder: COLORS.track,
  searchBg: COLORS.card,
  pressedBg: COLORS.track,
  headerBg: COLORS.salmon,
};

const dark = {
  dark: true,
  bg: COLORS.darkBg,
  card: COLORS.darkCard,
  border: COLORS.darkBorder,
  title: COLORS.darkText,
  subtitle: COLORS.darkMuted,
  input: COLORS.darkCard,
  inputText: COLORS.darkText,
  placeholder: COLORS.darkMuted,
  rowBorder: COLORS.darkBorder,
  searchBg: COLORS.darkCard,
  pressedBg: COLORS.darkBg,
  headerBg: COLORS.salmonDark,
};

export type Theme = typeof light | typeof dark;

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
