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
import Animated, { FadeInDown } from "react-native-reanimated";
import api from "../../services/api";
import { auth } from "../../config/firebase";
import { useThemeContext } from "../../context/ThemeContext";
import { COLORS, RADII, SHADOWS, SPORT_COLORS, SPORT_EMOJIS } from "@/theme/tokens";
import { ChalkPitchLines } from "@/components/ui";

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

type MyGame = {
  id: number;
  organizer_id: number;
  scheduled_at: string;
  status: string;
};

const SKILL_BARS: Record<SkillLevel, number> = { Beginner: 1, Intermediate: 2, Advanced: 3 };

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
  const [myGames, setMyGames] = useState<MyGame[]>([]);

  useEffect(() => {
    api.get("/users/me")
      .then((res) => {
        const data = res.data;
        setProfile(data.user);
        setSports(data.user.sports || data.sports || []);
        setName(data.user.full_name || "");
        setCity(data.user.city || "");
        setCollege(data.user.college || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get("/users/me/games")
      .then((res) => setMyGames(res.data.games || []))
      .catch(() => {});
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
    const payload = {
      full_name: name.trim(),
      city: city.trim(),
      college: college.trim() || undefined,
    };
    try {
      let res;
      try {
        res = await api.put("/users/me", payload);
      } catch (err: any) {
        // No profile row yet (e.g. sign-up couldn't reach the server) -> create it
        if (err?.response?.status !== 404) throw err;
        res = await api.post("/users/me", payload);
      }
      setProfile(res.data.user);
      setEditing(false);
      Alert.alert("Saved", "Profile updated.");
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || "Could not update profile.";
      Alert.alert("Error", msg);
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
        <ActivityIndicator color={t.title} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Player";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const now = Date.now();
  const hosted = profile ? myGames.filter((g) => g.organizer_id === profile.id).length : 0;
  const upcoming = myGames.filter((g) => new Date(g.scheduled_at).getTime() > now && g.status !== "CANCELLED").length;
  const memberNo = profile?.id ? `#${String(profile.id).padStart(4, "0")}` : "#----";

  const stats = [
    { value: myGames.length, label: "Games", color: COLORS.butter, rotate: "-2deg" },
    { value: hosted, label: "Hosted", color: SPORT_COLORS.Badminton, rotate: "1.5deg" },
    { value: upcoming, label: "Upcoming", color: SPORT_COLORS.Cricket, rotate: "-1deg" },
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
              <Text style={styles.editBtnText}>
                {saving ? "Saving..." : editing ? "✓ Save" : "✎ Edit"}
              </Text>
            </Pressable>
          </View>

          {/* Player card */}
          <Animated.View entering={FadeInDown.duration(450)} style={styles.playerCard}>
            <View style={styles.cardStrip}>
              <Text style={styles.cardStripText}>PLAYMATE · PLAYER CARD</Text>
              <Text style={styles.cardStripText}>{memberNo}</Text>
            </View>

            <View style={styles.cardBody}>
              <Pressable onPress={pickAvatar} style={styles.avatarBox}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>{initials}</Text>
                )}
                <View style={styles.cameraBadge}>
                  <Text style={{ fontSize: 11 }}>📷</Text>
                </View>
              </Pressable>

              <View style={styles.cardInfo}>
                <Text style={styles.heroName} numberOfLines={2}>{displayName}</Text>
                {!!profile?.college && <Text style={styles.heroLine} numberOfLines={1}>🎓 {profile.college}</Text>}
                {!!profile?.city && <Text style={styles.heroLine} numberOfLines={1}>📍 {profile.city}</Text>}
                {!profile?.college && !profile?.city && (
                  <Text style={styles.heroLine} numberOfLines={1}>{profile?.email || "Tap edit to add your details"}</Text>
                )}
              </View>
            </View>

            <View style={styles.cardFooter}>
              {sports.length > 0 ? (
                sports.map((s) => (
                  <View key={s.sport} style={[styles.miniBadge, { backgroundColor: SPORT_COLORS[s.sport] ?? COLORS.track }]}>
                    <Text style={styles.miniBadgeText}>{SPORT_EMOJIS[s.sport] ?? "⚽"}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noSportsText}>No sports picked yet</Text>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Edit fields */}
        {editing && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={[styles.editCard, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <Text style={[styles.fieldLabel, { color: t.subtitle }]}>Full name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={t.placeholder}
            />
            <Text style={[styles.fieldLabel, { color: t.subtitle }]}>College</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
              value={college}
              onChangeText={setCollege}
              placeholder="Your college"
              placeholderTextColor={t.placeholder}
            />
            <Text style={[styles.fieldLabel, { color: t.subtitle }]}>City</Text>
            <TextInput
              style={[styles.input, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
              value={city}
              onChangeText={setCity}
              placeholder="Your city"
              placeholderTextColor={t.placeholder}
            />
            <Pressable onPress={() => setEditing(false)} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: t.subtitle }]}>Cancel</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Stats board */}
        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.statTile, { backgroundColor: stat.color, transform: [{ rotate: stat.rotate }] }]}>
              <Text style={styles.statNumber}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Sports & skills */}
        <SectionTitle title="My Sports" />
        {sports.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(180).duration(450)} style={styles.sportGrid}>
            {sports.map((s, i) => (
              <View
                key={s.sport}
                style={[
                  styles.sportCard,
                  { backgroundColor: SPORT_COLORS[s.sport] ?? COLORS.track },
                  { transform: [{ rotate: i % 2 === 0 ? "-1.5deg" : "1.5deg" }] },
                ]}
              >
                <Text style={styles.sportEmoji}>{SPORT_EMOJIS[s.sport] ?? "⚽"}</Text>
                <Text style={styles.sportName}>{s.sport}</Text>
                <View style={styles.skillRow}>
                  <View style={styles.meter}>
                    {[1, 2, 3].map((bar) => (
                      <View
                        key={bar}
                        style={[
                          styles.meterBar,
                          { height: bar * 6 + 4 },
                          bar <= SKILL_BARS[s.skill_level] && styles.meterBarOn,
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.skillText}>{s.skill_level}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={styles.emptyEmoji}>🏅</Text>
            <Text style={[styles.emptyText, { color: t.subtitle }]}>
              You haven&apos;t picked any sports yet.
            </Text>
          </View>
        )}

        {/* Settings */}
        <SectionTitle title="Settings" />
        <View style={[styles.settingsCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: isDark ? COLORS.ink : COLORS.butter }]}>
              <Text style={{ fontSize: 18 }}>{isDark ? "🌙" : "☀️"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: t.title }]}>{isDark ? "Dark mode" : "Light mode"}</Text>
              <Text style={[styles.settingSub, { color: t.subtitle }]}>
                {isDark ? "Easy on the eyes at night" : "Clean and bright"}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: COLORS.butter, true: COLORS.rust }}
              thumbColor={COLORS.card}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: t.rowBorder }]} />

          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: SPORT_COLORS.Tennis }]}>
              <Text style={{ fontSize: 18 }}>✉️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: t.title }]}>Email</Text>
              <Text style={[styles.settingSub, { color: t.subtitle }]} numberOfLines={1}>
                {profile?.email || auth.currentUser?.email || "—"}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && { transform: [{ translateY: 2 }], opacity: 0.9 }]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>⏻  Sign Out</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  const { theme: t } = useThemeContext();
  return (
    <View style={styles.sectionRow}>
      <View style={styles.sectionBar} />
      <Text style={[styles.sectionTitle, { color: t.title }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingBottom: 8 },
  header: {
    backgroundColor: COLORS.salmon,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 28,
    overflow: "hidden",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.ink,
    textTransform: "uppercase",
    letterSpacing: -0.3,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADII.chip,
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.card,
    ...SHADOWS.hard,
  },
  saveBtnActive: { backgroundColor: COLORS.butter },
  editBtnText: { fontSize: 13, fontWeight: "800", color: COLORS.ink, textTransform: "uppercase" },

  playerCard: {
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 18,
    overflow: "hidden",
    transform: [{ rotate: "-1.5deg" }],
    ...SHADOWS.hard,
  },
  cardStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: COLORS.ink,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  cardStripText: { color: COLORS.butter, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
  cardBody: { flexDirection: "row", alignItems: "center", padding: 14, gap: 14 },
  avatarBox: {
    width: 84,
    height: 84,
    borderRadius: 16,
    backgroundColor: COLORS.butter,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "3deg" }],
  },
  avatarImage: { width: 80, height: 80, borderRadius: 14 },
  avatarText: { color: COLORS.ink, fontSize: 30, fontWeight: "800", textTransform: "uppercase" },
  cameraBadge: {
    position: "absolute",
    bottom: -8,
    right: -8,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.ink,
    padding: 3,
  },
  cardInfo: { flex: 1, gap: 3 },
  heroName: { fontSize: 20, fontWeight: "800", color: COLORS.ink, textTransform: "uppercase", letterSpacing: -0.3, marginBottom: 2 },
  heroLine: { fontSize: 12, color: COLORS.muted, fontWeight: "600" },
  cardFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    borderTopWidth: 2,
    borderTopColor: COLORS.track,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  miniBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  miniBadgeText: { fontSize: 15 },
  noSportsText: { fontSize: 12, color: COLORS.muted, fontWeight: "600" },

  editCard: {
    marginHorizontal: 16,
    marginTop: 18,
    borderWidth: 2,
    borderRadius: RADII.card,
    padding: 14,
    ...SHADOWS.hard,
  },
  fieldLabel: { fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, marginTop: 6 },
  input: { borderWidth: 2, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, marginBottom: 6 },
  cancelBtn: { alignSelf: "center", paddingVertical: 8, marginTop: 4 },
  cancelText: { fontSize: 13, fontWeight: "700" },

  statsRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 22, gap: 10 },
  statTile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.ink,
    paddingVertical: 12,
    paddingHorizontal: 10,
    ...SHADOWS.hard,
  },
  statNumber: { fontSize: 28, fontWeight: "800", color: COLORS.ink, letterSpacing: -1 },
  statLabel: { fontSize: 11, fontWeight: "700", color: COLORS.ink, opacity: 0.75, textTransform: "uppercase" },

  sectionRow: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, marginTop: 26, marginBottom: 12 },
  sectionBar: { width: 6, height: 20, borderRadius: 3, backgroundColor: COLORS.rust },
  sectionTitle: { fontSize: 16, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.3 },

  sportGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 16 },
  sportCard: {
    width: "47%",
    flexGrow: 1,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: RADII.card,
    padding: 12,
    ...SHADOWS.hard,
  },
  sportEmoji: { fontSize: 28 },
  sportName: { fontSize: 14, fontWeight: "800", color: COLORS.ink, textTransform: "uppercase", marginTop: 6 },
  skillRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 8 },
  meter: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  meterBar: { width: 7, borderRadius: 2, borderWidth: 1.5, borderColor: COLORS.ink, backgroundColor: "transparent" },
  meterBarOn: { backgroundColor: COLORS.ink },
  skillText: { fontSize: 11, fontWeight: "800", color: COLORS.ink, textTransform: "uppercase" },

  emptyCard: {
    marginHorizontal: 16,
    borderWidth: 2,
    borderRadius: RADII.card,
    padding: 18,
    alignItems: "center",
    gap: 6,
  },
  emptyEmoji: { fontSize: 32 },
  emptyText: { fontSize: 13, textAlign: "center" },

  settingsCard: {
    marginHorizontal: 16,
    borderWidth: 2,
    borderRadius: RADII.card,
    overflow: "hidden",
    ...SHADOWS.hard,
  },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14 },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { fontSize: 14, fontWeight: "800" },
  settingSub: { fontSize: 12, marginTop: 1 },
  divider: { height: 2, marginHorizontal: 14 },

  signOutBtn: {
    marginTop: 24,
    height: 54,
    borderRadius: RADII.button,
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.rust,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    ...SHADOWS.hard,
  },
  signOutText: { color: COLORS.card, fontSize: 15, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
});
