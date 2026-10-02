import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function OnboardingProfileScreen() {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [college, setCollege] = useState("");

  const canContinue = name.trim().length > 0 && city.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View>
          <Text style={styles.title}>Set up your profile</Text>

          <Text style={styles.step}>Step 1 of 3</Text>
          <View style={styles.progressRow}>
            <View style={[styles.progressBar, styles.progressActive]} />
            <View style={styles.progressBar} />
            <View style={styles.progressBar} />
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Bangalore"
              placeholderTextColor="#94A3B8"
              value={city}
              onChangeText={setCity}
            />

            <Text style={styles.label}>College / University</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. IIT Bangalore"
              placeholderTextColor="#94A3B8"
              value={college}
              onChangeText={setCollege}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.btn,
            !canContinue && styles.btnDisabled,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => router.push("/onboarding-sports")}
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
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  step: { fontSize: 13, color: "#64748B", marginTop: 14, marginBottom: 8 },
  progressRow: { flexDirection: "row", gap: 6, marginBottom: 24 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0" },
  progressActive: { backgroundColor: "#2563EB" },
  form: { gap: 4 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 14 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#F8FAFC",
  },
  btn: { height: 54, backgroundColor: "#2563EB", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  btnDisabled: { backgroundColor: "#CBD5E1" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
