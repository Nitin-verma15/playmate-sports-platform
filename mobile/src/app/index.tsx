import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Game = {
  id: string;
  sport: string;
  emoji: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  distance: string;
  skill: string;
  players: number;
  maxPlayers: number;
};

const sports = [
  { name: "Football", emoji: "⚽" },
  { name: "Cricket", emoji: "🏏" },
  { name: "Basketball", emoji: "🏀" },
  { name: "Badminton", emoji: "🏸" },
];

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

  return (
    <Pressable style={styles.gameCard}>
      <View style={styles.gameHeader}>
        <View style={styles.sportBadge}>
          <Text style={styles.sportBadgeText}>
            {game.emoji} {game.sport}
          </Text>
        </View>

        <View style={styles.gameIcon}>
          <Text style={styles.gameIconText}>{game.emoji}</Text>
        </View>
      </View>

      <Text style={styles.gameTitle}>{game.title}</Text>

      <Text style={styles.infoText}>📍 {game.venue}</Text>
      <Text style={styles.infoText}>
        📅 {game.date}   •   🕐 {game.time}   •   📍 {game.distance}
      </Text>

      <View style={styles.gameFooter}>
        <View style={styles.skillBadge}>
          <Text style={styles.skillText}>{game.skill}</Text>
        </View>

        <View>
          <Text style={styles.playerCount}>
            {game.players}/{game.maxPlayers} players
          </Text>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${(game.players / game.maxPlayers) * 100}%`,
                },
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

          <View style={styles.profileButton}>
            <Text style={styles.profileIcon}>👤</Text>
          </View>
        </View>

        {/* Search */}
        <Pressable style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <Text style={styles.searchPlaceholder}>
            What do you want to play?
          </Text>

          <View style={styles.aiBadge}>
            <Text style={styles.aiText}>✨ AI</Text>
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
          {sports.map((sport) => (
            <Pressable key={sport.name} style={styles.sportCard}>
              <Text style={styles.sportEmoji}>{sport.emoji}</Text>
              <Text style={styles.sportName}>{sport.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Nearby games */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Games</Text>
          <Pressable>
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
    height: 92,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  sportEmoji: {
    fontSize: 28,
    marginBottom: 7,
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

  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

  sportBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EAF1FF",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  sportBadgeText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "700",
  },

  gameIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
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
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  skillText: {
    color: "#15803D",
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