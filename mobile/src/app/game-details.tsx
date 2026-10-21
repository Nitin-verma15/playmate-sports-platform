import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import api from "../services/api";
import { useThemeContext } from "../context/ThemeContext";

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
  description?: string;
};

const sportEmojis: Record<string, string> = {
  Football: "⚽", Cricket: "🏏", Basketball: "🏀", Badminton: "🏸", Tennis: "🎾",
};

const sportColors: Record<string, { text: string; bg: string }> = {
  Football:   { text: "#2563EB", bg: "#EAF1FF" },
  Cricket:    { text: "#16A34A", bg: "#E8F5E9" },
  Basketball: { text: "#D97706", bg: "#FEF3C7" },
  Badminton:  { text: "#0369A1", bg: "#E0F2FE" },
  Tennis:     { text: "#EA580C", bg: "#FEF0E7" },
};

const sportGradients: Record<string, [string, string]> = {
  Football:   ["#1E40AF", "#2563EB"],
  Cricket:    ["#065F46", "#059669"],
  Basketball: ["#92400E", "#D97706"],
  Badminton:  ["#0369A1", "#0EA5E9"],
  Tennis:     ["#C2410C", "#EA580C"],
};

const skillColors: Record<string, { text: string; bg: string }> = {
  Beginner:     { text: "#16A34A", bg: "#E8F5E9" },
  Intermediate: { text: "#D97706", bg: "#FEF3C7" },
  Advanced:     { text: "#DC2626", bg: "#FEE2E2" },
};

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};

export default function GameDetailsScreen() {
  const { theme: t, isDark } = useThemeContext();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/games/${id}`)
      .then((res) => setGame(res.data.game))
      .catch(() => setGame(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleJoin() {
    if (!game) return;
    setJoining(true);
    try {
      const res = await api.post(`/games/${game.id}/join`);
      if (res.data.status === "JOINED") {
        Alert.alert("Joined! 🎉", "You have successfully joined this game.");
        setGame((prev) => prev ? { ...prev, current_players: prev.current_players + 1 } : prev);
      } else if (res.data.status === "WAITLISTED") {
        Alert.alert("Waitlisted", `Game is full. You are #${res.data.position} on the waitlist.`);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.error?.message || "Could not join the game.";
      Alert.alert("Error", msg);
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]}>
        <ActivityIndicator color="#2563EB" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!game) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: t.title }]}>Game not found</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isFull = game.current_players >= game.max_players;
  const sc = sportColors[game.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
  const skc = skillColors[game.skill_level] ?? { text: "#64748B", bg: "#F1F5F9" };
  const emoji = sportEmojis[game.sport] ?? "🏅";
  const gradientColors = sportGradients[game.sport] ?? (["#1D4ED8", "#0EA5E9"] as [string, string]);
  const dateStr = new Date(game.scheduled_at).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = new Date(game.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const initials = game.organizer_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "??";
  const playerPct = (game.current_players / game.max_players) * 100;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {/* Hero gradient */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        {/* Back button */}
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* Hero content centered */}
        <View style={styles.heroContent}>
          <Text style={styles.heroEmoji}>{emoji}</Text>
          <Text style={styles.heroTitle}>{game.title}</Text>
          <View style={styles.sportBadgePill}>
            <Text style={styles.sportBadgePillText}>{emoji} {game.sport}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={{ marginTop: 24 }}>
          {game.description ? (
            <Text style={[styles.description, { color: t.subtitle }]}>{game.description}</Text>
          ) : (
            <Text style={[styles.description, { color: t.subtitle }]}>
              Join a local {game.sport.toLowerCase()} game and meet other players with similar interests and skill levels.
            </Text>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: t.card, borderColor: t.border }, cardShadow]}>
          <InfoRow icon="📍" label="Venue" value={game.venue} />
          <InfoRow icon="📅" label="Date" value={dateStr} />
          <InfoRow icon="🕐" label="Time" value={timeStr} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.title }]}>Skill Level</Text>
          <View style={[styles.skillBadge, { backgroundColor: skc.bg }]}>
            <Text style={[styles.skillText, { color: skc.text }]}>{game.skill_level}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.playerHeader}>
            <Text style={[styles.sectionTitle, { color: t.title }]}>Players</Text>
            <Text style={styles.playerCount}>{game.current_players}/{game.max_players}</Text>
          </View>
          <View style={styles.progressBackground}>
            <LinearGradient
              colors={isFull ? ["#EF4444", "#DC2626"] : ["#0EA5E9", "#06B6D4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarGradient, { width: (playerPct + "%") as any }]}
            />
          </View>
          <Text style={[styles.playerText, { color: t.subtitle }]}>
            {isFull ? "This game is currently full." : `${game.max_players - game.current_players} slots available`}
          </Text>
        </View>

        <View style={[styles.organizerCard, { backgroundColor: t.card, borderColor: t.border }, cardShadow]}>
          <LinearGradient
            colors={["#1D4ED8", "#0EA5E9"]}
            style={styles.organizerAvatar}
          >
            <Text style={styles.organizerAvatarText}>{initials}</Text>
          </LinearGradient>
          <View>
            <Text style={[styles.organizerLabel, { color: t.placeholder }]}>Organized by</Text>
            <Text style={[styles.organizerName, { color: t.title }]}>{game.organizer_name}</Text>
          </View>
        </View>

        <Pressable onPress={handleJoin} disabled={joining || isFull} style={{ marginTop: 20 }}>
          <LinearGradient
            colors={isFull ? ["#94A3B8", "#64748B"] : ["#1D4ED8", "#0EA5E9"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.joinButton}
          >
            {joining
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.joinButtonText}>{isFull ? "Join Waitlist" : "Join Game ✓"}</Text>
            }
          </LinearGradient>
        </Pressable>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { theme: t } = useThemeContext();
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View>
        <Text style={[styles.infoLabel, { color: t.placeholder }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: t.title }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  hero: {
    height: 220,
    paddingTop: 50,
    paddingHorizontal: 20,
    position: "relative",
  },
  backRow: {
    position: "absolute",
    top: 50,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  backArrow: {
    fontSize: 30,
    lineHeight: 30,
    color: "#fff",
    marginRight: 5,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  heroContent: {
    alignItems: "center",
    marginTop: 16,
  },
  heroEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  sportBadgePill: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  sportBadgePillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 4,
  },
  infoCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 20,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoIcon: {
    width: 34,
    fontSize: 17,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 9,
  },
  skillBadge: {
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  skillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },
  playerCount: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "700",
  },
  progressBackground: {
    height: 12,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressBarGradient: {
    height: "100%",
    borderRadius: 10,
  },
  playerText: {
    marginTop: 7,
    fontSize: 12,
  },
  organizerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginTop: 20,
  },
  organizerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  organizerAvatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  organizerLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  organizerName: {
    fontSize: 14,
    fontWeight: "700",
  },
  joinButton: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  joinButtonText: {
    color: "#fff",
    fontSize: 16,
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
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
});
