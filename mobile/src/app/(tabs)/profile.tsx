import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import api from "../../services/api";
import { auth } from "../../config/firebase";
import { useThemeContext } from "../../context/ThemeContext";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

type UserProfile = {
  id: number;
  full_name: string;
  email: string;
  city: string;
  college: string;
  firebase_uid: string;
};

type SportSkill = {
  sport: string;
  skill_level: SkillLevel;
};

const sportEmojis: Record<string, string> = {
  Football: "⚽", Cricket: "🏏", Basketball: "🏀", Badminton: "🏸", Tennis: "🎾",
};

const sportColors: Record<string, { text: string; bg: string }> = {
  Football:   { text: "#2563EB", bg: "#EAF1FF" },
  Cricket:    { text: "#16A34A", bg: "#E8F5E9" },
  Basketball: { text: "#D97706", bg: "#FEF3C7" },
  Badminton:  { text: "#7C3AED", bg: "#F3E8FF" },
  Tennis:     { text: "#EA580C", bg: "#FEF0E7" },
};

const skillColors: Record<SkillLevel, { text: string; bg: string }> = {
  Beginner:     { text: "#16A34A", bg: "#E8F5E9" },
  Intermediate: { text: "#D97706", bg: "#FEF3C7" },
  Advanced:     { text: "#DC2626", bg: "#FEE2E2" },
};

export default function ProfileScreen() {
  const { theme: t, isDark, toggleTheme } = useThemeContext();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sports, setSports] = useState<SportSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [college, setCollege] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/users/me")
      .then((res) => {
        const data = res.data;
        setProfile(data.user);
        setSports(data.sports || []);
        setName(data.user.full_name || "");
        setCity(data.user.city || "");
        setCollege(data.user.college || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await api.put("/users/me", {
        full_name: name.trim(),
        city: city.trim(),
        college: college.trim() || undefined,
      });
      setProfile((prev) => prev ? { ...prev, full_name: name, city, college } : prev);
      setEditing(false);
      Alert.alert("Saved", "Profile updated.");
    } catch {
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          router.replace("/auth");
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]}>
        <ActivityIndicator color="#2563EB" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Player";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.topBar}>
          <Text style={[styles.screenTitle, { color: t.title }]}>Profile</Text>
          <Pressable
            style={[editing ? styles.saveBtn : styles.editBtn, !editing && { backgroundColor: t.card, borderColor: t.border }]}
            onPress={editing ? handleSave : () => setEditing(true)}
            disabled={saving}
          >
            <Text style={editing ? styles.saveBtnText : [styles.editBtnText, { color: t.title }]}>
              {saving ? "Saving..." : editing ? "Save" : "Edit"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          {editing ? (
            <>
              <TextInput
                style={[styles.nameInput, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={[styles.subInput, { marginTop: 6, backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
                value={college}
                onChangeText={setCollege}
                placeholder="College"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={[styles.subInput, { marginTop: 6, backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#94A3B8"
              />
            </>
          ) : (
            <>
              <Text style={[styles.name, { color: t.title }]}>{displayName}</Text>
              <Text style={[styles.subInfo, { color: t.subtitle }]}>
                {[profile?.college, profile?.city].filter(Boolean).join("  •  ") || profile?.email}
              </Text>
            </>
          )}
        </View>

        {sports.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: t.title }]}>Preferred Sports</Text>
            <View style={styles.chipsRow}>
              {sports.map((s) => {
                const sc = sportColors[s.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
                const emoji = sportEmojis[s.sport] ?? "🏅";
                return (
                  <View key={s.sport} style={[styles.chip, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.chipText, { color: sc.text }]}>{emoji} {s.sport}</Text>
                  </View>
                );
              })}
            </View>

            <Text style={[styles.sectionTitle, { color: t.title }]}>Skill Levels</Text>
            <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
              {sports.map((s, i) => {
                const sc = sportColors[s.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
                const skc = skillColors[s.skill_level] ?? { text: "#64748B", bg: "#F1F5F9" };
                const emoji = sportEmojis[s.sport] ?? "🏅";
                return (
                  <View key={s.sport} style={[styles.skillRow, i < sports.length - 1 && { borderBottomWidth: 1, borderBottomColor: t.rowBorder }]}>
                    <View style={styles.skillLeft}>
                      <View style={[styles.sportDot, { backgroundColor: sc.bg }]}>
                        <Text style={{ fontSize: 17 }}>{emoji}</Text>
                      </View>
                      <Text style={[styles.sportName, { color: t.title }]}>{s.sport}</Text>
                    </View>
                    <View style={[styles.skillBadge, { backgroundColor: skc.bg }]}>
                      <Text style={[styles.skillBadgeText, { color: skc.text }]}>{s.skill_level}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Text style={[styles.sectionTitle, { color: t.title }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={styles.themeRow}>
            <View style={styles.themeLeft}>
              <Text style={styles.themeIcon}>{isDark ? "🌙" : "☀️"}</Text>
              <View>
                <Text style={[styles.themeLabel, { color: t.title }]}>
                  {isDark ? "Dark Mode" : "Light Mode"}
                </Text>
                <Text style={[styles.themeSub, { color: t.subtitle }]}>
                  {isDark ? "Easy on the eyes at night" : "Clean and bright"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: "#E2E8F0", true: "#2563EB" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Pressable style={[styles.signOutBtn, { borderColor: "#FEE2E2", backgroundColor: t.card }]} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingHorizontal: 16, paddingTop: 8 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  screenTitle: { fontSize: 26, fontWeight: "700" },
  editBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  editBtnText: { fontSize: 13, fontWeight: "600" },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: "#2563EB" },
  saveBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "700", marginBottom: 4 },
  subInfo: { fontSize: 13, textAlign: "center" },
  nameInput: { width: "100%", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, fontWeight: "700", textAlign: "center" },
  subInput: { width: "100%", borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, fontSize: 13, textAlign: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 18, marginBottom: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: "700" },
  card: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  skillRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 13 },
  skillLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sportDot: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sportName: { fontSize: 14, fontWeight: "600" },
  skillBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  skillBadgeText: { fontSize: 11, fontWeight: "700" },
  themeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14 },
  themeLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  themeIcon: { fontSize: 24 },
  themeLabel: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  themeSub: { fontSize: 12 },
  signOutBtn: { marginTop: 22, height: 50, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  signOutText: { color: "#DC2626", fontSize: 15, fontWeight: "700" },
});
