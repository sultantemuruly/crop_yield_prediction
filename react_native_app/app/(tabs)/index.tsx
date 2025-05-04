/* eslint-disable */
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet, View, Image } from "react-native";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Image
        source={require("@/assets/images/yield.jpg")}
        style={styles.image}
        resizeMode="contain"
      />

      <ThemedText type="title" style={styles.title}>
        Welcome to CropYield AI
      </ThemedText>

      <ThemedText type="default" style={styles.description}>
        This app helps to predict crop yield based on key factors like
        temperature, rainfall, area, and more.
      </ThemedText>

      <ThemedText type="default" style={styles.description}>
        Simply input your environmental data to get instant predictions, or
        train model by providing historical yield data and relevant parameters.
      </ThemedText>

      <ThemedText type="default" style={styles.tip}>
        ➤ Start by exploring the tabs below to either get a prediction or train
        your model!
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9", // bright background
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#137200", // deep green tone
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    color: "#555",
  },
  tip: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    color: "#1976d2",
    marginTop: 16,
  },
});
