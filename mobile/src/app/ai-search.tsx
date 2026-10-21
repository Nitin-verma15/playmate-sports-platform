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
import api from "../services/api";
import { useThemeContext } from "../context/ThemeContext";

type Game = {
  id: number;
  sport: string;
  title: string;
  venue: string;
  scheduled_at: string;
  skill_level: "Beginner" | "Intermediate" | "Advanced";
  current_players: number;
  max_players: number;
  status: string;
  organizer_name: string;
};

type ExtractedFilters = {
  sport: string | null;
  skill_level: string | null;
  time_of_day: string | null;
  max_distance_km: number | null;
};

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

const sportEmojis: Record<string, string> = {
  Football: "⚽", Cricket: "🏏", Basketball: "🏀", Badminton: "🏸", Tennis: "🎾",
};

const exampleQueries = [
  "Find an intermediate football game tomorrow evening",
  "Basketball game for beginners this weekend",
  "Cricket match near me in the morning",
];

export default function AISearchScreen() {
  const { theme: t } = useThemeContext();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ExtractedFilters | null>(null);
  const [results, setResults] = useState<Game[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(false);
    setError("");

    try {
      const res = await api.post("/ai/search", { query: query.trim() });
      setFilters(res.data.filters);
      setResults(res.data.games || []);
      setSearched(true);
    } catch {
      setError("Search failed. Please try again.");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  const hasFilters = filters && Object.values(filters).some((v) => v !== null);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable style={[styles.backBtn, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => router.back()}>
            <Text style={[styles.backArrow, { color: t.title }]}>‹</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: t.title }]}>AI Search</Text>
            <Text style={[styles.subtitle, { color: t.subtitle }]}>Natural-language game finder</Text>
          </View>
          <View style={styles.aiBadge}>
            <Text style={styles.aiText}>✨ AI</Text>
          </View>
        </View>

        <TextInput
          style={[styles.input, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
          placeholder="Find an intermediate football game tomorrow evening..."
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={setQuery}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

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

        {!searched && !loading && (
          <View style={styles.examplesSection}>
            <Text style={styles.examplesLabel}>Try an example</Text>
            {exampleQueries.map((ex) => (
              <Pressable
                key={ex}
                style={[styles.exampleChip, { backgroundColor: t.card, borderColor: t.border }]}
                onPress={() => setQuery(ex)}
              >
                <Text style={[styles.exampleText, { color: t.subtitle }]}>"{ex}"</Text>
              </Pressable>
            ))}
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: t.title }]}>Describe the game you're looking for</Text>
              <Text style={[styles.emptySub, { color: t.subtitle }]}>
                Include sport, skill level, distance,{"\n"}date or time — in plain English.
              </Text>
            </View>
          </View>
        )}

        {searched && hasFilters && (
          <View style={styles.filtersSection}>
            <Text style={styles.filtersLabel}>Extracted Filters</Text>
            <View style={styles.filtersRow}>
              {filters!.sport && <FilterChip icon={sportEmojis[filters!.sport] ?? "🏅"} label="Sport" value={filters!.sport} />}
              {filters!.skill_level && <FilterChip icon="🎯" label="Skill" value={filters!.skill_level} />}
              {filters!.time_of_day && <FilterChip icon="🕐" label="Time" value={filters!.time_of_day} />}
              {filters!.max_distance_km && <FilterChip icon="📍" label="Distance" value={`≤ ${filters!.max_distance_km} km`} />}
            </View>
          </View>
        )}

        {searched && (
          <View style={styles.resultsSection}>
            {error ? (
              <View style={styles.noResults}>
                <Text style={styles.noResultsEmoji}>😕</Text>
                <Text style={[styles.noResultsText, { color: t.subtitle }]}>{error}</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.resultsLabel, { color: t.title }]}>
                  {results.length > 0 ? `Matching Games (${results.length})` : "No matching games found"}
                </Text>
                {results.length === 0 && (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsEmoji}>😕</Text>
                    <Text style={[styles.noResultsText, { color: t.subtitle }]}>
                      Try a different description or broaden your search.
                    </Text>
                  </View>
                )}
                {results.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onPress={() => router.push({ pathname: "/game-details", params: { id: String(game.id) } })}
                  />
                ))}
              </>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { theme: t } = useThemeContext();
  return (
    <View style={[styles.filterChip, { backgroundColor: t.card, borderColor: t.border }]}>
      <Text style={styles.filterChipIcon}>{icon}</Text>
      <View>
        <Text style={styles.filterChipLabel}>{label}</Text>
        <Text style={[styles.filterChipValue, { color: t.title }]}>{value}</Text>
      </View>
    </View>
  );
}

