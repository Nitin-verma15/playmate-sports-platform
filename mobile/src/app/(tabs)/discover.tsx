import { useMemo, useState } from "react";
import { router } from "expo-router";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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

const sportOptions = ["All", "Football", "Cricket", "Basketball", "Badminton"];
const sportEmojis: Record<string, string> = {
  All: "🏅",
  Football: "⚽",
  Cricket: "🏏",
  Basketball: "🏀",
  Badminton: "🏸",
};

const skillOptions = ["All", "Beginner", "Intermediate", "Advanced"];
const skillColors: Record<string, { text: string; bg: string }> = {
  All:          { text: "#475569", bg: "#F1F5F9" },
  Beginner:     { text: "#16A34A", bg: "#E8F5E9" },
  Intermediate: { text: "#D97706", bg: "#FEF3C7" },
  Advanced:     { text: "#DC2626", bg: "#FEE2E2" },
};

const distanceOptions = [1, 3, 5, 10];

const timeOptions = ["Any", "Morning", "Afternoon", "Evening", "Night"];
const timeRanges: Record<string, string> = {
  Morning:   "6:00 AM – 12:00 PM",
  Afternoon: "12:00 PM – 5:00 PM",
  Evening:   "5:00 PM – 9:00 PM",
  Night:     "9:00 PM – late",
};

const sportColors: Record<string, { text: string; bg: string }> = {
  Football:   { text: "#2563EB", bg: "#EAF1FF" },
  Cricket:    { text: "#16A34A", bg: "#E8F5E9" },
  Basketball: { text: "#D97706", bg: "#FEF3C7" },
  Badminton:  { text: "#7C3AED", bg: "#F3E8FF" },
};

type ActiveDropdown = "sport" | "skill" | "distance" | "time" | null;

