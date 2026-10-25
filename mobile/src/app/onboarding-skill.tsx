import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import api from "../services/api";
import { useThemeContext } from "../context/ThemeContext";
import { COLORS, RADII, SHADOWS } from "../theme/tokens";

const levels = [
  { id: "beginner",     name: "Beginner",     desc: "Just starting out, learning the rules.", bars: 1 },
  { id: "intermediate", name: "Intermediate", desc: "Know the basics, play regularly.",        bars: 2 },
  { id: "advanced",     name: "Advanced",     desc: "Competitive experience, play at a high level.", bars: 3 },
];

export default function OnboardingSkillScreen() {
  const { theme: t } = useThemeContext();
  const [selected, setSelected] = useState<string | null>(null);
  const params = useLocalSearchParams<{ sports?: string }>();
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    if (!selected) return;
    setLoading(true);
    try {
      const selectedSports = params.sports ? params.sports.split(",") : [];
      const sportsPayload = selectedSports.map((sportId) => ({
        sport: sportId.charAt(0).toUpperCase() + sportId.slice(1),
        skill_level: selected.charAt(0).toUpperCase() + selected.slice(1),
      }));
      if (sportsPayload.length > 0) {
        await api.put("/users/me/sports", { sports: sportsPayload });
      }
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "Could not save your preferences. You can update them later in your profile.");
      router.replace("/(tabs)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]} edges={["bottom"]}>
      <View style={[styles.header, { backgroundColor: t.headerBg }]}>
        <Text style={styles.title}>YOUR SKILL LEVEL</Text>
        <Text style={[styles.step, { color: COLORS.ink }]}>Step 3 of 3</Text>
        <View style={styles.progressRow}>
          {[true, true, true].map((active, i) => (
            <View key={i} style={[styles.progressBlock, { backgroundColor: active ? COLORS.butter : COLORS.track, borderColor: COLORS.ink }]} />
          ))}
        </View>
        <Text style={[styles.subtitle, { color: COLORS.ink }]}>Choose your general skill level.</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.list}>
          {levels.map((level) => {
            const active = selected === level.id;
            return (
              <Pressable
                key={level.id}
                style={[
                  styles.card,
                  { backgroundColor: active ? "#F2D27A30" : t.card, borderColor: COLORS.ink },
                  active && SHADOWS.hard,
                ]}
                onPress={() => setSelected(level.id)}
              >
                <View style={styles.cardLeft}>
                  <Text style={[styles.cardName, { color: t.title }]}>{level.name}</Text>
                  <Text style={[styles.cardDesc, { color: t.subtitle }]}>{level.desc}</Text>
                </View>
                <View style={styles.signalMeter}>
                  {[1, 2, 3].map((bar) => (
                    <View
                      key={bar}
                      style={[
                        styles.signalBar,
                        { height: bar * 8 + 4 },
                        active && bar <= level.bars
                          ? { backgroundColor: COLORS.rust, borderColor: COLORS.rust }
                          : { backgroundColor: "transparent", borderColor: COLORS.ink },
                      ]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.btn, (!selected || loading) && { backgroundColor: COLORS.track, borderColor: COLORS.track, shadowOpacity: 0 }]}
          onPress={handleFinish}
          disabled={!selected || loading}
        >
          {loading ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.btnText}>LET&apos;S PLAY 🎉</Text>}
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
  list: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: RADII.card,
    borderWidth: 2,
    gap: 14,
  },
  cardLeft: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "700", marginBottom: 3 },
  cardDesc: { fontSize: 12 },
  signalMeter: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  signalBar: { width: 8, borderRadius: 2, borderWidth: 1.5 },
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
