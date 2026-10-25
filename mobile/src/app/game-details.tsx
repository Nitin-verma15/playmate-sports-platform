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
import { COLORS, RADII, SHADOWS, SPORT_COLORS, SPORT_EMOJIS } from "@/theme/tokens";
import { SportTag } from "@/components/ui";

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
        <ActivityIndicator color={COLORS.ink} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!game) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: t.title }]}>Game not found</Text>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.85 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isFull = game.current_players >= game.max_players;
  const emoji = SPORT_EMOJIS[game.sport] ?? "⚽";
  const accent = SPORT_COLORS[game.sport] ?? COLORS.track;
  const dateStr = new Date(game.scheduled_at).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = new Date(game.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const initials = game.organizer_name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() ?? "??";
  const playerPct = (game.current_players / game.max_players) * 100;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {/* Salmon header with sport accent strip */}
      <View style={styles.hero}>
        <View style={[styles.accentStrip, { backgroundColor: accent }]} />

        <Pressable
          style={({ pressed }) => [styles.backRow, pressed && { opacity: 0.85 }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>

        <View style={styles.heroContent}>
          <Text style={styles.heroEmoji}>{emoji}</Text>
          <Text style={styles.heroTitle}>{game.title}</Text>
          <SportTag sport={game.sport} emoji={emoji} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ marginTop: 24 }}>
          {game.description ? (
            <Text style={[styles.description, { color: t.subtitle }]}>{game.description}</Text>
          ) : (
            <Text style={[styles.description, { color: t.subtitle }]}>
              Join a local {game.sport.toLowerCase()} game and meet other players with similar interests and skill levels.
            </Text>
          )}
        </View>

        <View style={[styles.infoCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <InfoRow icon="📍" label="Venue" value={game.venue} />
          <InfoRow icon="📅" label="Date" value={dateStr} />
          <InfoRow icon="🕐" label="Time" value={timeStr} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.title }]}>Skill Level</Text>
          <View style={[styles.skillBadge, { borderColor: COLORS.ink }]}>
            <Text style={[styles.skillText, { color: t.title }]}>{game.skill_level}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.playerHeader}>
            <Text style={[styles.sectionTitle, { color: t.title }]}>Players</Text>
            <Text style={[styles.playerCount, { color: t.title }]}>{game.current_players}/{game.max_players}</Text>
          </View>
          <View style={[styles.progressBackground, { borderColor: COLORS.ink }]}>
            <View style={[styles.progressBar, { width: `${playerPct}%` as any }]} />
          </View>
          <Text style={[styles.playerText, { color: t.subtitle }]}>
            {isFull ? "This game is currently full." : `${game.max_players - game.current_players} slots available`}
          </Text>
        </View>

        <View style={[styles.organizerCard, { backgroundColor: t.card, borderColor: t.border }]}>
          <View style={styles.organizerAvatar}>
            <Text style={styles.organizerAvatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={[styles.organizerLabel, { color: t.subtitle }]}>Organized by</Text>
            <Text style={[styles.organizerName, { color: t.title }]}>{game.organizer_name}</Text>
          </View>
        </View>

        <Pressable
          onPress={handleJoin}
          disabled={joining || isFull}
          style={({ pressed }) => [
            styles.joinButton,
            { backgroundColor: isFull ? COLORS.ink : COLORS.butter },
            pressed && !isFull && !joining && { transform: [{ translateY: 3 }] },
          ]}
        >
          {joining ? (
            <ActivityIndicator color={COLORS.card} />
          ) : (
            <Text style={[styles.joinButtonText, { color: isFull ? COLORS.card : COLORS.ink }]}>
              {isFull ? "Join Waitlist" : "Join Game ✓"}
            </Text>
          )}
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
        <Text style={[styles.infoLabel, { color: t.subtitle }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: t.title }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },
  hero: {
    backgroundColor: COLORS.salmon,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: "relative",
  },
  accentStrip: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    borderTopWidth: 2,
    borderTopColor: COLORS.ink,
  },
  backRow: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.ink,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.hard,
  },
  backArrow: {
    fontSize: 28,
    lineHeight: 30,
    color: COLORS.card,
    fontWeight: "800",
    marginTop: -4,
  },
  heroContent: { alignItems: "center", marginTop: 16 },
  heroEmoji: { fontSize: 52, marginBottom: 8 },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.ink,
    textAlign: "center",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: -0.3,
  },
  container: { padding: 16, paddingBottom: 32 },
  description: { fontSize: 14, lineHeight: 21, marginBottom: 4 },
  infoCard: {
    borderRadius: RADII.card,
    borderWidth: 2,
    marginTop: 20,
    padding: 16,
    ...SHADOWS.hard,
  },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  infoIcon: { width: 34, fontSize: 17 },
  infoLabel: { fontSize: 11, marginBottom: 2, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  infoValue: { fontSize: 14, fontWeight: "700" },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 9, textTransform: "uppercase", letterSpacing: 0.3 },
  skillBadge: {
    alignSelf: "flex-start",
    borderRadius: RADII.chip,
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillText: { fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  playerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 9 },
  playerCount: { fontSize: 14, fontWeight: "800" },
  progressBackground: {
    height: 10,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: COLORS.track,
    overflow: "hidden",
  },
  progressBar: { height: "100%", backgroundColor: COLORS.butter },
  playerText: { marginTop: 7, fontSize: 12 },
  organizerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADII.card,
    borderWidth: 2,
    padding: 14,
    marginTop: 20,
    ...SHADOWS.hard,
  },
  organizerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  organizerAvatarText: { color: COLORS.card, fontWeight: "800", fontSize: 13 },
  organizerLabel: { fontSize: 11, marginBottom: 2, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  organizerName: { fontSize: 14, fontWeight: "800" },
  joinButton: {
    height: 54,
    borderRadius: RADII.button,
    borderWidth: 2,
    borderColor: COLORS.ink,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    ...SHADOWS.hard,
  },
  joinButtonText: { fontSize: 16, fontWeight: "800", textTransform: "uppercase" },
  errorContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  errorTitle: { fontSize: 20, fontWeight: "800", marginBottom: 15, textTransform: "uppercase" },
  backButton: {
    backgroundColor: COLORS.ink,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backButtonText: { color: COLORS.card, fontWeight: "800", textTransform: "uppercase" },
});