export default function DiscoverScreen() {
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [selectedTime, setSelectedTime] = useState("Any");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);

  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();
    return games.filter((game) => {
      const matchesSearch =
        query.length === 0 ||
        game.title.toLowerCase().includes(query) ||
        game.sport.toLowerCase().includes(query) ||
        game.venue.toLowerCase().includes(query);
      const matchesSport = selectedSport === "All" || game.sport === selectedSport;
      const matchesSkill = selectedSkill === "All" || game.skill === selectedSkill;
      const matchesDistance = game.distance <= selectedDistance;
      return matchesSearch && matchesSport && matchesSkill && matchesDistance;
    });
  }, [search, selectedSport, selectedSkill, selectedDistance]);

  function closeDropdown() {
    setActiveDropdown(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Discover Games</Text>
            <Text style={styles.subtitle}>Find nearby games that match you.</Text>
          </View>
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>📍</Text>
          </View>
        </View>

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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <FilterChip
            label={selectedSport === "All" ? "Sport" : selectedSport}
            active={selectedSport !== "All"}
            onPress={() => setActiveDropdown(activeDropdown === "sport" ? null : "sport")}
          />
          <FilterChip
            label={selectedSkill === "All" ? "Skill" : selectedSkill}
            active={selectedSkill !== "All"}
            onPress={() => setActiveDropdown(activeDropdown === "skill" ? null : "skill")}
          />
          <FilterChip
            label={selectedDistance === 10 ? "Distance" : `${selectedDistance} km`}
            active={selectedDistance !== 10}
            onPress={() => setActiveDropdown(activeDropdown === "distance" ? null : "distance")}
          />
          <FilterChip
            label={selectedTime === "Any" ? "Time" : selectedTime}
            active={selectedTime !== "Any"}
            onPress={() => setActiveDropdown(activeDropdown === "time" ? null : "time")}
          />
        </ScrollView>

        <View style={styles.resultHeader}>
          <Text style={styles.resultCount}>
            {filteredGames.length} {filteredGames.length === 1 ? "game" : "games"} found
          </Text>
          <View style={styles.viewToggle}>
            <Pressable
              style={[styles.viewButton, viewMode === "list" && styles.viewButtonActive]}
              onPress={() => setViewMode("list")}
            >
              <Text style={[styles.viewButtonText, viewMode === "list" && styles.viewButtonTextActive]}>
                ☷ List
              </Text>
            </Pressable>
            <Pressable
              style={[styles.viewButton, viewMode === "map" && styles.viewButtonActive]}
              onPress={() => setViewMode("map")}
            >
              <Text style={[styles.viewButtonText, viewMode === "map" && styles.viewButtonTextActive]}>
                ▣ Map
              </Text>
            </Pressable>
          </View>
        </View>

        {viewMode === "list" && filteredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}

        {viewMode === "map" && (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapEmoji}>🗺️</Text>
            <Text style={styles.mapTitle}>Map View</Text>
            <Text style={styles.mapText}>Google Maps integration coming in W7.</Text>
          </View>
        )}

        {viewMode === "list" && filteredGames.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔎</Text>
            <Text style={styles.emptyTitle}>No games found</Text>
            <Text style={styles.emptyText}>Try changing your search or filters.</Text>
          </View>
        )}
      </ScrollView>

      <DropdownModal
        visible={activeDropdown === "sport"}
        title="Select Sport"
        onClose={closeDropdown}
      >
        {sportOptions.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.dropdownItem, selectedSport === s && styles.dropdownItemActive]}
            onPress={() => { setSelectedSport(s); closeDropdown(); }}
          >
            <Text style={styles.dropdownItemEmoji}>{sportEmojis[s]}</Text>
            <Text style={[styles.dropdownItemText, selectedSport === s && styles.dropdownItemTextActive]}>
              {s === "All" ? "All Sports" : s}
            </Text>
            {selectedSport === s && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </DropdownModal>

      <DropdownModal
        visible={activeDropdown === "skill"}
        title="Select Skill Level"
        onClose={closeDropdown}
      >
        {skillOptions.map((s) => {
          const sc = skillColors[s];
          return (
            <TouchableOpacity
              key={s}
              style={[styles.dropdownItem, selectedSkill === s && styles.dropdownItemActive]}
              onPress={() => { setSelectedSkill(s); closeDropdown(); }}
            >
              <View style={[styles.skillDot, { backgroundColor: sc.bg }]}>
                <Text style={[styles.skillDotText, { color: sc.text }]}>
                  {s === "All" ? "★" : s[0]}
                </Text>
              </View>
              <View style={styles.dropdownItemInfo}>
                <Text style={[styles.dropdownItemText, selectedSkill === s && styles.dropdownItemTextActive]}>
                  {s === "All" ? "All Levels" : s}
                </Text>
                {s !== "All" && (
                  <Text style={styles.dropdownItemSub}>
                    {s === "Beginner" && "Just starting out"}
                    {s === "Intermediate" && "Know the basics"}
                    {s === "Advanced" && "Competitive level"}
                  </Text>
                )}
              </View>
              {selectedSkill === s && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </DropdownModal>

      <DropdownModal
        visible={activeDropdown === "distance"}
        title="Max Distance"
        onClose={closeDropdown}
      >
        {distanceOptions.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.dropdownItem, selectedDistance === d && styles.dropdownItemActive]}
            onPress={() => { setSelectedDistance(d); closeDropdown(); }}
          >
            <Text style={styles.dropdownItemEmoji}>📍</Text>
            <Text style={[styles.dropdownItemText, selectedDistance === d && styles.dropdownItemTextActive]}>
              Within {d} km
            </Text>
            {selectedDistance === d && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </DropdownModal>

      <DropdownModal
        visible={activeDropdown === "time"}
        title="Time of Day"
        onClose={closeDropdown}
      >
        {timeOptions.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.dropdownItem, selectedTime === t && styles.dropdownItemActive]}
            onPress={() => { setSelectedTime(t); closeDropdown(); }}
          >
            <Text style={styles.dropdownItemEmoji}>
              {t === "Any" ? "🕐" : t === "Morning" ? "🌅" : t === "Afternoon" ? "☀️" : t === "Evening" ? "🌆" : "🌙"}
            </Text>
            <View style={styles.dropdownItemInfo}>
              <Text style={[styles.dropdownItemText, selectedTime === t && styles.dropdownItemTextActive]}>
                {t === "Any" ? "Any Time" : t}
              </Text>
              {t !== "Any" && (
                <Text style={styles.dropdownItemSub}>{timeRanges[t]}</Text>
              )}
            </View>
            {selectedTime === t && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </DropdownModal>
    </SafeAreaView>
  );
}

function DropdownModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          {children}
          <TouchableOpacity style={styles.clearBtn} onPress={onClose}>
            <Text style={styles.clearBtnText}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <View pointerEvents="none" style={styles.filterChipInner}>
        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
          {label} ▾
        </Text>
      </View>
    </Pressable>
  );
}

function GameCard({ game }: { game: Game }) {
  const isFull = game.players >= game.maxPlayers;
  const progress = (game.players / game.maxPlayers) * 100;
  const sc = sportColors[game.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
  const skc = skillColors[game.skill] ?? { text: "#64748B", bg: "#F1F5F9" };

  return (
    <Pressable
      style={styles.gameCard}
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
        📅 {game.date}   •   🕐 {game.time}   •   📍 {game.distance} km
      </Text>

      <View style={styles.gameFooter}>
        <View style={[styles.skillBadge, { backgroundColor: skc.bg }]}>
          <Text style={[styles.skillText, { color: skc.text }]}>{game.skill}</Text>
        </View>
        <View>
          <Text style={styles.playerCount}>{game.players}/{game.maxPlayers} players</Text>
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
  safeArea: { flex: 1, backgroundColor: "#F7F9FC" },
  container: { paddingHorizontal: 16, paddingBottom: 28 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  title: { fontSize: 26, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 5, fontSize: 13, color: "#64748B" },
  locationBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#E8F0FF", alignItems: "center", justifyContent: "center" },
  locationText: { fontSize: 18 },

  searchContainer: {
    height: 52, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0",
    borderRadius: 15, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, marginBottom: 14,
  },
  searchIcon: { fontSize: 24, color: "#64748B", marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },

  filterRow: { paddingBottom: 18, gap: 8 },
  filterChip: {
    paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0",
  },
  filterChipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  filterChipInner: { flexDirection: "row", alignItems: "center" },
  filterChipText: { fontSize: 12, color: "#475569", fontWeight: "600" },
  filterChipTextActive: { color: "#fff" },

  resultHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  resultCount: { fontSize: 12, color: "#64748B", fontWeight: "600" },
  viewToggle: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#E2E8F0", overflow: "hidden" },
  viewButton: { paddingHorizontal: 10, paddingVertical: 7 },
  viewButtonActive: { backgroundColor: "#2563EB" },
  viewButtonText: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  viewButtonTextActive: { color: "#fff" },

  gameCard: { backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", padding: 14, marginBottom: 13 },
  gameHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 9 },
  sportBadge: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 },
  sportBadgeText: { fontSize: 11, fontWeight: "700" },
  gameIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  gameIconText: { fontSize: 20 },
  gameTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  infoText: { fontSize: 12, color: "#64748B", marginBottom: 5 },
  gameFooter: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  skillBadge: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5 },
  skillText: { fontSize: 11, fontWeight: "700" },
  playerCount: { fontSize: 11, color: "#475569", textAlign: "right", marginBottom: 4 },
  progressBackground: { width: 70, height: 5, borderRadius: 5, backgroundColor: "#E5E7EB", overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 5, backgroundColor: "#F59E0B" },
  fullProgressBar: { backgroundColor: "#DC2626" },
  fullText: { fontSize: 9, color: "#DC2626", fontWeight: "700", textAlign: "right", marginTop: 3 },

  mapPlaceholder: { height: 430, borderRadius: 20, backgroundColor: "#E9F0DD", alignItems: "center", justifyContent: "center", padding: 30, borderWidth: 1, borderColor: "#D8E2C5" },
  mapEmoji: { fontSize: 42, marginBottom: 12 },
  mapTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937" },
  mapText: { textAlign: "center", marginTop: 8, fontSize: 13, color: "#64748B", lineHeight: 19 },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 70 },
  emptyEmoji: { fontSize: 35, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  emptyText: { marginTop: 6, fontSize: 13, color: "#64748B" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 12 },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 12,
  },
  dropdownItemActive: { backgroundColor: "#F8FAFF" },
  dropdownItemEmoji: { fontSize: 22, width: 32, textAlign: "center" },
  dropdownItemInfo: { flex: 1 },
  dropdownItemText: { fontSize: 15, color: "#374151", fontWeight: "600" },
  dropdownItemTextActive: { color: "#2563EB" },
  dropdownItemSub: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  checkmark: { fontSize: 16, color: "#2563EB", fontWeight: "700" },

  skillDot: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  skillDotText: { fontSize: 13, fontWeight: "700" },

  clearBtn: {
    marginTop: 16,
    height: 50,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
