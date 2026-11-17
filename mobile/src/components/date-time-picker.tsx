// Calendar + time picker popups for the Create Game form.
// Pure React Native (no extra libraries). Values use the same text formats the form
// already sends: date "dd/mm/yyyy", time "hh:mm AM/PM".

import { useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS, RADII, SHADOWS } from "@/theme/tokens";
import { useThemeContext } from "@/context/ThemeContext";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const pad = (n: number) => String(n).padStart(2, "0");

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function formatDate(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function parseDate(value: string): Date | null {
  const [dd, mm, yyyy] = value.split("/").map(Number);
  if (!dd || !mm || !yyyy) return null;
  return new Date(yyyy, mm - 1, dd);
}

/* ---------------------------------- Sheet shell ---------------------------------- */
function Sheet({ visible, title, onClose, children }: { visible: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const { theme: t } = useThemeContext();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: t.card, borderTopColor: t.border }]} onPress={() => {}}>
          <View style={[styles.handle, { backgroundColor: t.title }]} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: t.title }]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} style={[styles.closeBtn, { borderColor: t.border }]}>
              <Text style={[styles.closeText, { color: t.title }]}>✕</Text>
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ---------------------------------- Date picker ---------------------------------- */
export function DatePickerModal({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const { theme: t } = useThemeContext();
  const today = startOfDay(new Date());
  const selected = parseDate(value);
  const [view, setView] = useState(() => {
    const base = selected ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const canGoBack = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth());

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
  const quick = [
    { label: "Today", date: today },
    { label: "Tomorrow", date: tomorrow },
    { label: "This Sat", date: saturday },
  ];

  function pick(d: Date) {
    onSelect(formatDate(d));
    onClose();
  }

  return (
    <Sheet visible={visible} title="Pick a date" onClose={onClose}>
      <View style={styles.quickRow}>
        {quick.map((q) => {
          const active = selected?.getTime() === q.date.getTime();
          return (
            <Pressable
              key={q.label}
              onPress={() => pick(q.date)}
              style={[styles.quickChip, { borderColor: t.border, backgroundColor: active ? COLORS.butter : t.card }]}
            >
              <Text style={[styles.quickText, { color: active ? COLORS.ink : t.title }]}>{q.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.monthRow}>
        <Pressable
          disabled={!canGoBack}
          onPress={() => setView(new Date(year, month - 1, 1))}
          style={[styles.navBtn, { borderColor: t.border, opacity: canGoBack ? 1 : 0.3 }]}
        >
          <Text style={[styles.navText, { color: t.title }]}>‹</Text>
        </Pressable>
        <Text style={[styles.monthText, { color: t.title }]}>
          {MONTHS[month]} {year}
        </Text>
        <Pressable onPress={() => setView(new Date(year, month + 1, 1))} style={[styles.navBtn, { borderColor: t.border }]}>
          <Text style={[styles.navText, { color: t.title }]}>›</Text>
        </Pressable>
      </View>

      <View style={styles.grid}>
        {WEEKDAYS.map((w, i) => (
          <View key={`w${i}`} style={styles.cell}>
            <Text style={[styles.weekday, { color: t.subtitle }]}>{w}</Text>
          </View>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <View key={`e${i}`} style={styles.cell} />;
          const date = new Date(year, month, day);
          const isPast = date < today;
          const isToday = date.getTime() === today.getTime();
          const isSelected = selected?.getTime() === date.getTime();
          return (
            <View key={`d${day}`} style={styles.cell}>
              <Pressable
                disabled={isPast}
                onPress={() => pick(date)}
                style={[
                  styles.day,
                  isToday && !isSelected && { borderColor: COLORS.rust, borderWidth: 2 },
                  isSelected && [styles.daySelected, { backgroundColor: t.title, borderColor: t.title }],
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: isSelected ? t.card : t.title },
                    isPast && { color: t.placeholder, opacity: 0.45 },
                  ]}
                >
                  {day}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </Sheet>
  );
}

/* ---------------------------------- Time picker ---------------------------------- */
const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 15, 30, 45];

function parseTime(value: string) {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return { hour: 6, minute: 0, period: "PM" as const };
  const minute = Number(m[2]);
  return {
    hour: Math.min(12, Math.max(1, Number(m[1]))),
    minute: MINUTES.includes(minute) ? minute : 0,
    period: (m[3].toUpperCase() === "AM" ? "AM" : "PM") as "AM" | "PM",
  };
}

export function TimePickerModal({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const { theme: t } = useThemeContext();
  const initial = parseTime(value);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(initial.period);

  const label = `${pad(hour)}:${pad(minute)} ${period}`;

  function chip(active: boolean) {
    return [
      styles.timeChip,
      { borderColor: t.border, backgroundColor: active ? t.title : t.card },
    ];
  }

  return (
    <Sheet visible={visible} title="Pick a time" onClose={onClose}>
      <View style={styles.clockFace}>
        <Text style={styles.clockText}>{label}</Text>
      </View>

      <Text style={[styles.groupLabel, { color: t.subtitle }]}>Hour</Text>
      <View style={styles.hourGrid}>
        {HOURS.map((h) => (
          <Pressable key={h} onPress={() => setHour(h)} style={[chip(hour === h), styles.hourChip]}>
            <Text style={[styles.timeChipText, { color: hour === h ? t.card : t.title }]}>{h}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.groupLabel, { color: t.subtitle }]}>Minutes</Text>
      <View style={styles.row}>
        {MINUTES.map((m) => (
          <Pressable key={m} onPress={() => setMinute(m)} style={[chip(minute === m), styles.flexChip]}>
            <Text style={[styles.timeChipText, { color: minute === m ? t.card : t.title }]}>:{pad(m)}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.periodSegment, { borderColor: t.border }]}>
        {(["AM", "PM"] as const).map((p) => (
          <Pressable
            key={p}
            onPress={() => setPeriod(p)}
            style={[styles.periodItem, period === p && { backgroundColor: COLORS.butter }]}
          >
            <Text style={[styles.periodText, { color: period === p ? COLORS.ink : t.subtitle }]}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [styles.doneBtn, pressed && { transform: [{ translateY: 3 }], shadowOpacity: 0, elevation: 0 }]}
        onPress={() => {
          onSelect(label);
          onClose();
        }}
      >
        <Text style={styles.doneText}>Set time · {label}</Text>
      </Pressable>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: {
    borderTopWidth: 3,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 34,
  },
  handle: { width: 44, height: 5, borderRadius: 3, alignSelf: "center", opacity: 0.25, marginBottom: 12 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  sheetTitle: { fontSize: 20, fontWeight: "800", textTransform: "uppercase", letterSpacing: -0.3 },
  closeBtn: { width: 32, height: 32, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  closeText: { fontSize: 14, fontWeight: "800" },

  quickRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  quickChip: { flex: 1, borderWidth: 2, borderRadius: RADII.chip, paddingVertical: 8, alignItems: "center" },
  quickText: { fontSize: 12, fontWeight: "800", textTransform: "uppercase" },

  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  navBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  navText: { fontSize: 22, fontWeight: "800", marginTop: -3 },
  monthText: { fontSize: 16, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  weekday: { fontSize: 12, fontWeight: "800" },
  day: { width: "84%", height: "84%", borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 0 },
  daySelected: { borderWidth: 2, transform: [{ rotate: "-4deg" }], ...SHADOWS.hard },
  dayText: { fontSize: 14, fontWeight: "700" },

  clockFace: {
    alignSelf: "center",
    backgroundColor: COLORS.ink,
    borderWidth: 2,
    borderColor: COLORS.ink,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 8,
    marginBottom: 6,
    transform: [{ rotate: "-2deg" }],
  },
  clockText: { color: COLORS.butter, fontSize: 30, fontWeight: "800", letterSpacing: 2 },
  groupLabel: { fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginTop: 14, marginBottom: 8 },
  hourGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  hourChip: { width: "14.6%" },
  row: { flexDirection: "row", gap: 8 },
  flexChip: { flex: 1 },
  timeChip: { height: 42, borderWidth: 2, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  timeChipText: { fontSize: 15, fontWeight: "800" },
  periodSegment: { flexDirection: "row", borderWidth: 2, borderRadius: 14, overflow: "hidden", marginTop: 16 },
  periodItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
  periodText: { fontSize: 14, fontWeight: "800" },
  doneBtn: {
    marginTop: 18,
    height: 54,
    borderRadius: RADII.button,
    borderWidth: 2,
    borderColor: COLORS.ink,
    backgroundColor: COLORS.butter,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.hard,
  },
  doneText: { color: COLORS.ink, fontSize: 16, fontWeight: "800", textTransform: "uppercase" },
});
