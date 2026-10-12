import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import api from "../../services/api";
import { auth } from "../../config/firebase";

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
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator color="#2563EB" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Player";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>Profile</Text>
          <Pressable
            style={editing ? styles.saveBtn : styles.editBtn}
            onPress={editing ? handleSave : () => setEditing(true)}
            disabled={saving}
          >
            <Text style={editing ? styles.saveBtnText : styles.editBtnText}>
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
              <TextInput style={styles.nameInput} value={name} onChangeText={setName} placeholder="Full Name" placeholderTextColor="#94A3B8" />
              <TextInput style={[styles.subInput, { marginTop: 6 }]} value={college} onChangeText={setCollege} placeholder="College" placeholderTextColor="#94A3B8" />
              <TextInput style={[styles.subInput, { marginTop: 6 }]} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#94A3B8" />
            </>
          ) : (
            <>
              <Text style={styles.name}>{displayName}</Text>
              <Text style={styles.subInfo}>
                {[profile?.college, profile?.city].filter(Boolean).join("  •  ") || profile?.email}
              </Text>
            </>
          )}
        </View>

        {sports.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Preferred Sports</Text>
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

            <Text style={styles.sectionTitle}>Skill Levels</Text>
            <View style={styles.card}>
              {sports.map((s, i) => {
                const sc = sportColors[s.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
                const skc = skillColors[s.skill_level] ?? { text: "#64748B", bg: "#F1F5F9" };
                const emoji = sportEmojis[s.sport] ?? "🏅";
                return (
                  <View key={s.sport} style={[styles.skillRow, i < sports.length - 1 && styles.rowBorder]}>
                    <View style={styles.skillLeft}>
                      <View style={[styles.sportDot, { backgroundColor: sc.bg }]}>
                        <Text style={{ fontSize: 17 }}>{emoji}</Text>
                      </View>
                      <Text style={styles.sportName}>{s.sport}</Text>
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

        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  container: { paddingHorizontal: 16, paddingTop: 8 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  screenTitle: { fontSize: 26, fontWeight: "700", color: "#111827" },
  editBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0" },
  editBtnText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: "#2563EB" },
  saveBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },
  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  name: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 4 },
  subInfo: { fontSize: 13, color: "#64748B", textAlign: "center" },
  nameInput: { width: "100%", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, fontWeight: "700", color: "#111827", textAlign: "center" },
  subInput: { width: "100%", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, fontSize: 13, color: "#374151", textAlign: "center" },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 3 },
  statLabel: { fontSize: 11, color: "#64748B" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginTop: 18, marginBottom: 10 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: "700" },
  card: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", overflow: "hidden" },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  skillRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 13 },
  skillLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sportDot: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sportName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  skillBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  skillBadgeText: { fontSize: 11, fontWeight: "700" },
  signOutBtn: { marginTop: 22, height: 50, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: "#FEE2E2", alignItems: "center", justifyContent: "center" },
  signOutText: { color: "#DC2626", fontSize: 15, fontWeight: "700" },
});
