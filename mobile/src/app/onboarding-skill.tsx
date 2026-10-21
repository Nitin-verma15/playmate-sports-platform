import { useState } from "react";
import {
  ActivityIndicator,
  Alert ,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import api from "../services/api";
import { useThemeContext } from "../context/ThemeContext";

const levels = [
  { id: "beginner",     name: "Beginner",     desc: "Just starting out, learning the rules." },
  { id: "intermediate", name: "Intermediate", desc: "Know the basics, play regularly." },
  { id: "advanced",     name: "Advanced",     desc: "Competitive experience, play at a high level." },
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={[styles.title, { color: t.title }]}>Your skill level</Text>

          <Text style={[styles.step, { color: t.subtitle }]}>Step 3 of 3</Text>
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, styles.progressActive]} />
          </View>

          <Text style={[styles.subtitle, { color: t.subtitle }]}>
            Choose your general skill level across your preferred sports.
          </Text>

          <View style={styles.list}>
            {levels.map((level) => {
              const active = selected === level.id;
              return (
                <Pressable
                  key={level.id}
                  style={[
                    styles.card,
                    !active && { backgroundColor: t.card, borderColor: t.border },
                    active && styles.cardActive,
                  ]}
                  onPress={() => setSelected(level.id)}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, { color: t.title }, active && { color: "#2563EB" }]}>
                      {level.name}
                    </Text>
                    <Text style={[styles.cardDesc, { color: t.placeholder }]}>{level.desc}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            !selected && styles.btnDisabled,
            pressed && { opacity: 0.9 },
          ]}
          onPress={handleFinish}
          disabled={!selected || loading}

        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Let&apos;s Play 🎉</Text>}

        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32, justifyContent: "space-between" },
  top: { flex: 1 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  step: { fontSize: 13, color: "#64748B", marginTop: 14, marginBottom: 8 },
  progressRow: { flexDirection: "row", gap: 6, marginBottom: 24 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0" },
  progressActive: { backgroundColor: "#2563EB" },
  subtitle: { fontSize: 14, color: "#64748B", marginBottom: 20, lineHeight: 20 },

  list: { gap: 12 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
    gap: 14,
  },
  cardActive: { borderColor: "#2563EB", borderWidth: 2, backgroundColor: "#F8FAFF" },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: "#2563EB" },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: "#2563EB" },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 3 },
  cardDesc: { fontSize: 12, color: "#94A3B8" },

  btn: { height: 54, backgroundColor: "#2563EB", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  btnDisabled: { backgroundColor: "#CBD5E1" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
