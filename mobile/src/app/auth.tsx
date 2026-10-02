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

type Mode = "options" | "email";

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("options");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleContinue() {
    if (isSignUp) {
      router.push("/onboarding-profile");
    } else {
      router.replace("/(tabs)");
    }
  }

  function handleGoogle() {
    router.push("/onboarding-profile");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.brandBlock}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🎯</Text>
        </View>
        <Text style={styles.appName}>PlayMate</Text>
        <Text style={styles.tagline}>Find Players. Play Your Game.</Text>
      </View>

      <View style={styles.sheet}>
        {mode === "options" ? (
          <>
            <Pressable
              style={({ pressed }) => [styles.googleBtn, pressed && { opacity: 0.9 }]}
              onPress={handleGoogle}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.emailBtn, pressed && { opacity: 0.9 }]}
              onPress={() => { setIsSignUp(false); setMode("email"); }}
            >
              <Text style={styles.emailBtnText}>✉  Continue with Email</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <Pressable
              style={({ pressed }) => [styles.createBtn, pressed && { opacity: 0.9 }]}
              onPress={() => { setIsSignUp(true); setMode("email"); }}
            >
              <Text style={styles.createBtnText}>Create an Account</Text>
            </Pressable>

            <Text style={styles.terms}>
              By continuing, you agree to our{" "}
              <Text style={styles.link}>Terms of Service</Text> and{"\n"}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.formTitle}>
              {isSignUp ? "Create Account" : "Welcome Back"}
            </Text>
            <Text style={styles.formSub}>
              {isSignUp ? "Sign up to start playing" : "Log in to continue"}
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                (!email || !password) && styles.submitBtnDisabled,
                pressed && { opacity: 0.9 },
              ]}
              onPress={handleContinue}
              disabled={!email || !password}
            >
              <Text style={styles.submitBtnText}>
                {isSignUp ? "Create Account" : "Log In"}
              </Text>
            </Pressable>

            <Pressable onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.switchText}>
                {isSignUp
                  ? "Already have an account? Log in"
                  : "New here? Create an account"}
              </Text>
            </Pressable>

            <Pressable onPress={() => setMode("options")}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#2563EB" },

  brandBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 20,
  },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center", marginBottom: 6,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 34, fontWeight: "800", color: "#fff" },
  tagline: { fontSize: 14, color: "rgba(255,255,255,0.85)" },

  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },

  googleBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 12,
  },
  googleIcon: { fontSize: 18, fontWeight: "700", color: "#DB4437" },
  googleText: { fontSize: 15, fontWeight: "600", color: "#374151" },

  emailBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  emailBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },

  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 18, gap: 12 },
  divider: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  dividerText: { fontSize: 13, color: "#94A3B8" },

  createBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnText: { fontSize: 15, fontWeight: "600", color: "#374151" },

  terms: { marginTop: 20, fontSize: 12, color: "#94A3B8", textAlign: "center", lineHeight: 18 },
  link: { color: "#2563EB", fontWeight: "600" },

  formTitle: { fontSize: 22, fontWeight: "700", color: "#111827" },
  formSub: { fontSize: 13, color: "#64748B", marginTop: 4, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 12 },
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
  submitBtn: {
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  submitBtnDisabled: { backgroundColor: "#CBD5E1" },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  switchText: { textAlign: "center", marginTop: 18, fontSize: 13, color: "#2563EB", fontWeight: "600" },
  backText: { textAlign: "center", marginTop: 16, fontSize: 13, color: "#94A3B8" },
});