function GameCard({ game, onPress }: { game: Game; onPress: () => void }) {
  const { theme: t } = useThemeContext();
  const isFull = game.current_players >= game.max_players;
  const sc = sportColors[game.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
  const skc = skillColors[game.skill_level] ?? { text: "#64748B", bg: "#F1F5F9" };
  const progress = (game.current_players / game.max_players) * 100;
  const emoji = sportEmojis[game.sport] ?? "🏅";
  const dateStr = new Date(game.scheduled_at).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const timeStr = new Date(game.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { backgroundColor: t.card, borderColor: t.border }, pressed && { opacity: 0.85 }]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.sportBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.sportBadgeText, { color: sc.text }]}>{emoji} {game.sport}</Text>
        </View>
        <View style={[styles.emojiBox, { backgroundColor: sc.bg }]}>
          <Text style={{ fontSize: 20 }}>{emoji}</Text>
        </View>
      </View>

      <Text style={[styles.cardTitle, { color: t.title }]}>{game.title}</Text>
      <Text style={[styles.info, { color: t.subtitle }]}>📍 {game.venue}</Text>
      <Text style={[styles.info, { color: t.subtitle }]}>📅 {dateStr}  •  🕐 {timeStr}</Text>

      <View style={styles.cardFooter}>
        <View style={[styles.skillBadge, { backgroundColor: skc.bg }]}>
          <Text style={[styles.skillText, { color: skc.text }]}>{game.skill_level}</Text>
        </View>
        <View>
          <Text style={styles.playerCount}>{game.current_players}/{game.max_players} players</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressBar, { width: `${progress}%` }, isFull && { backgroundColor: "#DC2626" }]} />
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
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 10 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 22, color: "#111827", lineHeight: 26 },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 12, color: "#64748B", marginTop: 1 },
  aiBadge: { backgroundColor: "#E9F0FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  aiText: { color: "#2563EB", fontSize: 12, fontWeight: "700" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: "#111827", minHeight: 80, marginBottom: 12 },
  searchBtn: { height: 50, backgroundColor: "#2563EB", borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  searchBtnDisabled: { backgroundColor: "#CBD5E1" },
  searchBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  examplesSection: { marginTop: 4 },
  examplesLabel: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 10 },
  exampleChip: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, padding: 12, marginBottom: 8 },
  exampleText: { fontSize: 13, color: "#475569", lineHeight: 18 },
  emptyState: { alignItems: "center", paddingTop: 40, paddingBottom: 20 },
  emptyIcon: { fontSize: 40, marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  emptySub: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20 },
  filtersSection: { marginBottom: 16 },
  filtersLabel: { fontSize: 13, fontWeight: "700", color: "#374151", marginBottom: 10 },
  filtersRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  filterChipIcon: { fontSize: 16 },
  filterChipLabel: { fontSize: 10, color: "#94A3B8", marginBottom: 1 },
  filterChipValue: { fontSize: 13, fontWeight: "700", color: "#111827" },
  resultsSection: { marginBottom: 8 },
  resultsLabel: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 12 },
  noResults: { alignItems: "center", paddingVertical: 40 },
  noResultsEmoji: { fontSize: 36, marginBottom: 12 },
  noResultsText: { fontSize: 13, color: "#64748B", textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", padding: 14, marginBottom: 13 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 9 },
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
