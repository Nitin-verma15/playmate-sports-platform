import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

type Game = {
  id: string;
  sport: string;
  emoji: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  distance: number;
  skill: "Beginner" | "Intermediate" | "Advanced";
  players: number;
  maxPlayers: number;
};

type ExtractedFilters = {
  sport: string | null;
  skill: string | null;
  distance: string | null;
  time: string | null;
};

// dummy game data - same as rest of app
const allGames: Game[] = [
  {
    id: "1",
    sport: "Football",
    emoji: "⚽",
    title: "Sunday Kickabout",
    venue: "Central Park Ground A",
    date: "Sun, 14 Sep",
    time: "4:00 PM",
    distance: 0.8,
    skill: "Intermediate",
    players: 14,
    maxPlayers: 16,
  },
  {
    id: "2",
    sport: "Basketball",
    emoji: "🏀",
    title: "3v3 Street Hoops",
    venue: "Campus Court B",
    date: "Sat, 13 Sep",
    time: "6:30 PM",
    distance: 1.2,
    skill: "Beginner",
    players: 6,
    maxPlayers: 6,
  },
  {
    id: "3",
    sport: "Cricket",
    emoji: "🏏",
    title: "Morning Cricket Session",
    venue: "University Oval",
    date: "Mon, 15 Sep",
    time: "7:00 AM",
    distance: 2.1,
    skill: "Intermediate",
    players: 8,
    maxPlayers: 12,
  },
  {
    id: "4",
    sport: "Badminton",
    emoji: "🏸",
    title: "Evening Badminton",
    venue: "Sports Complex Court 2",
    date: "Tue, 16 Sep",
    time: "5:30 PM",
    distance: 3.4,
    skill: "Advanced",
    players: 3,
    maxPlayers: 4,
  },
  {
    id: "5",
    sport: "Football",
    emoji: "⚽",
    title: "Weekend Football",
    venue: "Community Sports Ground",
    date: "Wed, 17 Sep",
    time: "7:00 PM",
    distance: 4.6,
    skill: "Beginner",
    players: 9,
    maxPlayers: 12,
  },
  {
    id: "6",
    sport: "Tennis",
    emoji: "🎾",
    title: "Evening Tennis Rally",
    venue: "Club Courts 3 & 4",
    date: "Wed, 17 Sep",
    time: "5:30 PM",
    distance: 3.0,
    skill: "Intermediate",
    players: 2,
    maxPlayers: 4,
  },
];

const sportColors: Record<string, { text: string; bg: string }> = {
  Football:   { text: "#2563EB", bg: "#EAF1FF" },
  Cricket:    { text: "#16A34A", bg: "#E8F5E9" },
  Basketball: { text: "#D97706", bg: "#FEF3C7" },
  Badminton:  { text: "#7C3AED", bg: "#F3E8FF" },
  Tennis:     { text: "#EA580C", bg: "#FEF0E7" },
};

const skillColors: Record<string, { text: string; bg: string }> = {
  Beginner:     { text: "#16A34A", bg: "#E8F5E9" },
  Intermediate: { text: "#D97706", bg: "#FEF3C7" },
  Advanced:     { text: "#DC2626", bg: "#FEE2E2" },
};

const exampleQueries = [
  "Find an intermediate football game within 5 km tomorrow evening",
  "Basketball game for beginners this weekend",
  "Cricket match near me in the morning",
];

