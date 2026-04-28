import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";

export default function Pairing({ navigation }) {
  const [barcode, setBarcode] = useState("");
  const [rfId, setRfId] = useState("");

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Párosítás</Text>
      <Text style={styles.subtitle}>Add meg az azonosítókat az összekapcsoláshoz.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Vonalkód</Text>
        <TextInput
          style={styles.input}
          placeholder="Add meg a vonalkódot"
          placeholderTextColor="#7A8783"
          value={barcode}
          onChangeText={setBarcode}
        />

        <Text style={styles.label}>RF id</Text>
        <TextInput
          style={styles.input}
          placeholder="Add meg az RF id-t"
          placeholderTextColor="#7A8783"
          value={rfId}
          onChangeText={setRfId}
        />
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          navigation.navigate("Home");
        }}
      >
        <Text style={styles.buttonText}>Mentés</Text>
      </Pressable>
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
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1B3E3A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#4D5C58",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7E3",
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#2F4B46",
    marginTop: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#C8D7D1",
    borderRadius: 10,
    backgroundColor: "#FAFCFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  button: {
    marginTop: 18,
    backgroundColor: "#0E7A6D",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});