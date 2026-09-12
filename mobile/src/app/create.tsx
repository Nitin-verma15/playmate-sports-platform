import { View, Text, StyleSheet } from "react-native";

export default function CreateGameScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Game</Text>
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