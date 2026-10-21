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
const skillColors: Record<string, { text: string; bg: string }> = {
  All:          { text: "#475569", bg: "#F1F5F9" },
  Beginner:     { text: "#16A34A", bg: "#E8F5E9" },
  Intermediate: { text: "#D97706", bg: "#FEF3C7" },
  Advanced:     { text: "#DC2626", bg: "#FEE2E2" },
};

const distanceOptions = [1, 3, 5, 10];

const timeOptions = ["Any", "Morning", "Afternoon", "Evening", "Night"];
const timeRanges: Record<string, string> = {
  Morning: "6:00 AM – 12:00 PM",
  Afternoon: "12:00 PM – 5:00 PM",
  Evening: "5:00 PM – 9:00 PM",
  Night: "9:00 PM – late",
};

const sportColors: Record<string, { text: string; bg: string }> = {
  Football:   { text: "#2563EB", bg: "#EAF1FF" },
  Cricket:    { text: "#16A34A", bg: "#E8F5E9" },
  Basketball: { text: "#D97706", bg: "#FEF3C7" },
  Badminton:  { text: "#7C3AED", bg: "#F3E8FF" },
  Tennis:     { text: "#EA580C", bg: "#FEF0E7" },
};

const sportEmojisMap: Record<string, string> = {
  Football: "⚽", Cricket: "🏏", Basketball: "🏀", Badminton: "🏸", Tennis: "🎾",
};

