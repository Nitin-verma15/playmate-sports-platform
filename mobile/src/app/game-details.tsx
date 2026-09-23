import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";

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
    distance: 0.8,
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
    distance: 1.2,
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
    distance: 2.1,
    skill: "Intermediate",
    players: 8,
    maxPlayers: 12,
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
    players: 3,
    maxPlayers: 4,
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
  },
];

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  const game = games.find((item) => item.id === id);

  if (!game) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Game not found</Text>

          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isFull = game.players >= game.maxPlayers;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.backRow}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.heroIcon}>
          <Text style={styles.heroEmoji}>{game.emoji}</Text>
        </View>

        <View style={styles.sportBadge}>
          <Text style={styles.sportBadgeText}>
            {game.emoji} {game.sport}
          </Text>
        </View>

        <Text style={styles.title}>{game.title}</Text>

        <Text style={styles.description}>
          Join a local {game.sport.toLowerCase()} game and meet
          other players with similar interests and skill levels.
        </Text>

        <View style={styles.infoCard}>
          <InfoRow icon="📍" label="Venue" value={game.venue} />
          <InfoRow icon="📅" label="Date" value={game.date} />
          <InfoRow icon="🕐" label="Time" value={game.time} />
          <InfoRow
            icon="📍"
            label="Distance"
            value={`${game.distance} km away`}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skill Level</Text>

          <View style={styles.skillBadge}>
            <Text style={styles.skillText}>{game.skill}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.playerHeader}>
            <Text style={styles.sectionTitle}>Players</Text>

            <Text style={styles.playerCount}>
              {game.players}/{game.maxPlayers}
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${(game.players / game.maxPlayers) * 100}%`,
                },
                isFull && styles.fullProgressBar,
              ]}
            />
          </View>

          <Text style={styles.playerText}>
            {isFull
              ? "This game is currently full."
              : `${game.maxPlayers - game.players} slots available`}
          </Text>
        </View>

        <View style={styles.organizerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AM</Text>
          </View>

          <View>
            <Text style={styles.organizerLabel}>Organized by</Text>
            <Text style={styles.organizerName}>Arjun Mehta</Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.joinButton,
            isFull && styles.disabledButton,
          ]}
          disabled={isFull}
          onPress={() => {}}
        >
          <Text style={styles.joinButtonText}>
            {isFull ? "Game Full" : "Join Game"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>

      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  container: {
    padding: 16,
    paddingBottom: 32,
  },

  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backArrow: {
    fontSize: 30,
    lineHeight: 30,
    color: "#111827",
    marginRight: 5,
  },

  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  heroEmoji: {
    fontSize: 36,
  },

  sportBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EAF1FF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 9,
  },

  sportBadgeText: {
    fontSize: 11,
    color: "#2563EB",
    fontWeight: "700",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  description: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 20,
    padding: 15,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },

  infoIcon: {
    width: 34,
    fontSize: 17,
  },

  infoLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
  },

  section: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 9,
  },

  skillBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  skillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803D",
  },

  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  playerCount: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "700",
  },

  progressBackground: {
    height: 8,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#F59E0B",
  },

  fullProgressBar: {
    backgroundColor: "#DC2626",
  },

  playerText: {
    marginTop: 7,
    fontSize: 12,
    color: "#64748B",
  },

  organizerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginTop: 20,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  avatarText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  organizerLabel: {
    fontSize: 11,
    color: "#94A3B8",
  },

  organizerName: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
    marginTop: 2,
  },

  joinButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  disabledButton: {
    backgroundColor: "#94A3B8",
  },

  joinButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 15,
  },

  backButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});