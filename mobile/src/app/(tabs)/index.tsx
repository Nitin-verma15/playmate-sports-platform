import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";

type Game = {
  id: string;
  sport: string;
  emoji: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  distance: string;
  skill: "Beginner" | "Intermediate" | "Advanced";
  players: number;
  maxPlayers: number;
};

const sports = [
  { name: "Football",   emoji: "⚽", color: "#2563EB", bg: "#EAF1FF" },
  { name: "Cricket",    emoji: "🏏", color: "#16A34A", bg: "#E8F5E9" },
  { name: "Basketball", emoji: "🏀", color: "#D97706", bg: "#FEF3C7" },
  { name: "Badminton",  emoji: "🏸", color: "#7C3AED", bg: "#F3E8FF" },
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
  Badminton:  { text: "#7C3AED", bg: "#F3E8FF" },
  Tennis:     { text: "#EA580C", bg: "#FEF0E7" },
};

const games: Game[] = [
  {
    id: "1",
    sport: "Football",
    emoji: "⚽",
    title: "Sunday Kickabout",
    venue: "Central Park Ground A",
    date: "Sun, 14 Sep",
    time: "4:00 PM",
    distance: "0.8 km",
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
    distance: "1.2 km",
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
    distance: "2.1 km",
    skill: "Intermediate",
    players: 8,
    maxPlayers: 12,
  },
];

function GameCard({ game }: { game: Game }) {
  const isFull = game.players >= game.maxPlayers;
  const sc = sportColors[game.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
  const skc = skillColors[game.skill] ?? { text: "#64748B", bg: "#F1F5F9" };
  const progress = (game.players / game.maxPlayers) * 100;

  return (
    <Pressable
      style={({ pressed }) => [styles.gameCard, pressed && styles.cardPressed]}
      onPress={() => router.push({ pathname: "/game-details", params: { id: game.id } })}
    >
      <View style={styles.gameHeader}>
        <View style={[styles.sportBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.sportBadgeText, { color: sc.text }]}>
            {game.emoji} {game.sport}
          </Text>
        </View>
        <View style={[styles.gameIcon, { backgroundColor: sc.bg }]}>
          <Text style={styles.gameIconText}>{game.emoji}</Text>
        </View>
      </View>

      <Text style={styles.gameTitle}>{game.title}</Text>
      <Text style={styles.infoText}>📍 {game.venue}</Text>
      <Text style={styles.infoText}>
        📅 {game.date}   •   🕐 {game.time}   •   📍 {game.distance}
      </Text>

      <View style={styles.gameFooter}>
        <View style={[styles.skillBadge, { backgroundColor: skc.bg }]}>
          <Text style={[styles.skillText, { color: skc.text }]}>{game.skill}</Text>
        </View>

        <View>
          <Text style={styles.playerCount}>
            {game.players}/{game.maxPlayers} players
          </Text>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                { width: `${progress}%` },
                isFull && { backgroundColor: "#DC2626" },
              ]}
            />
          </View>
          {isFull && <Text style={styles.fullText}>FULL</Text>}
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [activeSport, setActiveSport] = useState<string | null>(null);

  function handleSportPress(sportName: string) {
    setActiveSport(sportName);
    // navigate to discover with sport filter pre-selected
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good afternoon 👋</Text>
            <Text style={styles.userName}>Arjun Mehta</Text>
            <Text style={styles.location}>📍 Koramangala, Bangalore</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.profileButton, pressed && styles.cardPressed]}
            onPress={handleProfilePress}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </Pressable>
        </View>

        {/* Search bar - tapping opens AI Search */}
        <Pressable
          style={({ pressed }) => [styles.searchBar, pressed && styles.cardPressed]}
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

        {/* Sports */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sports</Text>
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
                style={[
                  styles.sportCard,
                  isActive && { borderColor: sport.color, borderWidth: 2 },
                ]}
                onPress={() => handleSportPress(sport.name)}
              >
                <View style={[styles.sportIconBg, { backgroundColor: sport.bg }]}>
                  <Text style={styles.sportEmoji}>{sport.emoji}</Text>
                </View>
                <Text style={[styles.sportName, isActive && { color: sport.color }]}>
                  {sport.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Nearby games */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Games</Text>
          <Pressable onPress={handleSeeAll}>
            <Text style={styles.seeAll}>See all →</Text>
          </Pressable>
        </View>

        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  userName: {
    fontSize: 27,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  location: {
    fontSize: 13,
    color: "#5B6573",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DCE8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  profileIcon: {
    fontSize: 20,
  },

  searchBar: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  seeAll: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },

  sportsRow: {
    paddingBottom: 24,
  },
  sportCard: {
    width: 92,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sportIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },
  sportEmoji: {
    fontSize: 26,
  },
  sportName: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },

  gameCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    color: "#111827",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#64748B",
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
});
