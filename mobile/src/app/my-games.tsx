import { StyleSheet, Text, View } from "react-native";

export default function MyGamesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Games</Text>
      <Text style={styles.subtitle}>
        Your upcoming and previous games.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
  },
});