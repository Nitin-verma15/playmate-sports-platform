import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Sport = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bg: string;
};

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

const sports: Sport[] = [
  { id: "football",   name: "Football",   emoji: "⚽", color: "#2563EB", bg: "#EAF1FF" },
  { id: "cricket",    name: "Cricket",    emoji: "🏏", color: "#16A34A", bg: "#E8F5E9" },
  { id: "basketball", name: "Basketball", emoji: "🏀", color: "#D97706", bg: "#FEF3C7" },
  { id: "badminton",  name: "Badminton",  emoji: "🏸", color: "#7C3AED", bg: "#F3E8FF" },
  { id: "tennis",     name: "Tennis",     emoji: "🎾", color: "#EA580C", bg: "#FEF0E7" },
];

const skillLevels: SkillLevel[] = ["Beginner", "Intermediate", "Advanced"];

const skillColors: Record<SkillLevel, { text: string; bg: string }> = {
  Beginner:     { text: "#16A34A", bg: "#E8F5E9" },
  Intermediate: { text: "#D97706", bg: "#FEF3C7" },
  Advanced:     { text: "#DC2626", bg: "#FEE2E2" },
};

const maxPlayersOptions = [4, 6, 8, 10, 12, 16, 20, 22];

// dummy venues for now, will come from Google Places API later
const venueSuggestions = [
  "Central Park Ground A",
  "Campus Court B",
  "University Oval",
  "Sports Complex Court 2",
  "Community Sports Ground",
  "IIT Bangalore Ground",
];

