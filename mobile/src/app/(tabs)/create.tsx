import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import api from "../../services/api";
import { useThemeContext } from "../../context/ThemeContext";

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

type VenueSuggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function CreateGameScreen() {
  const { theme: t } = useThemeContext();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [gameTitle, setGameTitle] = useState("");
  const [venue, setVenue] = useState("");
  const [venueSuggestions, setVenueSuggestions] = useState<VenueSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [venueSearching, setVenueSearching] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxPlayers, setMaxPlayers] = useState<number>(10);
  const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [venueDebounce, setVenueDebounce] = useState<ReturnType<typeof setTimeout> | null>(null);

  const sport = sports.find((s) => s.id === selectedSport);

  const isFormValid =
    selectedSport !== null &&
    gameTitle.trim().length > 0 &&
    venue.trim().length > 0 &&
    date.trim().length > 0 &&
    time.trim().length > 0 &&
    skillLevel !== null;
  function convertTo24h(timeStr: string): string {
  const [time, modifier] = timeStr.trim().split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (modifier?.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${String(minutes || 0).padStart(2, "0")}`;
}

  async function handleCreate() {
  if (!isFormValid || !sport) return;
  setLoading(true);

  try {
    const [day, month, year] = date.split("/");
    const time24 = convertTo24h(time);
    const scheduledAt = new Date(`${year}-${month.padStart(2,"0")}-${day.padStart(2,"0")}T${time24}:00.000Z`).toISOString();

    await api.post("/games", {
      sport: sport.name,
      title: gameTitle.trim(),
      venue: venue.trim(),
      scheduled_at: scheduledAt,
      skill_level: skillLevel,
      max_players: maxPlayers,
      description: description.trim() || undefined,
    });

    Alert.alert("Game Created! 🎉", `${sport.emoji} ${gameTitle} has been created.`, [
      { text: "OK", onPress: () => router.replace("/discover") },
    ]);
  } catch (error: any) {
    const msg = error?.response?.data?.error?.message || "Could not create the game. Please try again.";
    Alert.alert("Error", msg);
  } finally {
    setLoading(false);
  }
}


  function handleVenuePick(suggestion: VenueSuggestion) {
    setVenue(suggestion.display_name.split(",").slice(0, 3).join(","));
    setShowSuggestions(false);
    setVenueSuggestions([]);
  }

  async function searchVenue(text: string) {
    if (text.length < 3) {
      setVenueSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setVenueSearching(true);
    try {
      const encoded = encodeURIComponent(text);
      const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "User-Agent": "PlayMate/1.0 (college project)" },
      });
      const data = await res.json() as VenueSuggestion[];
      setVenueSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setVenueSuggestions([]);
    } finally {
      setVenueSearching(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.title }]}>Create a Game</Text>
          <Text style={[styles.subtitle, { color: t.subtitle }]}>Organize a game for nearby players</Text>
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
          style={[styles.input, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
          placeholder="e.g. Sunday Kickabout"
          placeholderTextColor="#94A3B8"
          value={gameTitle}
          onChangeText={setGameTitle}
          maxLength={60}
        />

        <Label text="Venue / Location" required />
        <View>
          <View style={[styles.venueRow, { backgroundColor: t.input, borderColor: t.border }]}>
            <Text style={styles.venuePin}>📍</Text>
            <TextInput
              style={[styles.venueInput, { color: t.inputText }]}
              placeholder="Search venue or area..."
              placeholderTextColor="#94A3B8"
              value={venue}
              onChangeText={(v) => {
                setVenue(v);
                if (venueDebounce) clearTimeout(venueDebounce);
                const tmr = setTimeout(() => searchVenue(v), 600);
                setVenueDebounce(tmr);
              }}
            />
          </View>

          {showSuggestions && (
            <View style={[styles.suggestionsBox, { backgroundColor: t.card, borderColor: t.border }]}>
              {venueSearching && (
                <ActivityIndicator color="#2563EB" style={{ padding: 12 }} />
              )}
              {!venueSearching && venueSuggestions.map((s, i) => (
                <Pressable
                  key={i}
                  style={[styles.suggestionItem, { borderBottomColor: t.rowBorder }]}
                  onPress={() => handleVenuePick(s)}
                >
                  <Text style={styles.suggestionPin}>📍</Text>
                  <Text style={styles.suggestionText} numberOfLines={2}>
                    {s.display_name.split(",").slice(0, 3).join(",")}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

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
              style={[styles.input, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
              placeholder="dd/mm/yyyy"
              placeholderTextColor="#94A3B8"
              value={date}
              onChangeText={(val) => {
                const digits = val.replace(/\D/g, "").slice(0, 8);
                let formatted = digits;
                if (digits.length >= 3 && digits.length <= 4) {
                  formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                } else if (digits.length > 4) {
                  formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
                }
                setDate(formatted);
              }}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
          <View style={styles.half}>
            <Label text="Time" required />
            <TextInput
              style={[styles.input, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
              placeholder="hh:mm AM/PM"
              placeholderTextColor="#94A3B8"
              value={time}
              onChangeText={(val) => {
                const upper = val.toUpperCase();
                const digits = upper.replace(/[^0-9APM\s:]/g, "");

                if (digits.length <= 2) {
                  setTime(digits);
                } else if (digits.length === 3 && !digits.includes(":")) {
                  setTime(`${digits.slice(0, 2)}:${digits.slice(2)}`);
                } else {
                  setTime(digits.slice(0, 8));
                }
              }}
              autoCapitalize="characters"
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
                style={[styles.playerChip, !active && { backgroundColor: t.card, borderColor: t.border }, active && styles.playerChipActive]}
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
                    : [styles.skillCardDefault, { backgroundColor: t.card, borderColor: t.border }],
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
          style={[styles.input, styles.textArea, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
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
          <View style={[styles.preview, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.previewHeader}>
              <View style={[styles.previewBadge, { backgroundColor: sport?.bg }]}>
                <Text style={[styles.previewBadgeText, { color: sport?.color }]}>
                  {sport?.emoji} {sport?.name}
                </Text>
              </View>
              <Text style={styles.previewEmoji}>{sport?.emoji}</Text>
            </View>
            <Text style={[styles.previewTitle, { color: t.title }]}>{gameTitle}</Text>
            <Text style={[styles.previewInfo, { color: t.subtitle }]}>📍 {venue}</Text>
            <Text style={[styles.previewInfo, { color: t.subtitle }]}>📅 {date}  •  🕐 {time}</Text>
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
          disabled={!isFormValid || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createBtnText}>Create Game ⚡</Text>}

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
