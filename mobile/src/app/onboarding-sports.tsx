import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

const sports = [
  { id: "football",   name: "Football",   emoji: "⚽", color: "#2563EB" },
  { id: "cricket",    name: "Cricket",    emoji: "🏏", color: "#16A34A" },
  { id: "basketball", name: "Basketball", emoji: "🏀", color: "#D97706" },
  { id: "badminton",  name: "Badminton",  emoji: "🏸", color: "#7C3AED" },
  { id: "tennis",     name: "Tennis",     emoji: "🎾", color: "#EA580C" },
];

export default function OnboardingSportsScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  const canContinue = selected.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.top}>
          <Text style={styles.title}>Pick your sports</Text>

          <Text style={styles.step}>Step 2 of 3</Text>
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={styles.progressBar} />
          </View>

          <Text style={styles.subtitle}>Select all sports you enjoy playing.</Text>

          <View style={styles.grid}>
            {sports.map((sport) => {
              const active = selected.includes(sport.id);
              return (
                <Pressable
                  key={sport.id}
                  style={[
                    styles.card,
                    active && { borderColor: sport.color, borderWidth: 2, backgroundColor: "#F8FAFF" },
                  ]}
                  onPress={() => toggle(sport.id)}
                >
                  {active && (
                    <View style={[styles.check, { backgroundColor: sport.color }]}>
                      <Text style={styles.checkText}>✓</Text>
                    </View>
                  )}
                  <Text style={styles.cardEmoji}>{sport.emoji}</Text>
                  <Text style={styles.cardName}>{sport.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            !canContinue && styles.btnDisabled,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push("/onboarding-skill")}
          disabled={!canContinue}
        >
          <Text style={styles.btnText}>Continue</Text>
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
  subtitle: { fontSize: 14, color: "#64748B", marginBottom: 20 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "47%",
    height: 90,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  check: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  cardEmoji: { fontSize: 28, marginBottom: 6 },
  cardName: { fontSize: 14, fontWeight: "700", color: "#111827" },

  btn: { height: 54, backgroundColor: "#2563EB", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  btnDisabled: { backgroundColor: "#CBD5E1" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
