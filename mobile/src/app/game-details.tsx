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
  Badminton:  { text: "#7C3AED", bg: "#F3E8FF" },
  Tennis:     { text: "#EA580C", bg: "#FEF0E7" },
};

const skillColors: Record<string, { text: string; bg: string }> = {
  Beginner:     { text: "#16A34A", bg: "#E8F5E9" },
  Intermediate: { text: "#D97706", bg: "#FEF3C7" },
  Advanced:     { text: "#DC2626", bg: "#FEE2E2" },
};

export default function GameDetailsScreen() {
  const { theme: t } = useThemeContext();
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
  const dateStr = new Date(game.scheduled_at).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = new Date(game.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const initials = game.organizer_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "??";

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <Text style={[styles.backArrow, { color: t.title }]}>‹</Text>
          <Text style={[styles.backText, { color: t.title }]}>Back</Text>
        </Pressable>

        <View style={[styles.heroIcon, { backgroundColor: sc.bg }]}>
          <Text style={styles.heroEmoji}>{emoji}</Text>
        </View>

        <View style={[styles.sportBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.sportBadgeText, { color: sc.text }]}>{emoji} {game.sport}</Text>
        </View>

        <Text style={[styles.title, { color: t.title }]}>{game.title}</Text>

        {game.description ? (
          <Text style={[styles.description, { color: t.subtitle }]}>{game.description}</Text>
        ) : (
          <Text style={[styles.description, { color: t.subtitle }]}>
            Join a local {game.sport.toLowerCase()} game and meet other players with similar interests and skill levels.
          </Text>
        )}

        <View style={[styles.infoCard, { backgroundColor: t.card, borderColor: t.border }]}>
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
            <View
              style={[
                styles.progressBar,
                { width: `${(game.current_players / game.max_players) * 100}%` },
                isFull && styles.fullProgressBar,
              ]}
            />
          </View>
          <Text style={[styles.playerText, { color: t.subtitle }]}>
            {isFull ? "This game is currently full." : `${game.max_players - game.current_players} slots available`}
          </Text>
        </View>

        <View style={[styles.organizerCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.organizerLabel}>Organized by</Text>
            <Text style={[styles.organizerName, { color: t.title }]}>{game.organizer_name}</Text>
          </View>
        </View>

        <Pressable
          style={[styles.joinButton, (isFull || joining) && styles.disabledButton]}
          disabled={joining}
          onPress={handleJoin}
        >
          {joining ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.joinButtonText}>
              {isFull ? "Join Waitlist" : "Join Game"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  container: { padding: 16, paddingBottom: 32 },
  backRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  backArrow: { fontSize: 30, lineHeight: 30, color: "#111827", marginRight: 5 },
  backText: { fontSize: 14, fontWeight: "600", color: "#334155" },
  heroIcon: { width: 72, height: 72, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  heroEmoji: { fontSize: 36 },
  sportBadge: { alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 9 },
  sportBadgeText: { fontSize: 11, fontWeight: "700" },
  title: { fontSize: 28, fontWeight: "700", color: "#111827" },
  description: { marginTop: 9, fontSize: 14, lineHeight: 21, color: "#64748B" },
  infoCard: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", marginTop: 20, padding: 15 },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  infoIcon: { width: 34, fontSize: 17 },
  infoLabel: { fontSize: 11, color: "#94A3B8", marginBottom: 2 },
  infoValue: { fontSize: 14, color: "#334155", fontWeight: "600" },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 9 },
  skillBadge: { alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 11, paddingVertical: 6 },
  skillText: { fontSize: 11, fontWeight: "700" },
  playerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  playerCount: { fontSize: 14, color: "#334155", fontWeight: "700" },
  progressBackground: { height: 8, borderRadius: 8, backgroundColor: "#E2E8F0", overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 8, backgroundColor: "#F59E0B" },
  fullProgressBar: { backgroundColor: "#DC2626" },
  playerText: { marginTop: 7, fontSize: 12, color: "#64748B" },
  organizerCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", padding: 14, marginTop: 20 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginRight: 11 },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  organizerLabel: { fontSize: 11, color: "#94A3B8" },
  organizerName: { fontSize: 14, color: "#111827", fontWeight: "700", marginTop: 2 },
  joinButton: { height: 52, borderRadius: 15, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginTop: 20 },
  disabledButton: { backgroundColor: "#94A3B8" },
  joinButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  errorTitle: { fontSize: 20, fontWeight: "700", color: "#111827", marginBottom: 15 },
  backButton: { backgroundColor: "#2563EB", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  backButtonText: { color: "#fff", fontWeight: "700" },
});
