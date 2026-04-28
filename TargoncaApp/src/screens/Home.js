import { View, Text, Pressable, StyleSheet } from "react-native";

export default function Home({ navigation }) {
  return (
    <View style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>TargoncaApp</Text>
        <Text style={styles.title}>Fooldal</Text>
        <Text style={styles.subtitle}>Valassz egy muveletet a folytatashoz.</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => {
            navigation.navigate("Targonca");
          }}
        >
          <Text style={styles.primaryButtonText}>Targonca adatlap</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => {
            navigation.navigate("Pairing");
          }}
        >
          <Text style={styles.secondaryButtonText}>Párosítás</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7F5",
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  heroCard: {
    backgroundColor: "#1D4E4A",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  eyebrow: {
    color: "#BCE9E1",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: "700",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "#D8F2EE",
    fontSize: 14,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  primaryButton: {
    backgroundColor: "#0E7A6D",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D4DFDA",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButtonText: {
    color: "#224A45",
    fontSize: 16,
    fontWeight: "700",
  },
});