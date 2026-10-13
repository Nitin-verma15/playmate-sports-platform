import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import api from "../../services/api";

type TabKey = "Upcoming" | "Joined" | "Created" | "History";

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

const skillColors = {
  Beginner:     { text: "#16A34A", bg: "#E8F5E9" },
  Intermediate: { text: "#D97706", bg: "#FEF3C7" },
  Advanced:     { text: "#DC2626", bg: "#FEE2E2" },
};

const sportColors: Record<string, { text: string; bg: string }> = {
  Football:   { text: "#2563EB", bg: "#EAF1FF" },
  Cricket:    { text: "#16A34A", bg: "#E8F5E9" },
  Basketball: { text: "#D97706", bg: "#FEF3C7" },
  Badminton:  { text: "#7C3AED", bg: "#F3E8FF" },
  Tennis:     { text: "#EA580C", bg: "#FEF0E7" },
};

const sportEmojis: Record<string, string> = {
  Football: "⚽", Cricket: "🏏", Basketball: "🏀", Badminton: "🏸", Tennis: "🎾",
};

const tabs: TabKey[] = ["Upcoming", "Joined", "Created", "History"];

const typeMap: Record<TabKey, string> = {
  Upcoming: "upcoming",
  Joined:   "joined",
  Created:  "created",
  History:  "history",
};

export default function MyGamesScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("Upcoming");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGames = useCallback(async () => {
    try {
      const res = await api.get(`/users/me/games?type=${typeMap[activeTab]}`);
      setGames(res.data.games || []);
    } catch {
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    fetchGames();
  }, [fetchGames]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchGames();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Games</Text>
      </View>

      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color="#2563EB" style={{ marginTop: 60 }} />
        ) : games.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPress={() => router.push({ pathname: "/game-details", params: { id: String(game.id) } })}
            />
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function GameCard({ game, onPress }: { game: Game; onPress: () => void }) {
  const isFull = game.current_players >= game.max_players;
  const isCompleted = game.status === "COMPLETED";
  const progress = (game.current_players / game.max_players) * 100;
  const sc = sportColors[game.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
  const skc = skillColors[game.skill_level];
  const emoji = sportEmojis[game.sport] ?? "🏅";
  const dateStr = new Date(game.scheduled_at).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const timeStr = new Date(game.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.sportBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.sportBadgeText, { color: sc.text }]}>{emoji} {game.sport}</Text>
        </View>
        <View style={styles.cardRight}>
          {isCompleted && (
            <View style={styles.playedBadge}>
              <Text style={styles.playedText}>PLAYED</Text>
            </View>
          )}
          <View style={[styles.emojiBox, { backgroundColor: sc.bg }]}>
            <Text style={styles.emojiText}>{emoji}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.cardTitle}>{game.title}</Text>
      <Text style={styles.info}>📍 {game.venue}</Text>
      <Text style={styles.info}>📅 {dateStr}  •  🕐 {timeStr}</Text>

      <View style={styles.cardFooter}>
        <View style={[styles.skillBadge, { backgroundColor: skc.bg }]}>
          <Text style={[styles.skillText, { color: skc.text }]}>{game.skill_level}</Text>
        </View>
        <View>
          <Text style={styles.playerCount}>{game.current_players}/{game.max_players} players</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressBar, { width: `${progress}%` }, isFull && { backgroundColor: "#DC2626" }]} />
          </View>
          {isFull && !isCompleted && <Text style={styles.fullLabel}>FULL</Text>}
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const messages: Record<TabKey, { emoji: string; title: string; sub: string }> = {
    Upcoming: { emoji: "📅", title: "No upcoming games", sub: "Join or create a game to get started." },
    Joined:   { emoji: "🏃", title: "You haven't joined any games yet", sub: "Discover games near you on the Discover tab." },
    Created:  { emoji: "🎮", title: "You haven't created any games", sub: "Tap + to create your first game." },
    History:  { emoji: "🏆", title: "No game history yet", sub: "Completed games will appear here." },
  };
  const { emoji, title, sub } = messages[tab];
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySub}>{sub}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  title: { fontSize: 26, fontWeight: "700", color: "#111827" },
  tabsWrap: { paddingLeft: 16 },
  tabsRow: { flexDirection: "row", gap: 8, paddingVertical: 12, paddingRight: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0" },
  tabActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  tabTextActive: { color: "#fff" },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", padding: 14, marginBottom: 13 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 9 },
  sportBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  sportBadgeText: { fontSize: 11, fontWeight: "700" },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  playedBadge: { backgroundColor: "#F0FDF4", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "#BBF7D0" },
  playedText: { fontSize: 9, fontWeight: "700", color: "#16A34A", letterSpacing: 0.5 },
  emojiBox: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  emojiText: { fontSize: 20 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  info: { fontSize: 12, color: "#64748B", marginBottom: 4 },
  cardFooter: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  skillBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  skillText: { fontSize: 11, fontWeight: "700" },
  playerCount: { fontSize: 11, color: "#475569", textAlign: "right", marginBottom: 4 },
  progressBg: { width: 70, height: 5, borderRadius: 5, backgroundColor: "#E5E7EB", overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 5, backgroundColor: "#F59E0B" },
  fullLabel: { fontSize: 9, color: "#DC2626", fontWeight: "700", textAlign: "right", marginTop: 3 },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 40, marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: "#111827", textAlign: "center", marginBottom: 8 },
  emptySub: { fontSize: 13, color: "#64748B", textAlign: "center", lineHeight: 20 },
});
