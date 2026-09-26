import { useMemo, useState } from "react";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const sports = ["All", "Football", "Cricket", "Basketball", "Badminton"];
const skills = ["All", "Beginner", "Intermediate", "Advanced"];
const distances = [1, 3, 5, 10];

export default function DiscoverScreen() {
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();

    return games.filter((game) => {
      const matchesSearch =
        query.length === 0 ||
        game.title.toLowerCase().includes(query) ||
        game.sport.toLowerCase().includes(query) ||
        game.venue.toLowerCase().includes(query);

      const matchesSport =
        selectedSport === "All" || game.sport === selectedSport;

      const matchesSkill =
        selectedSkill === "All" || game.skill === selectedSkill;

      const matchesDistance = game.distance <= selectedDistance;

      return (
        matchesSearch &&
        matchesSport &&
        matchesSkill &&
        matchesDistance
      );
    });
  }, [search, selectedSport, selectedSkill, selectedDistance]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Discover Games</Text>
            <Text style={styles.subtitle}>
              Find nearby games that match you.
            </Text>
          </View>

          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>📍</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search games near you..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FilterButton
            label={selectedSport === "All" ? "Sport" : selectedSport}
            active={selectedSport !== "All"}
            onPress={() => {
              const currentIndex = sports.indexOf(selectedSport);
              const nextIndex = (currentIndex + 1) % sports.length;
              setSelectedSport(sports[nextIndex]);
            }}
          />

          <FilterButton
            label={selectedSkill === "All" ? "Skill" : selectedSkill}
            active={selectedSkill !== "All"}
            onPress={() => {
              const currentIndex = skills.indexOf(selectedSkill);
              const nextIndex = (currentIndex + 1) % skills.length;
              setSelectedSkill(skills[nextIndex]);
            }}
          />

          <FilterButton
            label={`Distance ${selectedDistance} km`}
            active={selectedDistance !== 10}
            onPress={() => {
              const currentIndex = distances.indexOf(selectedDistance);
              const nextIndex = (currentIndex + 1) % distances.length;
              setSelectedDistance(distances[nextIndex]);
            }}
          />

          <FilterButton
            label="Time"
            onPress={() => {}}
          />
        </ScrollView>

        {/* Result header */}
        <View style={styles.resultHeader}>
          <Text style={styles.resultCount}>
            {filteredGames.length}{" "}
            {filteredGames.length === 1 ? "game" : "games"} found
          </Text>

          <View style={styles.viewToggle}>
            <Pressable
              style={[
                styles.viewButton,
                viewMode === "list" && styles.selectedViewButton,
              ]}
              onPress={() => setViewMode("list")}
            >
              <Text
                style={[
                  styles.viewButtonText,
                  viewMode === "list" && styles.selectedViewButtonText,
                ]}
              >
                ☷ List
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.viewButton,
                viewMode === "map" && styles.selectedViewButton,
              ]}
              onPress={() => setViewMode("map")}
            >
              <Text
                style={[
                  styles.viewButtonText,
                  viewMode === "map" && styles.selectedViewButtonText,
                ]}
              >
                ▣ Map
              </Text>
            </Pressable>
          </View>
        </View>

        {/* List view */}
        {viewMode === "list" &&
          filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}

        {/* Temporary map state */}
        {viewMode === "map" && (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapEmoji}>🗺️</Text>
            <Text style={styles.mapTitle}>Map View</Text>
            <Text style={styles.mapText}>
              Google Maps integration will be added later.
            </Text>
          </View>
        )}

        {/* Empty state */}
        {viewMode === "list" && filteredGames.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyTitle}>No games found</Text>
            <Text style={styles.emptyText}>
              Try changing your search or filters.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterButton({
  label,
  active = false,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterButton, active && styles.activeFilterButton]}
    >
      <Text
        style={[
          styles.filterButtonText,
          active && styles.activeFilterButtonText,
        ]}
      >
        {label} ▾
      </Text>
    </Pressable>
  );
}

function GameCard({ game }: { game: Game }) {
  const isFull = game.players >= game.maxPlayers;
  const progress = (game.players / game.maxPlayers) * 100;

  return (
   <Pressable
  style={styles.gameCard}
  onPress={() =>
    router.push({
      pathname: "/game-details",
      params: { id: game.id },
    })
  }
>
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
        📅 {game.date}   •   🕐 {game.time}   •   📍 {game.distance} km
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
                { width: `${progress}%` },
                isFull && styles.fullProgressBar,
              ]}
            />
          </View>

          {isFull && <Text style={styles.fullText}>FULL</Text>}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  container: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: "#64748B",
  },

  locationBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E8F0FF",
    alignItems: "center",
    justifyContent: "center",
  },

  locationText: {
    fontSize: 18,
  },

  searchContainer: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 14,
  },

  searchIcon: {
    fontSize: 24,
    color: "#64748B",
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },

  filterRow: {
    paddingBottom: 18,
    gap: 8,
  },

  filterButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  activeFilterButton: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  filterButtonText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },

  activeFilterButtonText: {
    color: "#FFFFFF",
  },

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  resultCount: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },

  viewButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  selectedViewButton: {
    backgroundColor: "#2563EB",
  },

  viewButtonText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },

  selectedViewButtonText: {
    color: "#FFFFFF",
  },

  gameCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 13,
  },

  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

  sportBadge: {
    backgroundColor: "#EAF1FF",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
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
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
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
    borderRadius: 5,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#F59E0B",
  },

  fullProgressBar: {
    backgroundColor: "#DC2626",
  },

  fullText: {
    fontSize: 9,
    color: "#DC2626",
    fontWeight: "700",
    textAlign: "right",
    marginTop: 3,
  },

  mapPlaceholder: {
    height: 430,
    borderRadius: 20,
    backgroundColor: "#E9F0DD",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
    borderWidth: 1,
    borderColor: "#D8E2C5",
  },

  mapEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },

  mapTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },

  mapText: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
  },

  emptyEmoji: {
    fontSize: 35,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
  },
});