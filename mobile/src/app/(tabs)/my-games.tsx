import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

type TabKey = "Upcoming" | "Joined" | "Created" | "History";

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
  status: "upcoming" | "full" | "completed" | "cancelled";
  role: "joined" | "created";
};

// dummy data - will be replaced with API calls
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
    status: "upcoming",
    role: "joined",
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
    status: "full",
    role: "joined",
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
    status: "upcoming",
    role: "created",
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
    players: 4,
    maxPlayers: 4,
    status: "completed",
    role: "joined",
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
    status: "upcoming",
    role: "created",
  },
  {
    id: "6",
    sport: "Cricket",
    emoji: "🏏",
    title: "IIT Bangalore Cricket",
    venue: "IIT Bangalore Ground",
    date: "Thu, 11 Sep",
    time: "8:00 AM",
    distance: 1.8,
    skill: "Advanced",
    players: 12,
    maxPlayers: 12,
    status: "completed",
    role: "created",
  },
];

function getGamesForTab(tab: TabKey): Game[] {
  switch (tab) {
    case "Upcoming":
      return allGames.filter((g) => g.status === "upcoming");
    case "Joined":
      return allGames.filter((g) => g.role === "joined");
    case "Created":
      return allGames.filter((g) => g.role === "created");
    case "History":
      return allGames.filter((g) => g.status === "completed" || g.status === "cancelled");
  }
}

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

const tabs: TabKey[] = ["Upcoming", "Joined", "Created", "History"];

export default function MyGamesScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("Upcoming");
  const games = getGamesForTab(activeTab);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>My Games</Text>
      </View>

      <View style={styles.tabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {games.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPress={() => router.push({ pathname: "/game-details", params: { id: game.id } })}
            />
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function GameCard({ game, onPress }: { game: Game; onPress: () => void }) {
  const isFull = game.players >= game.maxPlayers;
  const isCompleted = game.status === "completed";
  const progress = (game.players / game.maxPlayers) * 100;
  const sc = sportColors[game.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
  const skc = skillColors[game.skill];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.sportBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.sportBadgeText, { color: sc.text }]}>
            {game.emoji} {game.sport}
          </Text>
        </View>
        <View style={styles.cardRight}>
          {isCompleted && (
            <View style={styles.playedBadge}>
              <Text style={styles.playedText}>PLAYED</Text>
            </View>
          )}
          <View style={[styles.emojiBox, { backgroundColor: sc.bg }]}>
            <Text style={styles.emojiText}>{game.emoji}</Text>
          </View>
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
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  tabTextActive: { color: "#fff" },

  list: { paddingHorizontal: 16, paddingTop: 4 },

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
  cardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  playedBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
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
