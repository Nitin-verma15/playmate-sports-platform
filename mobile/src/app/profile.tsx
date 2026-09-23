import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

type SportSkill = {
  sport: string;
  emoji: string;
  skill: SkillLevel;
  color: string;
  bg: string;
};

type RecentGame = {
  id: string;
  title: string;
  venue: string;
  date: string;
  emoji: string;
  sportBg: string;
};

// dummy user data - will be replaced with real auth user
const user = {
  name: "Arjun Mehta",
  college: "IIT Bangalore",
  city: "Koramangala, Bangalore",
  gamesPlayed: 24,
  gamesCreated: 6,
  gamesJoined: 18,
  initials: "AM",
  avatarColor: "#2563EB",
};

const sportSkills: SportSkill[] = [
  { sport: "Football",   emoji: "⚽", skill: "Intermediate", color: "#2563EB", bg: "#EAF1FF" },
  { sport: "Basketball", emoji: "🏀", skill: "Beginner",     color: "#D97706", bg: "#FEF3C7" },
  { sport: "Badminton",  emoji: "🏸", skill: "Advanced",     color: "#7C3AED", bg: "#F3E8FF" },
];

const recentGames: RecentGame[] = [
  { id: "1", title: "Sunday Kickabout",      venue: "Central Park Ground A", date: "Sun, 14 Sep", emoji: "⚽", sportBg: "#EAF1FF" },
  { id: "2", title: "3v3 Street Hoops",      venue: "Campus Court B",        date: "Sat, 13 Sep", emoji: "🏀", sportBg: "#FEF3C7" },
  { id: "3", title: "Morning Cricket Session", venue: "University Oval",      date: "Mon, 15 Sep", emoji: "🏏", sportBg: "#E8F5E9" },
];

const skillColors: Record<SkillLevel, { text: string; bg: string }> = {
  Beginner:     { text: "#16A34A", bg: "#E8F5E9" },
  Intermediate: { text: "#D97706", bg: "#FEF3C7" },
  Advanced:     { text: "#DC2626", bg: "#FEE2E2" },
};

