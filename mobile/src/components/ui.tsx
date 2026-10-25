// Shared Matchday UI components: PrimaryButton, SportTag, SportTile, ChalkPitchLines.
// Reused across screens. Style-only helpers — no business logic.

import { ActivityIndicator, Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from "react-native";

import { COLORS, FONTS, RADII, SHADOWS, SPORT_COLORS } from "@/theme/tokens";
import { useThemeContext } from "@/context/ThemeContext";

/* --------------------------------- PrimaryButton --------------------------------- */
type ButtonVariant = "butter" | "ink" | "outlined";

type PrimaryButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  height?: number;
  uppercase?: boolean;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
};

const variantConf: Record<ButtonVariant, { bg: string; text: string; disabledBg: string }> = {
  butter: { bg: COLORS.butter, text: COLORS.ink, disabledBg: COLORS.track },
  ink: { bg: COLORS.ink, text: COLORS.card, disabledBg: COLORS.track },
  outlined: { bg: "transparent", text: COLORS.ink, disabledBg: "transparent" },
};

export function PrimaryButton({
  title,
  onPress,
  variant = "butter",
  disabled,
  loading,
  height = 54,
  uppercase = true,
  style,
  textStyle,
}: PrimaryButtonProps) {
  const conf = variantConf[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btnBase,
        {
          height,
          borderRadius: RADII.button,
          borderWidth: 2,
          borderColor: COLORS.ink,
          backgroundColor: disabled ? conf.disabledBg : conf.bg,
        },
        variant !== "outlined" && SHADOWS.hard,
        pressed &&
          !disabled && {
            transform: [{ translateY: 3 }],
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            elevation: 0,
          },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={conf.text} />
      ) : (
        <Text
          style={[
            styles.btnText,
            { color: disabled && variant !== "outlined" ? COLORS.muted : conf.text },
            uppercase && { textTransform: "uppercase" },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

/* ----------------------------------- SportTag ----------------------------------- */
// Tilted -2deg sport-color sticker pill.
export function SportTag({
  sport,
  emoji,
  style,
}: {
  sport: string;
  emoji?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.tag, { backgroundColor: SPORT_COLORS[sport] ?? COLORS.track }, style]}>
      <Text style={styles.tagText}>
        {emoji ? `${emoji} ` : ""}
        {sport}
      </Text>
    </View>
  );
}

/* ----------------------------------- SportTile ----------------------------------- */
// mode "select": onboarding/create — unselected = card + border, selected = sport fill + tilt -2 + check badge.
// mode "filter": home — always sport fill + ink border; active adds an ink outline ring.
export function SportTile({
  name,
  emoji,
  selected,
  onPress,
  mode = "select",
  showCheck = true,
  style,
}: {
  name: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
  mode?: "select" | "filter";
  showCheck?: boolean;
  style?: ViewStyle;
}) {
  const { theme: t } = useThemeContext();
  const color = SPORT_COLORS[name] ?? COLORS.track;
  const filled = mode === "filter" ? true : selected;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: filled ? color : t.card,
          borderColor: filled ? COLORS.ink : t.border,
        },
        mode === "select" && selected && { transform: [{ rotate: "-2deg" }] },
        pressed && { opacity: 0.92 },
        style,
      ]}
    >
      {mode === "filter" && selected && <View style={styles.activeRing} />}
      {mode === "select" && selected && showCheck && (
        <View style={styles.checkBadge}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
      <Text style={styles.tileEmoji}>{emoji}</Text>
      <Text style={[styles.tileName, { color: filled ? COLORS.ink : t.title }]}>{name}</Text>
    </Pressable>
  );
}

/* ------------------------------- ChalkPitchLines ------------------------------- */
// Faint chalk pitch lines (a circle + a halfway line) in ink at 14% opacity.
export function ChalkPitchLines({
  circleSize = 280,
  style,
}: {
  circleSize?: number;
  style?: ViewStyle;
}) {
  return (
    <View pointerEvents="none" style={[styles.pitch, style]}>
      <View
        style={{
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          borderWidth: 1,
          borderColor: COLORS.ink,
        }}
      />
      <View style={styles.halfway} />
    </View>
  );
}

const styles = StyleSheet.create({
  btnBase: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  btnText: {
    fontFamily: FONTS.heading,
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  tag: {
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: RADII.chip,
    transform: [{ rotate: "-2deg" }],
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  tagText: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: "700",
  },
  tile: {
    borderWidth: 2,
    borderRadius: RADII.card,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  activeRing: {
    position: "absolute",
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderWidth: 3,
    borderColor: COLORS.ink,
    borderRadius: RADII.card + 5,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: COLORS.paper,
    fontSize: 12,
    fontWeight: "800",
  },
  tileEmoji: {
    fontSize: 28,
  },
  tileName: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  pitch: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.14,
  },
  halfway: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    height: 1,
    backgroundColor: COLORS.ink,
  },
});
