import { View, Text, StyleSheet } from "react-native";

export default function MyGamesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Games</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
});