export default function ProfileScreen() {
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(user.name);
  const [city, setCity]       = useState(user.city);
  const [college, setCollege] = useState(user.college);

  function handleSave() {
    setEditing(false);
    Alert.alert("Saved", "Profile updated.");
  }

  function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => {} },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>Profile</Text>
          <Pressable
            style={editing ? styles.saveBtn : styles.editBtn}
            onPress={editing ? handleSave : () => setEditing(true)}
          >
            <Text style={editing ? styles.saveBtnText : styles.editBtnText}>
              {editing ? "Save" : "Edit"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}>
            <Text style={styles.avatarText}>{user.initials}</Text>
            {editing && (
              <View style={styles.editBadge}>
                <Text style={{ fontSize: 12 }}>✏️</Text>
              </View>
            )}
          </View>

          {editing ? (
            <>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={[styles.subInput, { marginTop: 6 }]}
                value={college}
                onChangeText={setCollege}
                placeholder="College"
                placeholderTextColor="#94A3B8"
              />
              <TextInput
                style={[styles.subInput, { marginTop: 6 }]}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor="#94A3B8"
              />
            </>
          ) : (
            <>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.subInfo}>{college}  •  {city}</Text>
            </>
          )}
        </View>

        <View style={styles.statsRow}>
          <StatBox value={user.gamesPlayed}  label="Games Played" />
          <View style={styles.divider} />
          <StatBox value={user.gamesCreated} label="Created" />
          <View style={styles.divider} />
          <StatBox value={user.gamesJoined}  label="Joined" />
        </View>

        <Text style={styles.sectionTitle}>Preferred Sports</Text>
        <View style={styles.chipsRow}>
          {sportSkills.map((s) => (
            <View key={s.sport} style={[styles.chip, { backgroundColor: s.bg }]}>
              <Text style={[styles.chipText, { color: s.color }]}>{s.emoji} {s.sport}</Text>
            </View>
          ))}
          {editing && (
            <Pressable
              style={styles.addChip}
              onPress={() => Alert.alert("Add Sport", "Coming soon.")}
            >
              <Text style={styles.addChipText}>+ Add</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Skill Levels</Text>
        <View style={styles.card}>
          {sportSkills.map((s, i) => {
            const sc = skillColors[s.skill];
            return (
              <View
                key={s.sport}
                style={[styles.skillRow, i < sportSkills.length - 1 && styles.rowBorder]}
              >
                <View style={styles.skillLeft}>
                  <View style={[styles.sportDot, { backgroundColor: s.bg }]}>
                    <Text style={{ fontSize: 17 }}>{s.emoji}</Text>
                  </View>
                  <Text style={styles.sportName}>{s.sport}</Text>
                </View>
                <View style={[styles.skillBadge, { backgroundColor: sc.bg }]}>
                  <Text style={[styles.skillBadgeText, { color: sc.text }]}>{s.skill}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.card}>
          {recentGames.map((g, i) => (
            <View
              key={g.id}
              style={[styles.activityRow, i < recentGames.length - 1 && styles.rowBorder]}
            >
              <View style={[styles.activityIcon, { backgroundColor: g.sportBg }]}>
                <Text style={{ fontSize: 18 }}>{g.emoji}</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>{g.title}</Text>
                <Text style={styles.activitySub}>{g.date}  •  {g.venue}</Text>
              </View>
              <View style={styles.playedBadge}>
                <Text style={styles.playedText}>PLAYED</Text>
              </View>
            </View>
          ))}
        </View>

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
  editBtn: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0",
  },
  editBtnText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: "#2563EB" },
  saveBtnText: { fontSize: 13, fontWeight: "600", color: "#fff" },

  avatarSection: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "700" },
  editBadge: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: "#fff", borderRadius: 12, width: 24, height: 24,
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E2E8F0",
  },
  name: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 4 },
  subInfo: { fontSize: 13, color: "#64748B", textAlign: "center" },
  nameInput: {
    width: "100%", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 16, fontWeight: "700", color: "#111827", textAlign: "center",
  },
  subInput: {
    width: "100%", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0",
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9,
    fontSize: 13, color: "#374151", textAlign: "center",
  },

  statsRow: {
    flexDirection: "row", backgroundColor: "#fff", borderRadius: 18,
    borderWidth: 1, borderColor: "#E2E8F0", paddingVertical: 16, marginBottom: 8,
  },
  statBox: { flex: 1, alignItems: "center" },
  divider: { width: 1, backgroundColor: "#E2E8F0" },
  statValue: { fontSize: 22, fontWeight: "700", color: "#111827", marginBottom: 3 },
  statLabel: { fontSize: 11, color: "#64748B" },

  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginTop: 18, marginBottom: 10 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: "700" },
  addChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#fff", borderWidth: 1.5, borderColor: "#E2E8F0",
  },
  addChipText: { fontSize: 13, fontWeight: "600", color: "#64748B" },

  card: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", overflow: "hidden" },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },

  skillRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 13 },
  skillLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sportDot: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  sportName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  skillBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  skillBadgeText: { fontSize: 11, fontWeight: "700" },

  activityRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  activityIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 2 },
  activitySub: { fontSize: 11, color: "#94A3B8" },
  playedBadge: { backgroundColor: "#F0FDF4", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#BBF7D0" },
  playedText: { fontSize: 9, fontWeight: "700", color: "#16A34A", letterSpacing: 0.5 },

  signOutBtn: {
    marginTop: 22, height: 50, borderRadius: 14, backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#FEE2E2", alignItems: "center", justifyContent: "center",
  },
  signOutText: { color: "#DC2626", fontSize: 15, fontWeight: "700" },
});
