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
import { COLORS, RADII, SHADOWS, SPORT_EMOJIS } from "@/theme/tokens";
import { ChalkPitchLines } from "@/components/ui";
import { MatchTicketCard } from "@/components/match-ticket-card";

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
        {/* Salmon header */}
        <View style={styles.header}>
          <ChalkPitchLines />
          <View style={styles.headerTop}>
            <Pressable
              style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.85 }]}
              onPress={() => router.back()}
            >
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
        </View>

        <View style={styles.body}>
          <TextInput
            style={[styles.input, { backgroundColor: t.input, borderColor: t.border, color: t.inputText }]}
            placeholder="Find an intermediate football game tomorrow evening..."
            placeholderTextColor={t.placeholder}
            value={query}
            onChangeText={setQuery}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Pressable
            style={({ pressed }) => [
              styles.searchBtn,
              (!query.trim() || loading) && styles.searchBtnDisabled,
              pressed && !(!query.trim() || loading) && { transform: [{ translateY: 3 }] },
            ]}
            onPress={handleSearch}
            disabled={!query.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.ink} />
            ) : (
              <Text style={styles.searchBtnText}>✨ Search with AI</Text>
            )}
          </Pressable>

          {!searched && !loading && (
            <View style={styles.examplesSection}>
              <Text style={[styles.examplesLabel, { color: t.title }]}>Try an example</Text>
              {exampleQueries.map((ex) => (
                <Pressable
                  key={ex}
                  style={({ pressed }) => [
                    styles.exampleChip,
                    { backgroundColor: t.card, borderColor: COLORS.ink },
                    pressed && { opacity: 0.9 },
                  ]}
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
              <Text style={[styles.filtersLabel, { color: t.title }]}>Extracted Filters</Text>
              <View style={styles.filtersRow}>
                {filters!.sport && (
                  <FilterChip icon={SPORT_EMOJIS[filters!.sport] ?? "⚽"} label="Sport" value={filters!.sport} />
                )}
                {filters!.skill_level && <FilterChip icon="🎯" label="Skill" value={filters!.skill_level} />}
                {filters!.time_of_day && <FilterChip icon="🕐" label="Time" value={filters!.time_of_day} />}
                {filters!.max_distance_km && (
                  <FilterChip icon="📍" label="Distance" value={`≤ ${filters!.max_distance_km} km`} />
                )}
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
                    <MatchTicketCard
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
        </View>
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

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingBottom: 8 },
  header: {
    backgroundColor: COLORS.salmon,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 18,
    overflow: "hidden",
  },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.ink,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.hard,
  },
  backArrow: { fontSize: 24, color: COLORS.card, fontWeight: "800", marginTop: -4 },
  headerText: { flex: 1 },
  title: { fontSize: 22, fontWeight: "800", color: COLORS.ink, textTransform: "uppercase", letterSpacing: -0.3 },
  subtitle: { fontSize: 12, color: COLORS.ink, opacity: 0.8, marginTop: 2 },
  aiBadge: {
    backgroundColor: COLORS.butter,
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  aiText: { color: COLORS.ink, fontSize: 12, fontWeight: "800" },
  body: { paddingHorizontal: 16, paddingTop: 16 },
  input: {
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 12,
  },
  searchBtn: {
    height: 52,
    backgroundColor: COLORS.butter,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: RADII.button,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...SHADOWS.hard,
  },
  searchBtnDisabled: { backgroundColor: COLORS.track },
  searchBtnText: { color: COLORS.ink, fontSize: 15, fontWeight: "800", textTransform: "uppercase" },
  examplesSection: { marginTop: 4 },
  examplesLabel: { fontSize: 13, fontWeight: "800", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.3 },
  exampleChip: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  exampleText: { fontSize: 13, lineHeight: 18 },
  emptyState: { alignItems: "center", paddingTop: 40, paddingBottom: 20 },
  emptyIcon: { fontSize: 40, marginBottom: 14 },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  filtersSection: { marginBottom: 16 },
  filtersLabel: { fontSize: 13, fontWeight: "800", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.3 },
  filtersRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.butter,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterChipIcon: { fontSize: 16 },
  filterChipLabel: { fontSize: 10, color: COLORS.ink, opacity: 0.7, marginBottom: 1, fontWeight: "700" },
  filterChipValue: { fontSize: 13, fontWeight: "800", color: COLORS.ink },
  resultsSection: { marginBottom: 8 },
  resultsLabel: { fontSize: 15, fontWeight: "800", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.3 },
  noResults: { alignItems: "center", paddingVertical: 40 },
  noResultsEmoji: { fontSize: 36, marginBottom: 12 },
  noResultsText: { fontSize: 13, textAlign: "center" },
});