export default function CreateGameScreen() {
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [gameTitle, setGameTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number>(10);
  const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);
  const [description, setDescription] = useState("");

  const sport = sports.find((s) => s.id === selectedSport);

  const isFormValid =
    selectedSport !== null &&
    gameTitle.trim().length > 0 &&
    venue.trim().length > 0 &&
    date.trim().length > 0 &&
    time.trim().length > 0 &&
    skillLevel !== null;

  function handleCreate() {
    if (!isFormValid) return;
    // will call POST /api/games once backend is ready
    Alert.alert(
      "Game Created! 🎉",
      `${sport?.emoji} ${gameTitle}\n📍 ${venue}\n📅 ${date} at ${time}\n👥 Max ${maxPlayers} players • ${skillLevel}`,
      [{ text: "OK" }]
    );
  }

  function handleVenuePick(suggestion: string) {
    setVenue(suggestion);
    setShowSuggestions(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create a Game</Text>
          <Text style={styles.subtitle}>Organize a game for nearby players</Text>
        </View>

        <Label text="Sport" required />
        <View style={styles.sportsRow}>
          {sports.map((s) => {
            const active = selectedSport === s.id;
            return (
              <Pressable
                key={s.id}
                style={[
                  styles.sportChip,
                  active
                    ? { backgroundColor: s.color, borderColor: s.color }
                    : { backgroundColor: s.bg, borderColor: s.bg },
                ]}
                onPress={() => setSelectedSport(s.id)}
              >
                <Text style={styles.sportChipEmoji}>{s.emoji}</Text>
                <Text style={[styles.sportChipText, { color: active ? "#fff" : s.color }]}>
                  {s.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Label text="Game Title" required />
        <TextInput
          style={styles.input}
          placeholder="e.g. Sunday Kickabout"
          placeholderTextColor="#94A3B8"
          value={gameTitle}
          onChangeText={setGameTitle}
          maxLength={60}
        />

        <Label text="Venue / Location" required />
        <View>
          <View style={styles.venueRow}>
            <Text style={styles.venuePin}>📍</Text>
            <TextInput
              style={styles.venueInput}
              placeholder="Search or tap on map..."
              placeholderTextColor="#94A3B8"
              value={venue}
              onChangeText={(v) => {
                setVenue(v);
                setShowSuggestions(v.length > 0);
              }}
              onFocus={() => setShowSuggestions(venue.length > 0)}
            />
          </View>

          {showSuggestions && (
            <View style={styles.suggestionsBox}>
              {venueSuggestions
                .filter((s) => s.toLowerCase().includes(venue.toLowerCase()))
                .map((s) => (
                  <Pressable
                    key={s}
                    style={styles.suggestionItem}
                    onPress={() => handleVenuePick(s)}
                  >
                    <Text style={styles.suggestionPin}>📍</Text>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </Pressable>
                ))}
            </View>
          )}
        </View>

        {/* map will be added in W7 with Google Maps */}
        <Pressable
          style={styles.mapBox}
          onPress={() => Alert.alert("Map", "Google Maps coming in W7.")}
        >
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapText}>Tap to pick location</Text>
        </Pressable>

        <View style={styles.row}>
          <View style={styles.half}>
            <Label text="Date" required />
            <TextInput
              style={styles.input}
              placeholder="dd/mm/yyyy"
              placeholderTextColor="#94A3B8"
              value={date}
              onChangeText={setDate}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          <View style={styles.half}>
            <Label text="Time" required />
            <TextInput
              style={styles.input}
              placeholder="e.g. 4:00 PM"
              placeholderTextColor="#94A3B8"
              value={time}
              onChangeText={setTime}
              maxLength={8}
            />
          </View>
        </View>

        <Label text="Max Players" required />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.maxPlayersRow}
        >
          {maxPlayersOptions.map((n) => {
            const active = maxPlayers === n;
            return (
              <Pressable
                key={n}
                style={[styles.playerChip, active && styles.playerChipActive]}
                onPress={() => setMaxPlayers(n)}
              >
                <Text style={[styles.playerChipText, active && styles.playerChipTextActive]}>
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Label text="Skill Level" required />
        <View style={styles.skillList}>
          {skillLevels.map((level) => {
            const active = skillLevel === level;
            const colors = skillColors[level];
            return (
              <Pressable
                key={level}
                style={[
                  styles.skillCard,
                  active
                    ? { backgroundColor: colors.bg, borderColor: colors.text }
                    : styles.skillCardDefault,
                ]}
                onPress={() => setSkillLevel(level)}
              >
                <View style={[styles.radio, active && { borderColor: colors.text }]}>
                  {active && <View style={[styles.radioDot, { backgroundColor: colors.text }]} />}
                </View>
                <View>
                  <Text style={[styles.skillLabel, { color: active ? colors.text : "#374151" }]}>
                    {level}
                  </Text>
                  <Text style={styles.skillDesc}>
                    {level === "Beginner" && "Just starting out, learning the rules."}
                    {level === "Intermediate" && "Know the basics, play regularly."}
                    {level === "Advanced" && "Competitive experience, play at a high level."}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Label text="Description" />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Any extra details about the game... (optional)"
          placeholderTextColor="#94A3B8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          maxLength={200}
          textAlignVertical="top"
        />

        {isFormValid && (
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.previewHeader}>
              <View style={[styles.previewBadge, { backgroundColor: sport?.bg }]}>
                <Text style={[styles.previewBadgeText, { color: sport?.color }]}>
                  {sport?.emoji} {sport?.name}
                </Text>
              </View>
              <Text style={styles.previewEmoji}>{sport?.emoji}</Text>
            </View>
            <Text style={styles.previewTitle}>{gameTitle}</Text>
            <Text style={styles.previewInfo}>📍 {venue}</Text>
            <Text style={styles.previewInfo}>📅 {date}  •  🕐 {time}</Text>
            <View style={styles.previewFooter}>
              <View style={[styles.previewSkill, { backgroundColor: skillColors[skillLevel!].bg }]}>
                <Text style={[styles.previewSkillText, { color: skillColors[skillLevel!].text }]}>
                  {skillLevel}
                </Text>
              </View>
              <Text style={styles.previewPlayers}>0/{maxPlayers} players</Text>
            </View>
          </View>
        )}

        <Pressable
          style={[styles.createBtn, !isFormValid && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={!isFormValid}
        >
          <Text style={styles.createBtnText}>Create Game ⚡</Text>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {text}
      {required && <Text style={{ color: "#DC2626" }}> *</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  container: { paddingHorizontal: 16, paddingTop: 8 },

  header: { marginBottom: 22 },
  title: { fontSize: 26, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 4, fontSize: 13, color: "#64748B" },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 18,
  },

  sportsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sportChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 5,
  },
  sportChipEmoji: { fontSize: 14 },
  sportChipText: { fontSize: 13, fontWeight: "700" },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#111827",
  },
  textArea: { height: 88, paddingTop: 13 },

  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  venuePin: { fontSize: 16, marginRight: 8 },
  venueInput: { flex: 1, paddingVertical: 13, fontSize: 14, color: "#111827" },

  suggestionsBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    marginTop: 4,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 8,
  },
  suggestionPin: { fontSize: 14 },
  suggestionText: { fontSize: 13, color: "#334155" },

  mapBox: {
    marginTop: 8,
    height: 100,
    backgroundColor: "#E8F0DD",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D4E6C3",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  mapIcon: { fontSize: 28 },
  mapText: { fontSize: 13, color: "#4B7A3E", fontWeight: "600" },

  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },

  maxPlayersRow: { gap: 8, paddingBottom: 4 },
  playerChip: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  playerChipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  playerChipText: { fontSize: 14, fontWeight: "700", color: "#475569" },
  playerChipTextActive: { color: "#fff" },

  skillList: { gap: 10 },
  skillCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  skillCardDefault: { backgroundColor: "#fff", borderColor: "#E2E8F0" },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  skillLabel: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  skillDesc: { fontSize: 11, color: "#94A3B8" },

  preview: {
    marginTop: 22,
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  previewBadge: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  previewBadgeText: { fontSize: 11, fontWeight: "700" },
  previewEmoji: { fontSize: 24 },
  previewTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 7 },
  previewInfo: { fontSize: 12, color: "#64748B", marginBottom: 4 },
  previewFooter: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  previewSkill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  previewSkillText: { fontSize: 11, fontWeight: "700" },
  previewPlayers: { fontSize: 12, color: "#64748B", fontWeight: "600" },

  createBtn: {
    marginTop: 22,
    height: 54,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnDisabled: { backgroundColor: "#CBD5E1" },
  createBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
