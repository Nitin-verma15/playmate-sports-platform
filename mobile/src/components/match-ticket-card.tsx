// MatchTicketCard — the signature "match ticket" game card.
// Purely presentational: reads `game` fields and calls `onPress`.
// The whole card is one Pressable (taps open game-details via the screen's handler).
// The "Join" / "FULL" control is a styled visual inside the tappable card — no extra
// backend call is introduced here, so navigation behaviour is unchanged.

import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { COLORS, FONTS, RADII, SHADOWS, SPORT_COLORS, SPORT_EMOJIS } from "@/theme/tokens";
import { useThemeContext } from "@/context/ThemeContext";
import { SportTag } from "@/components/ui";

export type TicketGame = {
  id: number;
  sport: string;
  title: string;
  venue: string;
  scheduled_at: string;
  skill_level: "Beginner" | "Intermediate" | "Advanced";
  current_players: number;
  max_players: number;
  status: string;
  organizer_name: string;
};

type Props = {
  game: TicketGame;
  onPress: () => void;
  showPlayed?: boolean;
  style?: ViewStyle;
};

export function MatchTicketCard({ game, onPress, showPlayed, style }: Props) {
  const { theme: t } = useThemeContext();
  const isFull = game.current_players >= game.max_players;
  const isCompleted = game.status === "COMPLETED";

  const date = new Date(game.scheduled_at);
  const dayNum = date.getDate();
  const month = date.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const blocks = [];
  for (let i = 0; i < game.max_players; i++) {
    const joined = i < game.current_players;
    blocks.push(
      <View
        key={i}
        style={
          joined
            ? styles.playerBlockFilled
            : [styles.playerBlockEmpty, { borderColor: COLORS.ink }]
        }
      />
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: t.card, borderColor: t.border },
        pressed && { opacity: 0.96 },
        style,
      ]}
    >
      {/* Left stub */}
      <View style={[styles.stub, { backgroundColor: SPORT_COLORS[game.sport] ?? COLORS.track }]}>
        <Text style={styles.stubDay}>{dayNum}</Text>
        <Text style={styles.stubMonth}>{month}</Text>
        <View style={[styles.tearLine, { backgroundColor: COLORS.ink }]} />
        <Text style={styles.stubTime}>{timeStr}</Text>
      </View>

      {/* Notches top & bottom of the tear line */}
      <View style={[styles.notch, styles.notchTop, { backgroundColor: t.bg }]} />
      <View style={[styles.notch, styles.notchBottom, { backgroundColor: t.bg }]} />

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.bodyTop}>
          <SportTag sport={game.sport} emoji={SPORT_EMOJIS[game.sport] ?? "⚽"} />
          {showPlayed && isCompleted && (
            <View style={styles.playedBadge}>
              <Text style={styles.playedText}>PLAYED</Text>
            </View>
          )}
        </View>

        <Text style={[styles.title, { color: t.title }]} numberOfLines={1}>
          {game.title}
        </Text>
        <Text style={[styles.venue, { color: t.subtitle }]} numberOfLines={1}>
          📍 {game.venue}
        </Text>

        <View style={styles.playerRow}>
          <View style={styles.blocks}>{blocks}</View>
          <Text style={styles.playerCount}>
            {game.current_players}/{game.max_players}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={[styles.skillPill, { borderColor: COLORS.ink }]}>
            <Text style={[styles.skillPillText, { color: t.title }]}>{game.skill_level}</Text>
          </View>
          <View
            style={[
              styles.joinBtn,
              {
                backgroundColor: isFull ? COLORS.ink : COLORS.butter,
                borderColor: COLORS.ink,
              },
            ]}
          >
            <Text style={[styles.joinText, { color: isFull ? COLORS.card : COLORS.ink }]}>
              {isFull ? "FULL" : "JOIN"}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: RADII.card,
    marginBottom: 14,
    overflow: "visible",
  },
  stub: {
    width: 72,
    borderRightWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 2,
  },
  stubDay: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.ink,
    lineHeight: 30,
  },
  stubMonth: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: 0.5,
  },
  tearLine: {
    width: 28,
    height: 2,
    marginVertical: 6,
    opacity: 0.5,
  },
  stubTime: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.ink,
    fontWeight: "700",
  },
  notch: {
    position: "absolute",
    left: 61,
    width: 22,
    height: 11,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.ink,
  },
  notchTop: {
    top: -6,
  },
  notchBottom: {
    bottom: -6,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 8,
  },
  bodyTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  playedBadge: {
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: RADII.chip,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: COLORS.ink,
  },
  playedText: {
    color: COLORS.card,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  venue: {
    fontSize: 13,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: 4,
  },
  blocks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    maxWidth: 170,
  },
  playerBlockFilled: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: COLORS.ink,
  },
  playerBlockEmpty: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: COLORS.track,
    borderWidth: 1,
  },
  playerCount: {
    fontFamily: FONTS.mono,
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.ink,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  skillPill: {
    borderWidth: 2,
    borderRadius: RADII.chip,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  skillPillText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  joinBtn: {
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  joinText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
