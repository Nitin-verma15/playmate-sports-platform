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
import { COLORS, RADII, SHADOWS, SPORT_COLORS } from "@/theme/tokens";
import { ChalkPitchLines, PrimaryButton, SportTag, SportTile } from "@/components/ui";

type Sport = {
  id: string;
  name: string;
  emoji: string;
};

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

const sports: Sport[] = [
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "cricket", name: "Cricket", emoji: "🏏" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "badminton", name: "Badminton", emoji: "🏸" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
];

const skillLevels: SkillLevel[] = ["Beginner", "Intermediate", "Advanced"];

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
      const scheduledAt = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${time24}:00.000Z`).toISOString();
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
      const msg = error?.response?.data?.error?.message || "Could not create the game.";
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
    if (text.length < 3) { setVenueSuggestions([]); setShowSuggestions(false); return; }
    setVenueSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=5`,
        { headers: { "User-Agent": "PlayMate/1.0" } }
      );
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Salmon header */}
        <View style={styles.header}>
          <ChalkPitchLines />
          <Text style={styles.headerTitle}>Create a Game</Text>
          <Text style={styles.headerSub}>Bring players together near you</Text>
        </View>

        <View style={styles.body}>

          {/* Sport Selector */}
          <SectionLabel text="Pick a Sport" required />
          <View style={styles.sportsGrid}>
            {sports.map((s) => (
              <SportTile
                key={s.id}
                name={s.name}
                emoji={s.emoji}
                selected={selectedSport === s.id}
                onPress={() => setSelectedSport(s.id)}
                style={styles.sportTile}
              />
            ))}
          </View>

          {/* Game Title */}
          <SectionLabel text="Game Title" required />
          <TextInput
            style={[styles.input, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
            placeholder="e.g. Sunday Kickabout"
            placeholderTextColor={t.placeholder}
            value={gameTitle}
            onChangeText={setGameTitle}
            maxLength={60}
          />

          {/* Venue */}
          <SectionLabel text="Venue / Location" required />
          <View style={[styles.venueRow, { backgroundColor: t.input, borderColor: t.border }]}>
            <Text style={styles.venuePin}>📍</Text>
            <TextInput
              style={[styles.venueInput, { color: t.inputText }]}
              placeholder="Search venue or area..."
              placeholderTextColor={t.placeholder}
              value={venue}
              onChangeText={(v) => {
                setVenue(v);
                if (venueDebounce) clearTimeout(venueDebounce);
                const tmr = setTimeout(() => searchVenue(v), 600);
                setVenueDebounce(tmr);
              }}
            />
            {venueSearching && <ActivityIndicator color={COLORS.ink} size="small" />}
          </View>
          {showSuggestions && (
            <View style={[styles.suggestionsBox, { backgroundColor: t.card, borderColor: COLORS.ink }]}>
              {venueSuggestions.map((s, i) => (
                <Pressable
                  key={i}
                  style={[styles.suggestionItem, { borderBottomColor: t.rowBorder }]}
                  onPress={() => handleVenuePick(s)}
                >
                  <Text style={{ fontSize: 14 }}>📍</Text>
                  <Text style={[styles.suggestionText, { color: t.title }]} numberOfLines={2}>
                    {s.display_name.split(",").slice(0, 3).join(",")}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Date + Time */}
          <View style={styles.row}>
            <View style={styles.half}>
              <SectionLabel text="Date" required />
              <View style={[styles.iconInput, { backgroundColor: t.input, borderColor: t.border }]}>
                <Text style={styles.inputIcon}>📅</Text>
                <TextInput
                  style={[styles.iconInputText, { color: t.inputText }]}
                  placeholder="dd/mm/yyyy"
                  placeholderTextColor={t.placeholder}
                  value={date}
                  onChangeText={(val) => {
                    const digits = val.replace(/\D/g, "").slice(0, 8);
                    let f = digits;
                    if (digits.length >= 3 && digits.length <= 4) f = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                    else if (digits.length > 4) f = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
                    setDate(f);
                  }}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>
            <View style={styles.half}>
              <SectionLabel text="Time" required />
              <View style={[styles.iconInput, { backgroundColor: t.input, borderColor: t.border }]}>
                <Text style={styles.inputIcon}>🕐</Text>
                <TextInput
                  style={[styles.iconInputText, { color: t.inputText }]}
                  placeholder="hh:mm AM/PM"
                  placeholderTextColor={t.placeholder}
                  value={time}
                  onChangeText={(val) => {
                    const upper = val.toUpperCase().replace(/[^0-9APM\s:]/g, "");
                    if (upper.length <= 2) setTime(upper);
                    else if (upper.length === 3 && !upper.includes(":")) setTime(`${upper.slice(0, 2)}:${upper.slice(2)}`);
                    else setTime(upper.slice(0, 8));
                  }}
                  autoCapitalize="characters"
                  maxLength={8}
                />
              </View>
            </View>
          </View>

          {/* Max Players */}
          <SectionLabel text="Max Players" required />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playersRow}>
            {maxPlayersOptions.map((n) => {
              const active = maxPlayers === n;
              return (
                <Pressable
                  key={n}
                  style={[
                    styles.playerChip,
                    { borderColor: COLORS.ink },
                    active ? { backgroundColor: COLORS.ink } : { backgroundColor: t.card },
                  ]}
                  onPress={() => setMaxPlayers(n)}
                >
                  <Text style={[styles.playerChipText, { color: active ? COLORS.card : t.title }]}>{n}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Skill Level — segmented control */}
          <SectionLabel text="Skill Level" required />
          <View style={[styles.skillSegment, { borderColor: COLORS.ink }]}>
            {skillLevels.map((level) => {
              const active = skillLevel === level;
              return (
                <Pressable
                  key={level}
                  style={[styles.skillSegmentItem, active && styles.skillSegmentActive]}
                  onPress={() => setSkillLevel(level)}
                >
                  <Text style={[styles.skillSegmentText, active && styles.skillSegmentTextActive]}>{level}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Description */}
          <SectionLabel text="Description" />
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
            placeholder="Any extra details... (optional)"
            placeholderTextColor={t.placeholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            maxLength={200}
            textAlignVertical="top"
          />

          {/* Preview Card */}
          {isFormValid && sport && (
            <View style={[styles.previewCard, { backgroundColor: t.card, borderColor: COLORS.ink }, { borderLeftColor: SPORT_COLORS[sport.name] }]}>
              <View style={styles.previewHero}>
                <Text style={styles.previewEmoji}>{sport.emoji}</Text>
                <View>
                  <SportTag sport={sport.name} emoji={sport.emoji} />
                  <Text style={[styles.previewTitle, { color: t.title }]}>{gameTitle}</Text>
                </View>
              </View>
              <View style={styles.previewBody}>
                <Text style={[styles.previewInfo, { color: t.subtitle }]}>📍 {venue}</Text>
                <Text style={[styles.previewInfo, { color: t.subtitle }]}>📅 {date}  •  🕐 {time}</Text>
                <View style={styles.previewFooter}>
                  <View style={[styles.previewSkillBadge, { borderColor: COLORS.ink }]}>
                    <Text style={[styles.previewSkillText, { color: t.title }]}>{skillLevel}</Text>
                  </View>
                  <Text style={[styles.previewPlayers, { color: t.subtitle }]}>0/{maxPlayers} players</Text>
                </View>
              </View>
            </View>
          )}

          {/* Create Button */}
          <PrimaryButton
            title={isFormValid ? "Create Game ⚡" : "Fill all fields to continue"}
            onPress={handleCreate}
            disabled={!isFormValid || loading}
            loading={loading}
            height={56}
            style={styles.createBtn}
          />

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ text, required }: { text: string; required?: boolean }) {
  const { theme: t } = useThemeContext();
  return (
    <Text style={[styles.label, { color: t.title }]}>
      {text}
      {required && <Text style={{ color: COLORS.rust }}> *</Text>}
    </Text>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  header: {
    backgroundColor: COLORS.salmon,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
    paddingTop: 54,
    paddingBottom: 22,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.ink,
    letterSpacing: -0.5,
    textTransform: "uppercase",
  },
  headerSub: { fontSize: 14, color: COLORS.ink, opacity: 0.8, marginTop: 4 },

  body: { paddingHorizontal: 16, paddingTop: 20 },

  label: { fontSize: 13, fontWeight: "800", marginBottom: 10, marginTop: 20, textTransform: "uppercase", letterSpacing: 0.3 },

  sportsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  sportTile: { width: "47%", paddingVertical: 14 },

  input: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
  },
  textArea: { height: 90, paddingTop: 14 },

  iconInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputIcon: { fontSize: 18, marginRight: 8 },
  iconInputText: { flex: 1, fontSize: 14 },

  venueRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  venuePin: { fontSize: 16, marginRight: 8 },
  venueInput: { flex: 1, paddingVertical: 12, fontSize: 14 },

  suggestionsBox: {
    borderWidth: 2,
    borderRadius: 14,
    marginTop: 4,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  suggestionText: { flex: 1, fontSize: 13 },

  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },

  playersRow: { gap: 8, paddingBottom: 4, paddingTop: 2 },
  playerChip: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  playerChipText: { fontSize: 14, fontWeight: "800" },

  skillSegment: {
    flexDirection: "row",
    borderWidth: 2,
    borderRadius: 14,
    overflow: "hidden",
  },
  skillSegmentItem: { flex: 1, paddingVertical: 14, alignItems: "center", backgroundColor: "transparent" },
  skillSegmentActive: { backgroundColor: COLORS.butter },
  skillSegmentText: { fontSize: 13, fontWeight: "700", color: COLORS.muted, textTransform: "uppercase" },
  skillSegmentTextActive: { color: COLORS.ink, fontWeight: "800" },

  previewCard: {
    marginTop: 24,
    borderRadius: RADII.card,
    borderWidth: 2,
    borderLeftWidth: 6,
    overflow: "hidden",
    ...SHADOWS.hard,
  },
  previewHero: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  previewEmoji: { fontSize: 36 },
  previewTitle: { fontSize: 18, fontWeight: "800", marginTop: 8, textTransform: "uppercase" },
  previewBody: { padding: 14, paddingTop: 0 },
  previewInfo: { fontSize: 13, marginBottom: 5 },
  previewFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  previewSkillBadge: { borderWidth: 2, borderRadius: RADII.chip, paddingHorizontal: 10, paddingVertical: 4 },
  previewSkillText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  previewPlayers: { fontSize: 12, fontWeight: "700" },

  createBtn: { marginTop: 24, width: "100%" },
});