// simple keyword-based extraction - real version will call GenAI API
function extractFilters(query: string): ExtractedFilters {
  const q = query.toLowerCase();

  let sport: string | null = null;
  if (q.includes("football") || q.includes("soccer")) sport = "Football";
  else if (q.includes("cricket")) sport = "Cricket";
  else if (q.includes("basketball") || q.includes("basket ball")) sport = "Basketball";
  else if (q.includes("badminton")) sport = "Badminton";
  else if (q.includes("tennis")) sport = "Tennis";

  let skill: string | null = null;
  if (q.includes("beginner") || q.includes("learning") || q.includes("starter")) skill = "Beginner";
  else if (q.includes("intermediate") || q.includes("regular")) skill = "Intermediate";
  else if (q.includes("advanced") || q.includes("competitive")) skill = "Advanced";

  let distance: string | null = null;
  const distMatch = q.match(/(\d+)\s*km/);
  if (distMatch) distance = `≤ ${distMatch[1]}km`;
  else if (q.includes("near") || q.includes("nearby")) distance = "≤ 5km";

  let time: string | null = null;
  if (q.includes("morning")) time = "Morning";
  else if (q.includes("evening")) time = "Evening";
  else if (q.includes("afternoon")) time = "Afternoon";
  else if (q.includes("night")) time = "Night";
  else if (q.includes("tomorrow")) time = "Tomorrow";
  else if (q.includes("weekend")) time = "Weekend";
  else if (q.includes("today")) time = "Today";

  return { sport, skill, distance, time };
}

function matchGames(filters: ExtractedFilters): Game[] {
  return allGames.filter((game) => {
    if (filters.sport && game.sport !== filters.sport) return false;
    if (filters.skill && game.skill !== filters.skill) return false;
    if (filters.distance) {
      const km = parseInt(filters.distance.replace(/\D/g, ""), 10);
      if (game.distance > km) return false;
    }
    return true;
  });
}

export default function AISearchScreen() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ExtractedFilters | null>(null);
  const [results, setResults] = useState<Game[]>([]);
  const [searched, setSearched] = useState(false);

  function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(false);

    // simulate API delay - will call real GenAI endpoint later
    setTimeout(() => {
      const extracted = extractFilters(query);
      const matched = matchGames(extracted);
      setFilters(extracted);
      setResults(matched);
      setLoading(false);
      setSearched(true);
    }, 1200);
  }

  function handleExampleTap(example: string) {
    setQuery(example);
  }

  const hasFilters = filters && Object.values(filters).some((v) => v !== null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>AI Search</Text>
            <Text style={styles.subtitle}>Natural-language game finder</Text>
          </View>
          <View style={styles.aiBadge}>
            <Text style={styles.aiText}>✨ AI</Text>
          </View>
        </View>

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder="Find an intermediate football game within 5 km tomorrow evening..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Search button */}
        <Pressable
          style={[styles.searchBtn, !query.trim() && styles.searchBtnDisabled]}
          onPress={handleSearch}
          disabled={!query.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.searchBtnText}>✨ Search with AI</Text>
          )}
        </Pressable>

        {/* Example queries - shown before first search */}
        {!searched && !loading && (
          <View style={styles.examplesSection}>
            <Text style={styles.examplesLabel}>Try an example</Text>
            {exampleQueries.map((ex) => (
              <Pressable
                key={ex}
                style={styles.exampleChip}
                onPress={() => handleExampleTap(ex)}
              >
                <Text style={styles.exampleText}>"{ex}"</Text>
              </Pressable>
            ))}

            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Describe the game you're looking for</Text>
              <Text style={styles.emptySub}>
                Include sport, skill level, distance,{"\n"}date or time — in plain English.
              </Text>
            </View>
          </View>
        )}

        {/* Extracted filters */}
        {searched && hasFilters && (
          <View style={styles.filtersSection}>
            <Text style={styles.filtersLabel}>Extracted Filters</Text>
            <View style={styles.filtersRow}>
              {filters!.sport && (
                <FilterChip icon="⚽" label="Sport" value={filters!.sport} />
              )}
              {filters!.skill && (
                <FilterChip icon="🎯" label="Skill" value={filters!.skill} />
              )}
              {filters!.distance && (
                <FilterChip icon="📍" label="Distance" value={filters!.distance} />
              )}
              {filters!.time && (
                <FilterChip icon="🕐" label="Time" value={filters!.time} />
              )}
            </View>
          </View>
        )}

        {/* Results */}
        {searched && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsLabel}>
              {results.length > 0
                ? `Matching Games (${results.length})`
                : "No matching games found"}
            </Text>

            {results.length === 0 && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsEmoji}>😕</Text>
                <Text style={styles.noResultsText}>
                  Try a different description or broaden your search.
                </Text>
              </View>
            )}

            {results.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onPress={() =>
                  router.push({ pathname: "/game-details", params: { id: game.id } })
                }
              />
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.filterChip}>
      <Text style={styles.filterChipIcon}>{icon}</Text>
      <View>
        <Text style={styles.filterChipLabel}>{label}</Text>
        <Text style={styles.filterChipValue}>{value}</Text>
      </View>
    </View>
  );
}

