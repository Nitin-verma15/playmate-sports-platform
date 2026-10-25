import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { COLORS, RADII, SHADOWS } from "../theme/tokens";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.chalkCircle} />
      <View style={styles.chalkLine} />
      <View style={styles.container}>
        <View style={styles.top}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🎯</Text>
          </View>
          <Text style={styles.appName}>PLAYMATE</Text>
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
          style={({ pressed }) => [styles.btn, pressed && { transform: [{ translateY: 3 }], shadowOffset: { width: 0, height: 0 } }]}
          onPress={() => router.push("/auth")}
        >
          <Text style={styles.btnText}>GET STARTED</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.salmon },

  chalkCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 1,
    borderColor: COLORS.ink,
    opacity: 0.14,
    top: "50%",
    left: "50%",
    transform: [{ translateX: -150 }, { translateY: -150 }],
  },
  chalkLine: {
    position: "absolute",
    height: 1,
    left: 0,
    right: 0,
    top: "50%",
    backgroundColor: COLORS.ink,
    opacity: 0.14,
  },

  container: { flex: 1, paddingHorizontal: 24, justifyContent: "space-between", paddingBottom: 40 },
  top: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },

  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 3,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-5deg" }],
    ...SHADOWS.hard,
    marginBottom: 8,
  },
  logoEmoji: { fontSize: 40 },

  appName: {
    fontSize: 52,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: -1,
    transform: [{ rotate: "-2deg" }],
  },
  tagline: { fontSize: 14, color: COLORS.ink, opacity: 0.7 },
  iconsRow: { flexDirection: "row", gap: 12, marginTop: 20 },
  sportIcon: { fontSize: 32 },

  btn: {
    height: 56,
    backgroundColor: COLORS.butter,
    borderRadius: RADII.button,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.hard,
  },
  btnText: { color: COLORS.ink, fontSize: 19, fontWeight: "800", letterSpacing: 0.5 },
});
