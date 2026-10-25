import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useThemeContext } from "../context/ThemeContext";
import { COLORS, RADII, SHADOWS, SPORT_COLORS, SPORT_EMOJIS } from "../theme/tokens";

const sports = [
  { id: "football",   name: "Football" },
  { id: "cricket",    name: "Cricket" },
  { id: "basketball", name: "Basketball" },
  { id: "badminton",  name: "Badminton" },
  { id: "tennis",     name: "Tennis" },
];

export default function OnboardingSportsScreen() {
  const { theme: t } = useThemeContext();
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  }

  const canContinue = selected.length > 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]} edges={["bottom"]}>
      <View style={[styles.header, { backgroundColor: t.headerBg }]}>
        <Text style={styles.title}>PICK YOUR SPORTS</Text>
        <Text style={[styles.step, { color: COLORS.ink }]}>Step 2 of 3</Text>
        <View style={styles.progressRow}>
          {[true, true, false].map((active, i) => (
            <View key={i} style={[styles.progressBlock, { backgroundColor: active ? COLORS.butter : COLORS.track, borderColor: COLORS.ink }]} />
          ))}
        </View>
        <Text style={[styles.subtitle, { color: COLORS.ink }]}>Select all sports you enjoy playing.</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.grid}>
          {sports.map((sport) => {
            const active = selected.includes(sport.id);
            const sportName = sport.name;
            const sportColor = SPORT_COLORS[sportName] ?? COLORS.track;
            const emoji = SPORT_EMOJIS[sportName] ?? "🏅";
            return (
              <Pressable
                key={sport.id}
                style={[
                  styles.tile,
                  { backgroundColor: active ? sportColor : t.card, borderColor: COLORS.ink },
                  active && { transform: [{ rotate: "-2deg" }], ...SHADOWS.hard },
                ]}
                onPress={() => toggle(sport.id)}
              >
                {active && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
                <Text style={styles.tileEmoji}>{emoji}</Text>
                <Text style={[styles.tileName, { color: COLORS.ink }]}>{sport.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.btn, !canContinue && { backgroundColor: COLORS.track, borderColor: COLORS.track, shadowOpacity: 0 }]}
          onPress={() => router.push({ pathname: "/onboarding-skill", params: { sports: selected.join(",") } })}
          disabled={!canContinue}
        >
          <Text style={styles.btnText}>CONTINUE</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
  },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.ink, letterSpacing: -0.3, textTransform: "uppercase" },
  step: { fontSize: 12, fontWeight: "600", marginTop: 8, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  progressRow: { flexDirection: "row", gap: 6, marginBottom: 12 },
  progressBlock: { flex: 1, height: 8, borderRadius: 4, borderWidth: 1 },
  subtitle: { fontSize: 14, opacity: 0.8 },
  body: { flex: 1, padding: 20, justifyContent: "space-between" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: {
    width: "47%",
    height: 90,
    borderRadius: RADII.card,
    borderWidth: 2,
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 4,
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.ink,
    width: 20,
    height: 20,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: { color: COLORS.card, fontSize: 11, fontWeight: "800" },
  tileEmoji: { fontSize: 26 },
  tileName: { fontSize: 14, fontWeight: "700" },
  btn: {
    height: 54,
    backgroundColor: COLORS.butter,
    borderRadius: RADII.button,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    ...SHADOWS.hard,
  },
  btnText: { color: COLORS.ink, fontSize: 17, fontWeight: "800", letterSpacing: 0.5 },
});
