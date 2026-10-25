import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import api from "../services/api";
import { useThemeContext } from "../context/ThemeContext";
import { COLORS, RADII, SHADOWS } from "../theme/tokens";

export default function OnboardingProfileScreen() {
  const { theme: t } = useThemeContext();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [college, setCollege] = useState("");
  const [loading, setLoading] = useState(false);

  const canContinue = name.trim().length > 0 && city.trim().length > 0;

  async function handleContinue() {
    if (!canContinue) return;
    setLoading(true);
    try {
      await api.post("/users/me", {
        full_name: name.trim(),
        city: city.trim(),
        college: college.trim() || undefined,
      });
      router.push({ pathname: "/onboarding-sports", params: { name: name.trim(), city: city.trim(), college: college.trim() } });
    } catch (error: any) {
      if (error.response?.status === 409) {
        router.push("/onboarding-sports");
      } else {
        Alert.alert("Error", "Could not save your profile. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]} edges={["bottom"]}>
      <View style={[styles.header, { backgroundColor: t.headerBg }]}>
        <Text style={styles.title}>SET UP PROFILE</Text>
        <Text style={[styles.step, { color: COLORS.ink }]}>Step 1 of 3</Text>
        <View style={styles.progressRow}>
          {[true, false, false].map((active, i) => (
            <View key={i} style={[styles.progressBlock, { backgroundColor: active ? COLORS.butter : COLORS.track, borderColor: COLORS.ink }]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: t.subtitle }]}>Full Name <Text style={{ color: COLORS.rust }}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.input, borderColor: COLORS.ink, color: t.inputText }]}
          placeholder="Enter your name"
          placeholderTextColor={t.placeholder}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.label, { color: t.subtitle }]}>City <Text style={{ color: COLORS.rust }}>*</Text></Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.input, borderColor: COLORS.ink, color: t.inputText }]}
          placeholder="e.g. Bangalore"
          placeholderTextColor={t.placeholder}
          value={city}
          onChangeText={setCity}
        />

        <Text style={[styles.label, { color: t.subtitle }]}>College / University</Text>
        <TextInput
          style={[styles.input, { backgroundColor: t.input, borderColor: COLORS.ink, color: t.inputText }]}
          placeholder="e.g. IIT Bangalore"
          placeholderTextColor={t.placeholder}
          value={college}
          onChangeText={setCollege}
        />

        <Pressable
          style={[styles.btn, (!canContinue || loading) && { backgroundColor: COLORS.track, borderColor: COLORS.track, shadowOpacity: 0 }]}
          onPress={handleContinue}
          disabled={!canContinue || loading}
        >
          {loading ? <ActivityIndicator color={COLORS.ink} /> : <Text style={styles.btnText}>CONTINUE</Text>}
        </Pressable>
      </ScrollView>
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
  progressRow: { flexDirection: "row", gap: 6 },
  progressBlock: { flex: 1, height: 8, borderRadius: 4, borderWidth: 1 },
  body: { padding: 20, gap: 4 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6, marginTop: 16, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14 },
  btn: {
    height: 54,
    backgroundColor: COLORS.butter,
    borderRadius: RADII.button,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
    ...SHADOWS.hard,
  },
  btnText: { color: COLORS.ink, fontSize: 17, fontWeight: "800", letterSpacing: 0.5 },
});
