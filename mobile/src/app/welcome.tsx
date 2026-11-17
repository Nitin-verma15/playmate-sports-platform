import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { COLORS, RADII, SHADOWS, SPORT_COLORS } from "../theme/tokens";
import { ChalkPitchLines, Floaty, Marquee } from "@/components/ui";

// Illustrative match tickets fanned out on the welcome screen.
const previewTickets = [
  { sport: "Football", emoji: "⚽", title: "Sunday Kickabout", time: "7:00 AM", filled: 7, max: 10, rotate: "-7deg", left: "4%", top: 0 },
  { sport: "Badminton", emoji: "🏸", title: "Doubles Night", time: "8:30 PM", filled: 2, max: 4, rotate: "5deg", left: "30%", top: 62 },
  { sport: "Cricket", emoji: "🏏", title: "Box Cricket", time: "6:00 PM", filled: 9, max: 12, rotate: "-3deg", left: "10%", top: 128 },
] as const;

const tickerItems = ["⚽ Football", "🏏 Cricket", "🏀 Basketball", "🏸 Badminton", "🎾 Tennis"];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ChalkPitchLines circleSize={320} />

      <View style={styles.container}>
        {/* Brand row */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🎯</Text>
          </View>
          <Text style={styles.wordmark}>PLAYMATE</Text>
        </Animated.View>

        {/* Headline */}
        <Animated.View entering={FadeInDown.delay(120).duration(500)}>
          <Text style={styles.headline}>FIND</Text>
          <View style={styles.headlineRow}>
            <Text style={styles.headline}>YOUR</Text>
            <View style={styles.highlight}>
              <Text style={[styles.headline, styles.highlightText]}>GAME.</Text>
            </View>
          </View>
          <Text style={styles.tagline}>Nearby matches, open spots, real players.</Text>
        </Animated.View>

        {/* Fanned ticket stack */}
        <View style={styles.stack}>
          {previewTickets.map((tk, i) => (
            <Animated.View
              key={tk.title}
              entering={FadeInUp.delay(250 + i * 130).springify().damping(14)}
              style={[styles.ticketPos, { left: tk.left, top: tk.top }]}
            >
              <Floaty delay={i * 350} distance={5}>
                <View style={[styles.ticket, { transform: [{ rotate: tk.rotate }] }]}>
                  <View style={[styles.ticketStub, { backgroundColor: SPORT_COLORS[tk.sport] }]}>
                    <Text style={styles.ticketEmoji}>{tk.emoji}</Text>
                  </View>
                  <View style={styles.ticketBody}>
                    <Text style={styles.ticketTitle} numberOfLines={1}>{tk.title}</Text>
                    <Text style={styles.ticketMeta}>🕐 {tk.time} · {tk.max - tk.filled} spots left</Text>
                    <View style={styles.blocks}>
                      {Array.from({ length: tk.max }).map((_, b) => (
                        <View key={b} style={[styles.block, b < tk.filled && styles.blockFilled]} />
                      ))}
                    </View>
                  </View>
                </View>
              </Floaty>
            </Animated.View>
          ))}
        </View>
      </View>

      <Marquee items={tickerItems} style={styles.marquee} />

      <Animated.View entering={FadeInUp.delay(450).duration(500)} style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={() => router.push("/auth")}
        >
          <Text style={styles.btnText}>GET STARTED  →</Text>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.salmon },

  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },

  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 28 },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 11,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-6deg" }],
    ...SHADOWS.hard,
  },
  logoEmoji: { fontSize: 22 },
  wordmark: { fontSize: 20, fontWeight: "800", color: COLORS.ink, letterSpacing: 2 },

  headline: { fontSize: 50, lineHeight: 56, fontWeight: "800", color: COLORS.ink, letterSpacing: -1.5 },
  headlineRow: { flexDirection: "row", alignItems: "center" },
  highlight: {
    backgroundColor: COLORS.butter,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 12,
    paddingHorizontal: 8,
    marginLeft: 10,
    transform: [{ rotate: "-3deg" }],
    ...SHADOWS.hard,
  },
  highlightText: { lineHeight: 58 },
  tagline: { fontSize: 15, color: COLORS.ink, opacity: 0.75, marginTop: 14, fontWeight: "600" },

  stack: { flex: 1, minHeight: 230, marginTop: 18 },
  ticketPos: { position: "absolute", width: "64%" },
  ticket: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 14,
    overflow: "hidden",
    ...SHADOWS.hard,
  },
  ticketStub: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRightWidth: 2,
    borderRightColor: COLORS.ink,
  },
  ticketEmoji: { fontSize: 24 },
  ticketBody: { flex: 1, paddingHorizontal: 10, paddingVertical: 9 },
  ticketTitle: { fontSize: 13, fontWeight: "800", color: COLORS.ink, textTransform: "uppercase" },
  ticketMeta: { fontSize: 11, color: COLORS.muted, marginTop: 2, fontWeight: "600" },
  blocks: { flexDirection: "row", flexWrap: "wrap", gap: 3, marginTop: 6 },
  block: { width: 9, height: 9, borderRadius: 2, borderWidth: 1, borderColor: COLORS.ink, backgroundColor: COLORS.track },
  blockFilled: { backgroundColor: COLORS.ink },

  marquee: { transform: [{ rotate: "-2deg" }], marginHorizontal: -10, marginBottom: 22 },

  footer: { paddingHorizontal: 24, paddingBottom: 28 },
  btn: {
    height: 58,
    backgroundColor: COLORS.butter,
    borderRadius: RADII.button,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.hard,
  },
  btnPressed: { transform: [{ translateY: 3 }], shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  btnText: { color: COLORS.ink, fontSize: 19, fontWeight: "800", letterSpacing: 1 },
});
