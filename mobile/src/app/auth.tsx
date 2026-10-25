import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebase";
import api from "../services/api";
import { useThemeContext } from "../context/ThemeContext";
import { COLORS, RADII, SHADOWS } from "../theme/tokens";

type Mode = "options" | "email";

export default function AuthScreen() {
  const { theme: t } = useThemeContext();
  const [mode, setMode] = useState<Mode>("options");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await userCredential.user.getIdToken();
        try { await api.post("/users/me", { full_name: email.split("@")[0] }); } catch {}
        router.push("/onboarding-profile");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      let message = "Something went wrong. Please try again.";
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") message = "Incorrect email or password.";
      else if (error.code === "auth/email-already-in-use") message = "An account with this email already exists.";
      else if (error.code === "auth/weak-password") message = "Password should be at least 6 characters.";
      else if (error.code === "auth/invalid-email") message = "Please enter a valid email address.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogle() {
    Alert.alert("Coming Soon", "Google sign-in will be added soon.");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.brandBlock}>
        <View style={styles.chalkCircle} />
        <View style={styles.chalkLine} />
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🎯</Text>
        </View>
        <Text style={styles.appName}>PLAYMATE</Text>
        <Text style={styles.tagline}>Find Players. Play Your Game.</Text>
      </View>

      <View style={[styles.sheet, { backgroundColor: t.card }]}>
        {mode === "options" ? (
          <>
            <Pressable style={[styles.googleBtn, { borderColor: COLORS.ink }]} onPress={handleGoogle}>
              <Text style={[styles.googleIcon]}>G</Text>
              <Text style={[styles.googleText, { color: t.title }]}>Continue with Google</Text>
            </Pressable>

            <Pressable
              style={[styles.inkBtn, { marginTop: 12 }]}
              onPress={() => { setIsSignUp(false); setMode("email"); }}
            >
              <Text style={[styles.inkBtnText, { color: t.card }]}>✉  CONTINUE WITH EMAIL</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: COLORS.track }]} />
              <Text style={[styles.dividerText, { color: t.subtitle }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: COLORS.track }]} />
            </View>

            <Pressable
              style={[styles.outlineBtn, { borderColor: COLORS.ink }]}
              onPress={() => { setIsSignUp(true); setMode("email"); }}
            >
              <Text style={[styles.outlineBtnText, { color: t.title }]}>CREATE AN ACCOUNT</Text>
            </Pressable>

            <Text style={[styles.terms, { color: t.subtitle }]}>
              By continuing, you agree to our{" "}
              <Text style={[styles.link]}>Terms of Service</Text> and{" "}
              <Text style={[styles.link]}>Privacy Policy</Text>
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.formTitle, { color: t.title }]}>
              {isSignUp ? "CREATE ACCOUNT" : "WELCOME BACK"}
            </Text>
            <Text style={[styles.formSub, { color: t.subtitle }]}>
              {isSignUp ? "Sign up to start playing" : "Log in to continue"}
            </Text>

            <Text style={[styles.label, { color: t.subtitle }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.input, borderColor: COLORS.ink, color: t.inputText }]}
              placeholder="you@example.com"
              placeholderTextColor={t.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.label, { color: t.subtitle }]}>Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.input, borderColor: COLORS.ink, color: t.inputText }]}
              placeholder="••••••••"
              placeholderTextColor={t.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Pressable
              style={[
                styles.inkBtn,
                { marginTop: 24 },
                (!email || !password || loading) && { backgroundColor: COLORS.track, borderColor: COLORS.track },
              ]}
              onPress={handleContinue}
              disabled={!email || !password || loading}
            >
              {loading
                ? <ActivityIndicator color={COLORS.card} />
                : <Text style={[styles.inkBtnText, { color: COLORS.card }]}>{isSignUp ? "CREATE ACCOUNT" : "LOG IN"}</Text>
              }
            </Pressable>

            <Pressable onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={[styles.switchText]}>
                {isSignUp ? "Already have an account? Log in" : "New here? Create an account"}
              </Text>
            </Pressable>

            <Pressable onPress={() => setMode("options")}>
              <Text style={[styles.backText, { color: t.subtitle }]}>← Back</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.salmon },

  brandBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 20,
    overflow: "hidden",
  },
  chalkCircle: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: COLORS.ink,
    opacity: 0.14,
  },
  chalkLine: {
    position: "absolute",
    height: 1,
    left: 0,
    right: 0,
    backgroundColor: COLORS.ink,
    opacity: 0.14,
  },

  logoBox: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 3,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-5deg" }],
    ...SHADOWS.hard,
    marginBottom: 4,
  },
  logoEmoji: { fontSize: 32 },
  appName: { fontSize: 38, fontWeight: "800", color: COLORS.ink, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: COLORS.ink, opacity: 0.7 },

  sheet: {
    borderTopWidth: 3,
    borderTopColor: COLORS.ink,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },

  googleBtn: {
    height: 52,
    borderRadius: RADII.button,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleIcon: { fontSize: 18, fontWeight: "700", color: "#DB4437" },
  googleText: { fontSize: 15, fontWeight: "600" },

  inkBtn: {
    height: 52,
    borderRadius: RADII.button,
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.hard,
  },
  inkBtnText: { fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },

  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 18, gap: 12 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },

  outlineBtn: {
    height: 52,
    borderRadius: RADII.button,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  outlineBtnText: { fontSize: 15, fontWeight: "700", letterSpacing: 0.3 },

  terms: { marginTop: 20, fontSize: 12, textAlign: "center", lineHeight: 18 },
  link: { color: COLORS.rust, fontWeight: "600" },

  formTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.3 },
  formSub: { fontSize: 13, marginTop: 4, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6, marginTop: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },

  switchText: { textAlign: "center", marginTop: 18, fontSize: 13, color: COLORS.rust, fontWeight: "600" },
  backText: { textAlign: "center", marginTop: 16, fontSize: 13 },
});
