import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
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
  Badminton:  { text: "#0369A1", bg: "#E0F2FE" },
  Tennis:     { text: "#EA580C", bg: "#FEF0E7" },
};

const skillColors: Record<SkillLevel, { text: string; bg: string }> = {
  Beginner:     { text: "#16A34A", bg: "#E8F5E9" },
  Intermediate: { text: "#D97706", bg: "#FEF3C7" },
  Advanced:     { text: "#DC2626", bg: "#FEE2E2" },
};

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
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
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

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

  async function pickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Gradient Hero */}
        <LinearGradient
          colors={["#1D4ED8", "#0EA5E9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          {/* Top bar inside gradient */}
          <View style={styles.topBar}>
            <Text style={styles.screenTitle}>Profile</Text>
            <Pressable
              style={[styles.editBtn, editing && styles.saveBtnGradient]}
              onPress={editing ? handleSave : () => setEditing(true)}
              disabled={saving}
            >
              <Text style={styles.editBtnText}>
                {saving ? "Saving..." : editing ? "Save" : "Edit"}
              </Text>
            </Pressable>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={["#0EA5E9", "#06B6D4"]}
              style={styles.avatarRing}
            >
              <Pressable onPress={pickAvatar} style={styles.avatarPressable}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
                <View style={styles.cameraBadge}>
                  <Text style={{ fontSize: 12 }}>📷</Text>
                </View>
              </Pressable>
            </LinearGradient>

            {!editing && (
              <>
                <Text style={styles.heroName}>{displayName}</Text>
                <Text style={styles.heroSubInfo}>
                  {[profile?.college, profile?.city].filter(Boolean).join("  •  ") || profile?.email}
                </Text>
              </>
            )}
          </View>
        </LinearGradient>

        {/* Stats floating card */}
        <View style={[styles.statsCard, { backgroundColor: t.card }, cardShadow]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.title }]}>{sports.length}</Text>
            <Text style={[styles.statLabel, { color: t.subtitle }]}>Sports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.title }]}>
              {sports.filter((s) => s.skill_level === "Advanced").length}
            </Text>
            <Text style={[styles.statLabel, { color: t.subtitle }]}>Advanced</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: t.title }]}>
              {sports.filter((s) => s.skill_level === "Intermediate").length}
            </Text>
            <Text style={[styles.statLabel, { color: t.subtitle }]}>Intermediate</Text>
          </View>
        </View>

        {/* Edit fields below gradient */}
        {editing && (
          <View style={styles.editFields}>
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
          </View>
        )}

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
            <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, cardShadow]}>
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
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }, cardShadow]}>
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

        <Pressable
          style={[styles.signOutBtn, { borderColor: "#FEE2E2", backgroundColor: t.card }]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingBottom: 8 },
  heroGradient: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
  },
  editBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  saveBtnGradient: {
    backgroundColor: "#1D4ED8",
    borderColor: "#fff",
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  avatarSection: {
    alignItems: "center",
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarPressable: {
    width: 94,
    height: 94,
    borderRadius: 47,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1D4ED8",
  },
  avatarImage: {
    width: 94,
    height: 94,
  },
  avatarText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    padding: 4,
  },
  heroName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textAlign: "center",
  },
  heroSubInfo: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
  },
  editFields: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  nameInput: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  subInput: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
    marginHorizontal: 16,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    marginHorizontal: 16,
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  skillLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sportDot: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sportName: {
    fontSize: 14,
    fontWeight: "600",
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  skillBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  themeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  themeIcon: {
    fontSize: 28,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  themeSub: {
    fontSize: 12,
  },
  signOutBtn: {
    marginTop: 22,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
  },
  signOutText: {
    color: "#DC2626",
    fontSize: 15,
    fontWeight: "700",
  },
});
