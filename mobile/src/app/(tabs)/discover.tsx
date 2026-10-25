import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import api from "../../services/api";
import { useThemeContext } from "../../context/ThemeContext";
import { COLORS, RADII, SPORT_COLORS, SPORT_EMOJIS } from "@/theme/tokens";
import { ChalkPitchLines } from "@/components/ui";
import { MatchTicketCard } from "@/components/match-ticket-card";

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
  latitude?: number;
  longitude?: number;
};

const sportOptions = ["All", "Football", "Cricket", "Basketball", "Badminton"];
const sportEmojis: Record<string, string> = {
  All: "🏅", Football: "⚽", Cricket: "🏏", Basketball: "🏀", Badminton: "🏸",
};

const skillOptions = ["All", "Beginner", "Intermediate", "Advanced"];

const distanceOptions = [1, 3, 5, 10];

const timeOptions = ["Any", "Morning", "Afternoon", "Evening", "Night"];
const timeRanges: Record<string, string> = {
  Morning: "6:00 AM – 12:00 PM",
  Afternoon: "12:00 PM – 5:00 PM",
  Evening: "5:00 PM – 9:00 PM",
  Night: "9:00 PM – late",
};

function buildMapHtml(games: Game[]): string {
  const markers = games.map((g) => {
    const emoji = SPORT_EMOJIS[g.sport] ?? "⚽";
    const color = SPORT_COLORS[g.sport] ?? COLORS.track;
    return `
      L.marker([${Number(g.latitude)}, ${Number(g.longitude)}], {
        icon: L.divIcon({
          html: '<div style="background:${color};color:${COLORS.ink};border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid ${COLORS.ink};box-shadow:0 3px 0 ${COLORS.ink}">${emoji}</div>',
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
      })
        .addTo(map)
        .bindPopup(\`
          <div style="min-width:180px;font-family:sans-serif;padding:4px">
            <div style="font-size:14px;font-weight:800;color:${COLORS.ink};margin-bottom:4px;text-transform:uppercase">${g.title}</div>
            <div style="font-size:12px;color:${COLORS.muted};margin-bottom:2px">📍 ${g.venue}</div>
            <div style="font-size:12px;color:${COLORS.muted};margin-bottom:8px">${g.current_players}/${g.max_players} players · ${g.skill_level}</div>
            <button onclick="window.ReactNativeWebView.postMessage(JSON.stringify({gameId:${g.id}}))"
              style="background:${COLORS.butter};color:${COLORS.ink};border:2px solid ${COLORS.ink};border-radius:10px;padding:8px 0;font-size:13px;font-weight:800;width:100%;cursor:pointer;text-transform:uppercase">
              View Game →
            </button>
          </div>
        \`);
    `;
  }).join("\n");

  const center = games.length > 0
    ? [Number(games[0].latitude), Number(games[0].longitude)]
    : [12.9716, 77.5946];

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { width:100vw; height:100vh; overflow:hidden; background:${COLORS.track}; }
    #map { width:100%; height:100%; }
    .leaflet-popup-content-wrapper { border-radius:12px; border:2px solid ${COLORS.ink}; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([${center[0]}, ${center[1]}], 14);
    L.tileLayer('https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=d21e96b7605e4f4d86e71ddb5ee8de53', {
      maxZoom: 20,
      attribution: '© Geoapify © OpenStreetMap'
    }).addTo(map);
    ${markers}
    ${games.length > 1 ? `
    var bounds = L.latLngBounds([${games.map(g => `[${Number(g.latitude)}, ${Number(g.longitude)}]`).join(',')}]);
    map.fitBounds(bounds, { padding: [40, 40] });
    ` : ''}
  </script>
</body>
</html>`;
}

type ActiveDropdown = "sport" | "skill" | "distance" | "time" | null;

export default function DiscoverScreen() {
  const { theme: t } = useThemeContext();
  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [selectedDistance, setSelectedDistance] = useState(10);
  const [selectedTime, setSelectedTime] = useState("Any");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGames = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (selectedSport !== "All") params.sport = selectedSport;
      if (selectedSkill !== "All") params.skill = selectedSkill;
      if (search.trim()) params.search = search.trim();

      const res = await api.get("/games", { params });
      setGames(res.data.games || []);
    } catch {
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSport, selectedSkill, search]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchGames();
    setRefreshing(false);
  }

  function closeDropdown() {
    setActiveDropdown(null);
  }

  const filteredGames = games.filter((game) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      game.title.toLowerCase().includes(query) ||
      game.sport.toLowerCase().includes(query) ||
      game.venue.toLowerCase().includes(query);
    return matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Salmon header */}
        <View style={styles.header}>
          <ChalkPitchLines />
          <Text style={styles.headerTitle}>Discover Games</Text>
          <Text style={styles.headerSubtitle}>Find nearby games that match you.</Text>
        </View>

        <View style={styles.contentArea}>
          <View style={[styles.searchContainer, { backgroundColor: t.card, borderColor: COLORS.ink }]}>
            <Text style={styles.searchIcon}>⌕</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search games near you..."
              placeholderTextColor={t.placeholder}
              style={[styles.searchInput, { color: t.inputText }]}
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
            <Text style={[styles.resultCount, { color: t.subtitle }]}>
              {loading ? "Loading..." : `${filteredGames.length} ${filteredGames.length === 1 ? "game" : "games"} found`}
            </Text>
            <View style={[styles.viewToggle, { borderColor: COLORS.ink }]}>
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

          {loading ? (
            <ActivityIndicator color={COLORS.ink} style={{ marginTop: 40 }} />
          ) : viewMode === "list" ? (
            filteredGames.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔎</Text>
                <Text style={[styles.emptyTitle, { color: t.title }]}>No games found</Text>
                <Text style={[styles.emptyText, { color: t.subtitle }]}>Try changing your search or filters.</Text>
              </View>
            ) : (
              filteredGames.map((game) => (
                <MatchTicketCard
                  key={game.id}
                  game={game}
                  onPress={() => router.push({ pathname: "/game-details", params: { id: String(game.id) } })}
                />
              ))
            )
          ) : (
            <View style={styles.mapContainer}>
              <WebView
                style={styles.map}
                originWhitelist={["*"]}
                javaScriptEnabled
                domStorageEnabled
                onMessage={(e) => {
                  try {
                    const data = JSON.parse(e.nativeEvent.data);
                    if (data.gameId) {
                      router.push({ pathname: "/game-details", params: { id: String(data.gameId) } });
                    }
                  } catch {}
                }}
                source={{
                  html: buildMapHtml(filteredGames.filter((g) => g.latitude && g.longitude)),
                }}
              />
              {filteredGames.filter((g) => g.latitude && g.longitude).length === 0 && (
                <View style={styles.mapEmptyOverlay}>
                  <Text style={styles.mapEmptyText}>No games with location data yet. Create a game to see it here.</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <DropdownModal visible={activeDropdown === "sport"} title="Select Sport" onClose={closeDropdown}>
        {sportOptions.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.dropdownItem, { borderBottomColor: t.rowBorder }, selectedSport === s && styles.dropdownItemActive]}
            onPress={() => { setSelectedSport(s); closeDropdown(); }}
          >
            <Text style={styles.dropdownItemEmoji}>{sportEmojis[s]}</Text>
            <Text style={[styles.dropdownItemText, { color: t.title }, selectedSport === s && styles.dropdownItemTextActive]}>
              {s === "All" ? "All Sports" : s}
            </Text>
            {selectedSport === s && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </DropdownModal>

      <DropdownModal visible={activeDropdown === "skill"} title="Select Skill Level" onClose={closeDropdown}>
        {skillOptions.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.dropdownItem, { borderBottomColor: t.rowBorder }, selectedSkill === s && styles.dropdownItemActive]}
            onPress={() => { setSelectedSkill(s); closeDropdown(); }}
          >
            <View style={styles.skillDot}>
              <Text style={styles.skillDotText}>{s === "All" ? "★" : s[0]}</Text>
            </View>
            <View style={styles.dropdownItemInfo}>
              <Text style={[styles.dropdownItemText, { color: t.title }, selectedSkill === s && styles.dropdownItemTextActive]}>
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
        ))}
      </DropdownModal>

      <DropdownModal visible={activeDropdown === "distance"} title="Max Distance" onClose={closeDropdown}>
        {distanceOptions.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.dropdownItem, { borderBottomColor: t.rowBorder }, selectedDistance === d && styles.dropdownItemActive]}
            onPress={() => { setSelectedDistance(d); closeDropdown(); }}
          >
            <Text style={styles.dropdownItemEmoji}>📍</Text>
            <Text style={[styles.dropdownItemText, { color: t.title }, selectedDistance === d && styles.dropdownItemTextActive]}>
              Within {d} km
            </Text>
            {selectedDistance === d && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </DropdownModal>

      <DropdownModal visible={activeDropdown === "time"} title="Time of Day" onClose={closeDropdown}>
        {timeOptions.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.dropdownItem, { borderBottomColor: t.rowBorder }, selectedTime === opt && styles.dropdownItemActive]}
            onPress={() => { setSelectedTime(opt); closeDropdown(); }}
          >
            <Text style={styles.dropdownItemEmoji}>
              {opt === "Any" ? "🕐" : opt === "Morning" ? "🌅" : opt === "Afternoon" ? "☀️" : opt === "Evening" ? "🌆" : "🌙"}
            </Text>
            <View style={styles.dropdownItemInfo}>
              <Text style={[styles.dropdownItemText, { color: t.title }, selectedTime === opt && styles.dropdownItemTextActive]}>
                {opt === "Any" ? "Any Time" : opt}
              </Text>
              {opt !== "Any" && <Text style={styles.dropdownItemSub}>{timeRanges[opt]}</Text>}
            </View>
            {selectedTime === opt && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </DropdownModal>
    </SafeAreaView>
  );
}

function DropdownModal({ visible, title, onClose, children }: {
  visible: boolean; title: string; onClose: () => void; children: React.ReactNode;
}) {
  const { theme: t } = useThemeContext();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalSheet, { backgroundColor: t.card }]} onPress={() => {}}>
          <View style={[styles.sheetHandle, { backgroundColor: t.title }]} />
          <Text style={[styles.sheetTitle, { color: t.title }]}>{title}</Text>
          {children}
          <TouchableOpacity style={styles.clearBtn} onPress={onClose}>
            <Text style={styles.clearBtnText}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, { backgroundColor: active ? COLORS.butter : COLORS.card, borderColor: COLORS.ink }]}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label} ▾</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { paddingBottom: 28 },
  header: {
    backgroundColor: COLORS.salmon,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 18,
    overflow: "hidden",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.ink,
    textTransform: "uppercase",
    letterSpacing: -0.3,
  },
  headerSubtitle: { marginTop: 2, fontSize: 12, color: COLORS.ink, opacity: 0.8 },
  contentArea: { paddingHorizontal: 16, paddingTop: 4 },
  searchContainer: {
    height: 52,
    borderWidth: 2,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginTop: 14,
    marginBottom: 14,
  },
  searchIcon: { fontSize: 22, color: COLORS.muted, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  filterRow: { paddingBottom: 18, gap: 8 },
  filterChip: {
    borderRadius: RADII.chip,
    borderWidth: 2,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  filterChipText: { fontSize: 12, fontWeight: "700", color: COLORS.muted },
  filterChipTextActive: { color: COLORS.ink, fontWeight: "800" },
  resultHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  resultCount: { fontSize: 12, fontWeight: "700" },
  viewToggle: { flexDirection: "row", borderRadius: 12, borderWidth: 2, overflow: "hidden" },
  viewButton: { paddingHorizontal: 12, paddingVertical: 7 },
  viewButtonActive: { backgroundColor: COLORS.butter },
  viewButtonText: { fontSize: 11, fontWeight: "700", color: COLORS.muted },
  viewButtonTextActive: { color: COLORS.ink, fontWeight: "800" },
  mapContainer: { height: 430, borderRadius: 16, overflow: "hidden", marginBottom: 13, borderWidth: 2, borderColor: COLORS.ink },
  map: { width: "100%", height: "100%" },
  mapEmptyOverlay: { position: "absolute", bottom: 20, left: 20, right: 20, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.ink, borderRadius: 12, padding: 12, alignItems: "center" },
  mapEmptyText: { fontSize: 13, color: COLORS.muted },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 70 },
  emptyEmoji: { fontSize: 35, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "800", textTransform: "uppercase" },
  emptyText: { marginTop: 6, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(43,38,34,0.45)", justifyContent: "flex-end" },
  modalSheet: { borderTopWidth: 3, borderTopColor: COLORS.ink, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: "800", marginBottom: 12, textTransform: "uppercase" },
  dropdownItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, gap: 12 },
  dropdownItemActive: { opacity: 1 },
  dropdownItemEmoji: { fontSize: 22, width: 32, textAlign: "center" },
  dropdownItemInfo: { flex: 1 },
  dropdownItemText: { fontSize: 15, fontWeight: "700" },
  dropdownItemTextActive: { color: COLORS.rust, fontWeight: "800" },
  dropdownItemSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  checkmark: { fontSize: 16, color: COLORS.ink, fontWeight: "800" },
  skillDot: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.track, borderWidth: 2, borderColor: COLORS.ink },
  skillDotText: { fontSize: 13, fontWeight: "800", color: COLORS.ink },
  clearBtn: { marginTop: 16, height: 50, backgroundColor: COLORS.butter, borderWidth: 2, borderColor: COLORS.ink, borderRadius: RADII.button, alignItems: "center", justifyContent: "center" },
  clearBtnText: { color: COLORS.ink, fontSize: 15, fontWeight: "800", textTransform: "uppercase" },
});
