import React from "react"; // Removed useState
import { SafeAreaView, StyleSheet, Text } from "react-native";
export default function Chat() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Chat Screen</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

