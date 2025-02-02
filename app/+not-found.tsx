import { Link, Stack } from "expo-router";
import React from "react";
import { View, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#25292e",
  },
  text: {
    color: "#fff",
  },
  button: {
    fontSize: 20,
    textDecorationLine: "underline",
    color: "#fff",
  },
});

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ title: "Opps! Not Found" }} />
      <View style={styles.container}>
        <Link href="/" style={styles.button}>
          Go back to Home screen
        </Link>
      </View>
    </>
  );
}
