import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import api from "../../services/api";
import { auth } from "../../config/firebase";
import { useThemeContext } from "../../context/ThemeContext";

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

const sportEmojis: Record<string, string> = {
  Football: "⚽", Cricket: "🏏", Basketball: "🏀", Badminton: "🏸", Tennis: "🎾",
};

const sports = [
  { name: "Football",   emoji: "⚽", gradient: ["#1E40AF", "#2563EB"] as [string, string] },
  { name: "Cricket",    emoji: "🏏", gradient: ["#065F46", "#059669"] as [string, string] },
  { name: "Basketball", emoji: "🏀", gradient: ["#92400E", "#D97706"] as [string, string] },
  { name: "Badminton",  emoji: "🏸", gradient: ["#0369A1", "#0EA5E9"] as [string, string] },
  { name: "Tennis",     emoji: "🎾", gradient: ["#C2410C", "#EA580C"] as [string, string] },
];

const skillColors: Record<string, { text: string; bg: string }> = {
  Beginner:     { text: "#16A34A", bg: "#E8F5E9" },
  Intermediate: { text: "#D97706", bg: "#FEF3C7" },
  Advanced:     { text: "#DC2626", bg: "#FEE2E2" },
};

const sportColors: Record<string, { text: string; bg: string }> = {
  Football:   { text: "#2563EB", bg: "#EAF1FF" },
  Cricket:    { text: "#16A34A", bg: "#E8F5E9" },
  Basketball: { text: "#D97706", bg: "#FEF3C7" },
  Badminton:  { text: "#0369A1", bg: "#E0F2FE" },
  Tennis:     { text: "#EA580C", bg: "#FEF0E7" },
};

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};

