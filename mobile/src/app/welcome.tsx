import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.top}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🎯</Text>
          </View>
          <Text style={styles.appName}>PlayMate</Text>
          <Text style={styles.tagline}>Find Players. Play Your Game.</Text>

          <View style={styles.iconsRow}>
            <Text style={styles.sportIcon}>⚽</Text>
            <Text style={styles.sportIcon}>🏀</Text>
            <Text style={styles.sportIcon}>🏏</Text>
            <Text style={styles.sportIcon}>🏸</Text>
            <Text style={styles.sportIcon}>🎾</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
          onPress={() => router.push("/auth")}
        >
          <Text style={styles.btnText}>Get Started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#2563EB" },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between", paddingBottom: 40 },
  top: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  logoBox: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  logoEmoji: { fontSize: 40 },
  appName: { fontSize: 42, fontWeight: "800", color: "#fff", letterSpacing: -0.5 },
  tagline: { fontSize: 16, color: "rgba(255,255,255,0.85)", marginTop: 4 },
  iconsRow: { flexDirection: "row", gap: 14, marginTop: 28 },
  sportIcon: { fontSize: 30 },
  btn: { height: 56, backgroundColor: "#fff", borderRadius: 16, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#2563EB", fontSize: 17, fontWeight: "700" },
});
