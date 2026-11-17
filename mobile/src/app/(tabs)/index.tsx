import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import api from "../../services/api";
import { auth } from "../../config/firebase";
import { useThemeContext } from "../../context/ThemeContext";
import { COLORS, RADII, SHADOWS, SPORT_COLORS } from "@/theme/tokens";
import { ChalkPitchLines, SportTile } from "@/components/ui";
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

const sports = [
  { name: "Football", emoji: "⚽" },
  { name: "Cricket", emoji: "🏏" },
  { name: "Basketball", emoji: "🏀" },
  { name: "Badminton", emoji: "🏸" },
  { name: "Tennis", emoji: "🎾" },
];

export default function HomeScreen() {
  const { theme: t } = useThemeContext();
  const [activeSport, setActiveSport] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState("Player");

  useEffect(() => {
    fetchGames();
    loadUser();
  }, []);

  async function fetchGames() {
    try {
      const res = await api.get("/games");
      setGames(res.data.games || []);
    } catch {
      // show empty state if fails
    } finally {
      setLoading(false);
    }
  }

  async function loadUser() {
    const user = auth.currentUser;
    if (user?.displayName) {
      setUserName(user.displayName);
    } else if (user?.email) {
      setUserName(user.email.split("@")[0]);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchGames();
    setRefreshing(false);
  }

  function handleSportPress(sportName: string) {
    setActiveSport(sportName);
    router.push({ pathname: "/discover", params: { sport: sportName } });
  }

  function handleSearchPress() {
    router.push("/ai-search");
  }

  function handleSeeAll() {
    router.push("/discover");
  }

  function handleProfilePress() {
    router.push("/profile");
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning ☀️" : hour < 17 ? "Good afternoon 👋" : "Good evening 🌙";
  const openSpots = games.reduce((n, g) => n + Math.max(0, g.max_players - g.current_players), 0);
  const stats = [
    { value: loading ? "–" : String(games.length), label: "Games\nnearby", color: COLORS.butter, rotate: "-2deg" },
    { value: loading ? "–" : String(openSpots), label: "Open\nspots", color: SPORT_COLORS.Badminton, rotate: "1.5deg" },
    { value: String(sports.length), label: "Sports\nto play", color: SPORT_COLORS.Cricket, rotate: "-1deg" },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Salmon header */}
        <View style={styles.header}>
          <ChalkPitchLines />
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.userName}>{userName}</Text>
              <View style={styles.locationRow}>
                <View style={styles.locationDot} />
                <Text style={styles.location}>Koramangala, Bangalore</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.profileButton, pressed && { opacity: 0.85 }]}
              onPress={handleProfilePress}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </Pressable>
          </View>

          {/* Search bar */}
          <Pressable
            style={({ pressed }) => [styles.searchBar, { backgroundColor: t.card }, pressed && { opacity: 0.9 }]}
            onPress={handleSearchPress}
          >
            <View pointerEvents="none" style={styles.searchBarInner}>
              <Text style={styles.searchIcon}>⌕</Text>
              <Text style={[styles.searchPlaceholder, { color: t.placeholder }]}>
                What do you want to play?
              </Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiText}>✨ AI</Text>
              </View>
            </View>
          </Pressable>
        </View>

        <View style={styles.contentArea}>
          {/* Matchday board */}
          <Animated.View entering={FadeInDown.delay(80).duration(450)} style={styles.board}>
            {stats.map((s) => (
              <View key={s.label} style={[styles.statTile, { backgroundColor: s.color, transform: [{ rotate: s.rotate }] }]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </Animated.View>

          {/* Quick actions */}
          <Animated.View entering={FadeInDown.delay(160).duration(450)} style={styles.actions}>
            <Pressable
              style={({ pressed }) => [styles.actionCard, styles.actionHost, pressed && styles.pressedDown]}
              onPress={() => router.push("/create")}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>＋</Text>
              </View>
              <Text style={styles.actionTitle}>Host a game</Text>
              <Text style={styles.actionSub}>Fill your squad fast</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: t.card, borderColor: t.border },
                pressed && styles.pressedDown,
              ]}
              onPress={handleSeeAll}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.salmon }]}>
                <Text style={styles.actionIconText}>⌖</Text>
              </View>
              <Text style={[styles.actionTitle, { color: t.title }]}>Find a game</Text>
              <Text style={[styles.actionSub, { color: t.subtitle }]}>Join players near you</Text>
            </Pressable>
          </Animated.View>

          <SectionHeader title="Sports" />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sportsRow}
          >
            {sports.map((sport, i) => (
              <SportTile
                key={sport.name}
                name={sport.name}
                emoji={sport.emoji}
                selected={activeSport === sport.name}
                onPress={() => handleSportPress(sport.name)}
                mode="filter"
                style={{ ...styles.sportTile, transform: [{ rotate: i % 2 === 0 ? "-2deg" : "2deg" }] }}
              />
            ))}
          </ScrollView>

          <SectionHeader title="Nearby Games" onSeeAll={handleSeeAll} />

          {loading ? (
            <ActivityIndicator color={t.title} style={{ marginTop: 30 }} />
          ) : games.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📅</Text>
              <Text style={[styles.emptyTitle, { color: COLORS.rust }]}>No games nearby yet</Text>
              <Text style={[styles.emptyText, { color: t.subtitle }]}>Be the first to create one!</Text>
              <Pressable
                style={({ pressed }) => [styles.createOneBtn, pressed && { opacity: 0.85 }]}
                onPress={() => router.push("/create")}
              >
                <Text style={styles.createOneText}>Create One</Text>
              </Pressable>
            </View>
          ) : (
            games.slice(0, 5).map((game, i) => (
              <Animated.View key={game.id} entering={FadeInDown.delay(i * 70).duration(400)}>
                <MatchTicketCard
                  game={game}
                  onPress={() => router.push({ pathname: "/game-details", params: { id: String(game.id) } })}
                />
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  const { theme: t } = useThemeContext();
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionBar} />
        <Text style={[styles.sectionTitle, { color: t.title }]}>{title}</Text>
      </View>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} style={[styles.seeAllPill, { borderColor: t.border }]}>
          <Text style={styles.seeAll}>See all →</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingBottom: 24 },
  header: {
    backgroundColor: COLORS.salmon,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: { flex: 1 },
  greeting: { fontSize: 14, color: COLORS.ink, opacity: 0.8, marginBottom: 4 },
  userName: {
    fontSize: 27,
    fontWeight: "800",
    color: COLORS.ink,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: -0.5,
  },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.butter,
    borderWidth: 1,
    borderColor: COLORS.ink,
  },
  location: { fontSize: 13, color: COLORS.ink, opacity: 0.8 },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.butter,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.hard,
  },
  profileIcon: { fontSize: 20 },
  searchBar: {
    height: 52,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.ink,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchBarInner: { flex: 1, flexDirection: "row", alignItems: "center" },
  searchIcon: { fontSize: 22, color: COLORS.muted, marginRight: 8 },
  searchPlaceholder: { flex: 1, fontSize: 14 },
  aiBadge: {
    backgroundColor: COLORS.butter,
    borderWidth: 1,
    borderColor: COLORS.ink,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  aiText: { color: COLORS.ink, fontSize: 11, fontWeight: "800" },
  contentArea: { paddingHorizontal: 18, paddingTop: 22 },
  board: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statTile: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    ...SHADOWS.hard,
  },
  statValue: { fontSize: 28, fontWeight: "800", color: COLORS.ink, letterSpacing: -1 },
  statLabel: { fontSize: 11, fontWeight: "700", color: COLORS.ink, opacity: 0.75, textTransform: "uppercase", marginTop: 2 },
  actions: { flexDirection: "row", gap: 12, marginBottom: 26 },
  actionCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: RADII.card,
    padding: 14,
    ...SHADOWS.hard,
  },
  actionHost: { backgroundColor: COLORS.butter, borderColor: COLORS.ink },
  pressedDown: { transform: [{ translateY: 3 }], shadowOffset: { width: 0, height: 0 }, elevation: 0 },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    transform: [{ rotate: "-6deg" }],
  },
  actionIconText: { fontSize: 18, fontWeight: "800", color: COLORS.ink },
  actionTitle: { fontSize: 15, fontWeight: "800", color: COLORS.ink, textTransform: "uppercase" },
  actionSub: { fontSize: 12, color: COLORS.ink, opacity: 0.7, marginTop: 3 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionBar: { width: 6, height: 20, borderRadius: 3, backgroundColor: COLORS.rust },
  seeAllPill: { borderWidth: 2, borderRadius: RADII.chip, paddingHorizontal: 10, paddingVertical: 4 },
  seeAll: { color: COLORS.rust, fontSize: 12, fontWeight: "800" },
  sportsRow: { paddingTop: 6, paddingBottom: 26, paddingHorizontal: 4, gap: 12 },
  sportTile: {
    width: 88,
    height: 88,
    paddingVertical: 10,
  },
  emptyState: { alignItems: "center", paddingTop: 50 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginTop: 12, textTransform: "uppercase" },
  emptyText: { fontSize: 13, marginTop: 6 },
  createOneBtn: {
    marginTop: 18,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: RADII.button,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.butter,
    ...SHADOWS.hard,
  },
  createOneText: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: "800",
    textTransform: "uppercase",
  },
});