function GameCard({ game }: { game: Game }) {
  const { theme: t } = useThemeContext();
  const isFull = game.current_players >= game.max_players;
  const sc = sportColors[game.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
  const skc = skillColors[game.skill_level] ?? { text: "#64748B", bg: "#F1F5F9" };
  const progress = (game.current_players / game.max_players) * 100;
  const sportEmoji = sportEmojis[game.sport] ?? "🏅";
  const dateStr = new Date(game.scheduled_at).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
  });
  const timeStr = new Date(game.scheduled_at).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <View style={[styles.cardWrapper, { borderLeftColor: sc.text }, cardShadow]}>
      <Pressable
        style={({ pressed }) => [styles.gameCard, { backgroundColor: t.card }, pressed && styles.cardPressed]}
        onPress={() => router.push({ pathname: "/game-details", params: { id: String(game.id) } })}
      >
        <View style={styles.gameHeader}>
          <View style={[styles.sportBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.sportBadgeText, { color: sc.text }]}>
              {sportEmoji} {game.sport}
            </Text>
          </View>
          <View style={[styles.gameIcon, { backgroundColor: sc.bg }]}>
            <Text style={styles.gameIconText}>{sportEmoji}</Text>
          </View>
        </View>

        <Text style={[styles.gameTitle, { color: t.title }]}>{game.title}</Text>
        <Text style={[styles.infoText, { color: t.subtitle }]}>📍 {game.venue}</Text>
        <Text style={[styles.infoText, { color: t.subtitle }]}>📅 {dateStr}  •  🕐 {timeStr}</Text>
        <Text style={[styles.infoText, { color: t.subtitle }]}>👤 {game.organizer_name}</Text>

        <View style={styles.gameFooter}>
          <View style={[styles.skillBadge, { backgroundColor: skc.bg }]}>
            <Text style={[styles.skillText, { color: skc.text }]}>{game.skill_level}</Text>
          </View>
          <View>
            <Text style={styles.playerCount}>{game.current_players}/{game.max_players} players</Text>
            <View style={styles.progressBackground}>
              <View style={[styles.progressBar, { width: `${progress}%` as any }, isFull && { backgroundColor: "#DC2626" }]} />
            </View>
            {isFull && <Text style={styles.fullText}>FULL</Text>}
          </View>
        </View>
      </Pressable>
    </View>
  );
}


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
        {/* Gradient Header */}
        <LinearGradient
          colors={["#1D4ED8", "#0EA5E9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Good afternoon 👋</Text>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.location}>📍 Koramangala, Bangalore</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.profileButton, pressed && { opacity: 0.7 }]}
              onPress={handleProfilePress}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </Pressable>
          </View>

          {/* Search bar inside gradient */}
          <Pressable
            style={({ pressed }) => [styles.searchBar, pressed && { opacity: 0.9 }]}
            onPress={handleSearchPress}
            android_ripple={{ color: "#E2E8F0" }}
          >
            <View pointerEvents="none" style={styles.searchBarInner}>
              <Text style={styles.searchIcon}>⌕</Text>
              <Text style={styles.searchPlaceholder}>What do you want to play?</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiText}>✨ AI</Text>
              </View>
            </View>
          </Pressable>
        </LinearGradient>

        <View style={styles.contentArea}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.title }]}>Sports</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sportsRow}
          >
            {sports.map((sport) => {
              const isActive = activeSport === sport.name;
              return (
                <Pressable
                  key={sport.name}
                  style={[styles.sportCardWrapper, isActive && styles.sportCardActive]}
                  onPress={() => handleSportPress(sport.name)}
                >
                  <LinearGradient
                    colors={sport.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sportCard}
                  >
                    <Text style={styles.sportEmoji}>{sport.emoji}</Text>
                    <Text style={styles.sportName}>{sport.name}</Text>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.title }]}>Nearby Games</Text>
            <Pressable onPress={handleSeeAll}>
              <Text style={styles.seeAll}>See all →</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color="#2563EB" style={{ marginTop: 30 }} />
          ) : games.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 48 }}>🏅</Text>
              <Text style={{ fontSize: 24, marginTop: -8 }}>⚽</Text>
              <Text style={{ fontSize: 36, marginTop: -12 }}>🏀</Text>
              <Text style={[styles.emptyTitle, { color: t.title }]}>No games nearby yet</Text>
              <Text style={[styles.emptyText, { color: t.subtitle }]}>Be the first to create one!</Text>
              <Pressable onPress={() => router.push("/create")} style={{ marginTop: 18 }}>
                <LinearGradient
                  colors={["#1D4ED8", "#0EA5E9"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.createBtn}
                >
                  <Text style={styles.createBtnText}>+ Create a Game</Text>
                </LinearGradient>
              </Pressable>
            </View>
          ) : (
            games.slice(0, 5).map((game) => (
              <GameCard key={game.id} game={game} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    paddingBottom: 24,
  },
  gradientHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 4,
  },
  userName: {
    fontSize: 27,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 6,
  },
  location: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    fontSize: 20,
  },
  searchBar: {
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.95)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  searchBarInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    fontSize: 25,
    color: "#64748B",
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    color: "#94A3B8",
    fontSize: 14,
  },
  aiBadge: {
    backgroundColor: "#E9F0FF",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  aiText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "700",
  },
  contentArea: {
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  seeAll: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },
  sportsRow: {
    paddingBottom: 24,
  },
  sportCardWrapper: {
    marginRight: 12,
    borderRadius: 18,
    overflow: "hidden",
  },
  sportCardActive: {
    opacity: 0.85,
  },
  sportCard: {
    width: 92,
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  sportEmoji: {
    fontSize: 28,
    marginBottom: 7,
    color: "#fff",
  },
  sportName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  cardWrapper: {
    borderLeftWidth: 4,
    borderRadius: 18,
    marginBottom: 14,
    overflow: "hidden",
  },
  gameCard: {
    borderRadius: 18,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.85,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },
  sportBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  sportBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  gameIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gameIconText: {
    fontSize: 20,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    marginBottom: 5,
  },
  gameFooter: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  skillBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  skillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  playerCount: {
    fontSize: 11,
    color: "#475569",
    textAlign: "right",
    marginBottom: 4,
  },
  progressBackground: {
    width: 70,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 5,
  },
  fullText: {
    fontSize: 9,
    color: "#DC2626",
    fontWeight: "700",
    textAlign: "right",
    marginTop: 3,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    marginTop: 6,
  },
  createBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
