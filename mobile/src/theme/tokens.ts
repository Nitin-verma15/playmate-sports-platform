import { Platform } from "react-native";

export const COLORS = {
  paper: "#F4F1EC",
  card: "#FCFBF8",
  ink: "#2B2622",
  muted: "#7A736A",
  track: "#E1DCD2",

  darkBg: "#1F1C1A",
  darkCard: "#2A2623",
  darkBorder: "#4D4741",
  darkText: "#F1ECE4",
  darkMuted: "#AAA397",
  darkTrack: "#3D3934",

  salmon: "#EDA896",
  salmonDark: "#D99A84",

  rust: "#C65B41",
  butter: "#F2D27A",

  sportFootball: "#F0A08C",
  sportCricket: "#D9B88A",
  sportBasketball: "#F2B073",
  sportBadminton: "#F2B8C6",
  sportTennis: "#E7E0CD",
} as const;

export const SPORT_COLORS: Record<string, string> = {
  Football: COLORS.sportFootball,
  Cricket: COLORS.sportCricket,
  Basketball: COLORS.sportBasketball,
  Badminton: COLORS.sportBadminton,
  Tennis: COLORS.sportTennis,
};

export const SPORT_EMOJIS: Record<string, string> = {
  Football: "⚽",
  Cricket: "🏏",
  Basketball: "🏀",
  Badminton: "🏸",
  Tennis: "🎾",
};

export const FONTS = {
  heading: Platform.select({ ios: "System", android: "sans-serif-condensed", default: "System" }),
  body: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
  mono: Platform.select({ ios: "Courier", android: "monospace", default: "Courier" }),
};

export const RADII = {
  card: 16,
  button: 14,
  chip: 999,
} as const;

export const SHADOWS = {
  hard: {
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  hardSalmon: {
    shadowColor: COLORS.salmon,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