function buildMapHtml(games: Game[]): string {
  const markers = games.map((g) => {
    const emoji = sportEmojisMap[g.sport] ?? "🏅";
    return `
      L.marker([${Number(g.latitude)}, ${Number(g.longitude)}], {
        icon: L.divIcon({
          html: '<div style="background:#2563EB;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${emoji}</div>',
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
      })
        .addTo(map)
        .bindPopup(\`
          <div style="min-width:180px;font-family:sans-serif;padding:4px">
            <div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:4px">${g.title}</div>
            <div style="font-size:12px;color:#64748B;margin-bottom:2px">📍 ${g.venue}</div>
            <div style="font-size:12px;color:#64748B;margin-bottom:8px">${g.current_players}/${g.max_players} players · ${g.skill_level}</div>
            <button onclick="window.ReactNativeWebView.postMessage(JSON.stringify({gameId:${g.id}}))"
              style="background:#2563EB;color:#fff;border:none;border-radius:8px;padding:8px 0;font-size:13px;font-weight:600;width:100%;cursor:pointer">
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
    body { width:100vw; height:100vh; overflow:hidden; }
    #map { width:100%; height:100%; }
    .leaflet-popup-content-wrapper { border-radius:12px; }
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: t.bg }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: t.title }]}>Discover Games</Text>
            <Text style={[styles.subtitle, { color: t.subtitle }]}>Find nearby games that match you.</Text>
          </View>
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>📍</Text>
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: t.card, borderColor: t.border }]}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search games near you..."
            placeholderTextColor="#94A3B8"
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
          <View style={[styles.viewToggle, { backgroundColor: t.card, borderColor: t.border }]}>
            <Pressable
              style={[styles.viewButton, viewMode === "list" && styles.viewButtonActive]}
              onPress={() => setViewMode("list")}
            >
              <Text style={[styles.viewButtonText, { color: t.subtitle }, viewMode === "list" && styles.viewButtonTextActive]}>
                ☷ List
              </Text>
            </Pressable>
            <Pressable
              style={[styles.viewButton, viewMode === "map" && styles.viewButtonActive]}
              onPress={() => setViewMode("map")}
            >
              <Text style={[styles.viewButtonText, { color: t.subtitle }, viewMode === "map" && styles.viewButtonTextActive]}>
                ▣ Map
              </Text>
            </Pressable>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color="#2563EB" style={{ marginTop: 40 }} />
        ) : viewMode === "list" ? (
          filteredGames.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔎</Text>
              <Text style={[styles.emptyTitle, { color: t.title }]}>No games found</Text>
              <Text style={[styles.emptyText, { color: t.subtitle }]}>Try changing your search or filters.</Text>
            </View>
          ) : (
            filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
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
      </ScrollView>

      <DropdownModal visible={activeDropdown === "sport"} title="Select Sport" onClose={closeDropdown}>
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

      <DropdownModal visible={activeDropdown === "skill"} title="Select Skill Level" onClose={closeDropdown}>
        {skillOptions.map((s) => {
          const sc = skillColors[s];
          return (
            <TouchableOpacity
              key={s}
              style={[styles.dropdownItem, selectedSkill === s && styles.dropdownItemActive]}
              onPress={() => { setSelectedSkill(s); closeDropdown(); }}
            >
              <View style={[styles.skillDot, { backgroundColor: sc.bg }]}>
                <Text style={[styles.skillDotText, { color: sc.text }]}>{s === "All" ? "★" : s[0]}</Text>
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

      <DropdownModal visible={activeDropdown === "distance"} title="Max Distance" onClose={closeDropdown}>
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

      <DropdownModal visible={activeDropdown === "time"} title="Time of Day" onClose={closeDropdown}>
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
              {t !== "Any" && <Text style={styles.dropdownItemSub}>{timeRanges[t]}</Text>}
            </View>
            {selectedTime === t && <Text style={styles.checkmark}>✓</Text>}
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
          <View style={styles.sheetHandle} />
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
  const { theme: t } = useThemeContext();
  return (
    <Pressable onPress={onPress} style={[styles.filterChip, { backgroundColor: t.card, borderColor: t.border }, active && styles.filterChipActive]}>
      <View pointerEvents="none" style={styles.filterChipInner}>
        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label} ▾</Text>
      </View>
    </Pressable>
  );
}

function GameCard({ game }: { game: Game }) {
  const { theme: t } = useThemeContext();
  const isFull = game.current_players >= game.max_players;
  const progress = (game.current_players / game.max_players) * 100;
  const sc = sportColors[game.sport] ?? { text: "#2563EB", bg: "#EAF1FF" };
  const skc = skillColors[game.skill_level] ?? { text: "#64748B", bg: "#F1F5F9" };
  const emoji = sportEmojisMap[game.sport] ?? "🏅";
  const dateStr = new Date(game.scheduled_at).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const timeStr = new Date(game.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <Pressable
      style={[styles.gameCard, { backgroundColor: t.card, borderColor: t.border }]}
      onPress={() => router.push({ pathname: "/game-details", params: { id: String(game.id) } })}
    >
      <View style={styles.gameHeader}>
        <View style={[styles.sportBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.sportBadgeText, { color: sc.text }]}>{emoji} {game.sport}</Text>
        </View>
        <View style={[styles.gameIcon, { backgroundColor: sc.bg }]}>
          <Text style={styles.gameIconText}>{emoji}</Text>
        </View>
      </View>

      <Text style={[styles.gameTitle, { color: t.title }]}>{game.title}</Text>
      <Text style={[styles.infoText, { color: t.subtitle }]}>📍 {game.venue}</Text>
      <Text style={[styles.infoText, { color: t.subtitle }]}>📅 {dateStr}  •  🕐 {timeStr}</Text>

      <View style={styles.gameFooter}>
        <View style={[styles.skillBadge, { backgroundColor: skc.bg }]}>
          <Text style={[styles.skillText, { color: skc.text }]}>{game.skill_level}</Text>
        </View>
        <View>
          <Text style={styles.playerCount}>{game.current_players}/{game.max_players} players</Text>
          <View style={styles.progressBackground}>
            <View style={[styles.progressBar, { width: `${progress}%` }, isFull && styles.fullProgressBar]} />
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
  searchContainer: { height: 52, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 15, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, marginBottom: 14 },
  searchIcon: { fontSize: 24, color: "#64748B", marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#111827" },
  filterRow: { paddingBottom: 18, gap: 8 },
  filterChip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0" },
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
  mapContainer: { height: 430, borderRadius: 20, overflow: "hidden", marginBottom: 13 },
  map: { width: "100%", height: "100%" },
  markerPin: { backgroundColor: "#fff", borderRadius: 20, padding: 6, borderWidth: 2, borderColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  markerEmoji: { fontSize: 18 },
  callout: { width: 180, padding: 8 },
  calloutTitle: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 3 },
  calloutSub: { fontSize: 11, color: "#64748B", marginBottom: 2 },
  calloutLink: { fontSize: 11, color: "#2563EB", fontWeight: "600", marginTop: 4 },
  mapEmptyOverlay: { position: "absolute", bottom: 20, left: 20, right: 20, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 12, padding: 12, alignItems: "center" },
  mapEmptyText: { fontSize: 13, color: "#64748B" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 70 },
  emptyEmoji: { fontSize: 35, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  emptyText: { marginTop: 6, fontSize: 13, color: "#64748B" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: "#111827", marginBottom: 12 },
  dropdownItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 12 },
  dropdownItemActive: { backgroundColor: "#F8FAFF" },
  dropdownItemEmoji: { fontSize: 22, width: 32, textAlign: "center" },
  dropdownItemInfo: { flex: 1 },
  dropdownItemText: { fontSize: 15, color: "#374151", fontWeight: "600" },
  dropdownItemTextActive: { color: "#2563EB" },
  dropdownItemSub: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  checkmark: { fontSize: 16, color: "#2563EB", fontWeight: "700" },
  skillDot: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  skillDotText: { fontSize: 13, fontWeight: "700" },
  clearBtn: { marginTop: 16, height: 50, backgroundColor: "#2563EB", borderRadius: 14, alignItems: "center", justifyContent: "center" },
  clearBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
