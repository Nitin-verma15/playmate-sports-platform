import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import api from "../../services/api";
import { useThemeContext } from "../../context/ThemeContext";
import { COLORS, RADII, SHADOWS } from "@/theme/tokens";
import { ChalkPitchLines, PrimaryButton } from "@/components/ui";
import { MatchTicketCard } from "@/components/match-ticket-card";

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

const tabs: TabKey[] = ["Upcoming", "Joined", "Created", "History"];

const typeMap: Record<TabKey, string> = {
  Upcoming: "upcoming",
  Joined: "joined",
  Created: "created",
  History: "history",
};

const emptySub: Record<TabKey, string> = {
  Upcoming: "Join or create a game to get started.",
  Joined: "Discover games near you on the Discover tab.",
  Created: "Tap + to create your first game.",
  History: "Completed games will appear here.",
};

export default function MyGamesScreen() {
  const { theme: t } = useThemeContext();
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]} edges={["bottom"]}>
      {/* Salmon header holding tabs */}
      <View style={styles.header}>
        <ChalkPitchLines />
        <Text style={styles.title}>My Games</Text>
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable key={tab} style={styles.tab} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, isActive ? styles.tabTextActive : { color: COLORS.muted }]}>
                  {tab}
                </Text>
                <View style={[styles.tabUnderline, isActive && styles.tabUnderlineActive]} />
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.ink} style={{ marginTop: 60 }} />
        ) : games.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          games.map((game) => (
            <MatchTicketCard
              key={game.id}
              game={game}
              showPlayed
              onPress={() => router.push({ pathname: "/game-details", params: { id: String(game.id) } })}
            />
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState({ tab }: { tab: TabKey }) {
  const { theme: t } = useThemeContext();
  return (
    <View style={styles.empty}>
      <View style={styles.calWrap}>
        <View style={styles.calRustBand} />
        <View style={[styles.calBody, { backgroundColor: t.card, borderColor: COLORS.ink }]}>
          <View style={styles.calGridRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.calDot} />
            ))}
          </View>
          <View style={styles.calGridRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.calDot, i === 1 && styles.calDotFilled]} />
            ))}
          </View>
          <View style={styles.calGridRow}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.calDot} />
            ))}
          </View>
        </View>
      </View>
      <Text style={[styles.emptyTitle, { color: t.title }]}>No games yet</Text>
      <Text style={[styles.emptySub, { color: t.subtitle }]}>{emptySub[tab]}</Text>
      <PrimaryButton
        title="Find a Game"
        onPress={() => router.push("/discover")}
        style={styles.findBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    backgroundColor: COLORS.salmon,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 14,
    overflow: "hidden",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.ink,
    textTransform: "uppercase",
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  tabsRow: { flexDirection: "row", justifyContent: "space-between" },
  tab: { alignItems: "center", paddingVertical: 4 },
  tabText: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  tabTextActive: { color: COLORS.rust, fontWeight: "800" },
  tabUnderline: { height: 3, width: 28, marginTop: 6, borderRadius: 2, backgroundColor: "transparent" },
  tabUnderlineActive: { backgroundColor: COLORS.butter },
  list: { paddingHorizontal: 16, paddingTop: 16 },

  empty: { alignItems: "center", paddingTop: 56, paddingHorizontal: 32 },
  calWrap: {
    transform: [{ rotate: "-3deg" }],
    marginBottom: 24,
    shadowColor: COLORS.butter,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  calRustBand: {
    width: 130,
    height: 26,
    backgroundColor: COLORS.rust,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: COLORS.ink,
  },
  calBody: {
    width: 130,
    height: 104,
    borderWidth: 2,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 10,
    justifyContent: "space-evenly",
  },
  calGridRow: { flexDirection: "row", justifyContent: "space-around" },
  calDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.track, borderWidth: 1, borderColor: COLORS.ink },
  calDotFilled: { backgroundColor: COLORS.ink },
  emptyTitle: { fontSize: 18, fontWeight: "800", textAlign: "center", marginBottom: 8, textTransform: "uppercase" },
  emptySub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  findBtn: { marginTop: 22, width: 220 },
});
