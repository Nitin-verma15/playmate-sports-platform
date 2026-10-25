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
import api from "../../services/api";
import { auth } from "../../config/firebase";
import { useThemeContext } from "../../context/ThemeContext";
import { COLORS, RADII, SHADOWS } from "@/theme/tokens";
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
              <Text style={styles.greeting}>Good afternoon 👋</Text>
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.title }]}>Sports</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sportsRow}
          >
            {sports.map((sport) => (
              <SportTile
                key={sport.name}
                name={sport.name}
                emoji={sport.emoji}
                selected={activeSport === sport.name}
                onPress={() => handleSportPress(sport.name)}
                mode="filter"
                style={styles.sportTile}
              />
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.title }]}>Nearby Games</Text>
            <Pressable onPress={handleSeeAll}>
              <Text style={styles.seeAll}>See all →</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color={COLORS.ink} style={{ marginTop: 30 }} />
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
            games.slice(0, 5).map((game) => (
              <MatchTicketCard
                key={game.id}
                game={game}
                onPress={() => router.push({ pathname: "/game-details", params: { id: String(game.id) } })}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  contentArea: { paddingHorizontal: 18, paddingTop: 20 },
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
  seeAll: { color: COLORS.rust, fontSize: 13, fontWeight: "700" },
  sportsRow: { paddingBottom: 24, gap: 12 },
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
