import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { signOut } from "firebase/auth";
import { router } from "expo-router";
import api from "../../services/api";
import { auth } from "../../config/firebase";
import { useThemeContext } from "../../context/ThemeContext";
import { COLORS, RADII, SHADOWS, SPORT_COLORS, SPORT_EMOJIS } from "@/theme/tokens";
import { ChalkPitchLines, SportTag } from "@/components/ui";

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
        <ActivityIndicator color={COLORS.ink} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Player";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const stats = [
    { value: sports.length, label: "Sports" },
    { value: sports.filter((s) => s.skill_level === "Advanced").length, label: "Advanced" },
    { value: sports.filter((s) => s.skill_level === "Intermediate").length, label: "Intermediate" },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Salmon header */}
        <View style={styles.header}>
          <ChalkPitchLines />
          <View style={styles.topBar}>
            <Text style={styles.screenTitle}>Profile</Text>
            <Pressable
              style={({ pressed }) => [
                styles.editBtn,
                editing && styles.saveBtnActive,
                pressed && { opacity: 0.85 },
              ]}
              onPress={editing ? handleSave : () => setEditing(true)}
              disabled={saving}
            >
              <Text style={[styles.editBtnText, editing && styles.editBtnTextActive]}>
                {saving ? "Saving..." : editing ? "Save" : "Edit"}
              </Text>
            </Pressable>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
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

            {!editing && (
              <>
                <Text style={[styles.heroName, { color: COLORS.ink }]}>{displayName}</Text>
                <Text style={styles.heroSubInfo}>
                  {[profile?.college, profile?.city].filter(Boolean).join("  •  ") || profile?.email}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Stat tiles */}
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.statTile, { backgroundColor: t.card, borderColor: t.border }]}>
              <Text style={styles.statNumber}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: t.subtitle }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Edit fields */}
        {editing && (
          <View style={styles.editFields}>
            <TextInput
              style={[styles.nameInput, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor={t.placeholder}
            />
            <TextInput
              style={[styles.subInput, { marginTop: 8, backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
              value={college}
              onChangeText={setCollege}
              placeholder="College"
              placeholderTextColor={t.placeholder}
            />
            <TextInput
              style={[styles.subInput, { marginTop: 8, backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor={t.placeholder}
            />
          </View>
        )}

        {sports.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: t.title }]}>Preferred Sports</Text>
            <View style={styles.chipsRow}>
              {sports.map((s) => (
                <SportTag key={s.sport} sport={s.sport} emoji={SPORT_EMOJIS[s.sport] ?? "⚽"} style={styles.chip} />
              ))}
            </View>

            <Text style={[styles.sectionTitle, { color: t.title }]}>Skill Levels</Text>
            <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
              {sports.map((s, i) => (
                <View
                  key={s.sport}
                  style={[styles.skillRow, i < sports.length - 1 && { borderBottomWidth: 2, borderBottomColor: t.rowBorder }]}
                >
                  <View style={styles.skillLeft}>
                    <View style={[styles.sportDot, { backgroundColor: SPORT_COLORS[s.sport] ?? COLORS.track, borderColor: COLORS.ink }]}>
                      <Text style={{ fontSize: 17 }}>{SPORT_EMOJIS[s.sport] ?? "⚽"}</Text>
                    </View>
                    <Text style={[styles.sportName, { color: t.title }]}>{s.sport}</Text>
                  </View>
                  <View style={[styles.skillBadge, { borderColor: COLORS.ink }]}>
                    <Text style={[styles.skillBadgeText, { color: t.title }]}>{s.skill_level}</Text>
                  </View>
                </View>
              ))}
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
              trackColor={{ false: COLORS.butter, true: COLORS.ink }}
              thumbColor={COLORS.card}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.85 }]}
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
  header: {
    backgroundColor: COLORS.salmon,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 32,
    overflow: "hidden",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.ink,
    textTransform: "uppercase",
    letterSpacing: -0.3,
  },
  editBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: RADII.chip,
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: "transparent",
  },
  saveBtnActive: { backgroundColor: COLORS.butter },
  editBtnText: { fontSize: 13, fontWeight: "800", color: COLORS.ink, textTransform: "uppercase" },
  editBtnTextActive: { color: COLORS.ink },
  avatarSection: { alignItems: "center" },
  avatarPressable: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.butter,
    borderWidth: 3,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "visible",
    ...SHADOWS.hard,
  },
  avatarImage: { width: 94, height: 94, borderRadius: 47 },
  avatarText: {
    color: COLORS.ink,
    fontSize: 30,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  cameraBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.ink,
    padding: 4,
  },
  heroName: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "center",
    textTransform: "uppercase",
  },
  heroSubInfo: {
    fontSize: 13,
    color: COLORS.ink,
    opacity: 0.75,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -16,
    gap: 10,
  },
  statTile: {
    flex: 1,
    borderRadius: RADII.card,
    borderWidth: 2,
    paddingVertical: 14,
    alignItems: "center",
    ...SHADOWS.hard,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.rust,
    marginBottom: 2,
  },
  statLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  editFields: { paddingHorizontal: 16, paddingTop: 16 },
  nameInput: {
    width: "100%",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  subInput: {
    width: "100%",
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 13,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 22,
    marginBottom: 10,
    marginHorizontal: 16,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
  },
  chip: { marginBottom: 2 },
  card: {
    borderRadius: RADII.card,
    borderWidth: 2,
    overflow: "hidden",
    marginHorizontal: 16,
    ...SHADOWS.hard,
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  skillLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sportDot: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  sportName: { fontSize: 14, fontWeight: "700" },
  skillBadge: { borderWidth: 2, borderRadius: RADII.chip, paddingHorizontal: 10, paddingVertical: 5 },
  skillBadgeText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  themeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  themeLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  themeIcon: { fontSize: 28 },
  themeLabel: { fontSize: 14, fontWeight: "800", marginBottom: 2 },
  themeSub: { fontSize: 12 },
  signOutBtn: {
    marginTop: 22,
    height: 56,
    borderRadius: RADII.button,
    borderWidth: 2,
    borderColor: COLORS.rust,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
  },
  signOutText: {
    color: COLORS.rust,
    fontSize: 15,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