function GameCard({ game, onPress }: { game: Game; onPress: () => void }) {
  const isFull = game.players >= game.maxPlayers;
  const sc = sportColors[game.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
  const skc = skillColors[game.skill] ?? { text: "#64748B", bg: "#F1F5F9" };
  const progress = (game.players / game.maxPlayers) * 100;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.sportBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.sportBadgeText, { color: sc.text }]}>
            {game.emoji} {game.sport}
          </Text>
        </View>
        <View style={[styles.emojiBox, { backgroundColor: sc.bg }]}>
          <Text style={{ fontSize: 20 }}>{game.emoji}</Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{game.title}</Text>
      <Text style={styles.info}>📍 {game.venue}</Text>
      <Text style={styles.info}>📅 {game.date}  •  🕐 {game.time}  •  📍 {game.distance} km</Text>

      <View style={styles.cardFooter}>
        <View style={[styles.skillBadge, { backgroundColor: skc.bg }]}>
          <Text style={[styles.skillText, { color: skc.text }]}>{game.skill}</Text>
        </View>
        <View>
          <Text style={styles.playerCount}>{game.players}/{game.maxPlayers} players</Text>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressBar,
                { width: `${progress}%` },
                isFull && { backgroundColor: "#DC2626" },
              ]}
            />
          </View>
          {isFull && <Text style={styles.fullLabel}>FULL</Text>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  container: { paddingHorizontal: 16, paddingTop: 8 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: { fontSize: 22, color: "#111827", lineHeight: 26 },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 12, color: "#64748B", marginTop: 1 },
  aiBadge: {
    backgroundColor: "#E9F0FF",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  aiText: { color: "#2563EB", fontSize: 12, fontWeight: "700" },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: "#111827",
    minHeight: 80,
    marginBottom: 12,
  },

  searchBtn: {
    height: 50,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  searchBtnDisabled: { backgroundColor: "#CBD5E1" },
  searchBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  examplesSection: { marginTop: 4 },
  examplesLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  exampleChip: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  exampleText: { fontSize: 13, color: "#475569", lineHeight: 18 },

  emptyState: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
  },
  emptyIcon: { fontSize: 40, marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  emptySub: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20 },

  filtersSection: { marginBottom: 16 },
  filtersLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  filtersRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterChipIcon: { fontSize: 16 },
  filterChipLabel: { fontSize: 10, color: "#94A3B8", marginBottom: 1 },
  filterChipValue: { fontSize: 13, fontWeight: "700", color: "#111827" },

  resultsSection: { marginBottom: 8 },
  resultsLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  noResults: { alignItems: "center", paddingVertical: 40 },
  noResultsEmoji: { fontSize: 36, marginBottom: 12 },
  noResultsText: { fontSize: 13, color: "#64748B", textAlign: "center" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 13,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },
  sportBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  sportBadgeText: { fontSize: 11, fontWeight: "700" },
  emojiBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  info: { fontSize: 12, color: "#64748B", marginBottom: 4 },
  cardFooter: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  skillBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  skillText: { fontSize: 11, fontWeight: "700" },
  playerCount: { fontSize: 11, color: "#475569", textAlign: "right", marginBottom: 4 },
  progressBg: { width: 70, height: 5, borderRadius: 5, backgroundColor: "#E5E7EB", overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 5, backgroundColor: "#F59E0B" },
  fullLabel: { fontSize: 9, color: "#DC2626", fontWeight: "700", textAlign: "right", marginTop: 3 },
});
