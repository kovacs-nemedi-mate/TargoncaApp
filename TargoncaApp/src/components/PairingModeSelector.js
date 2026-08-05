import { View, Text, Pressable, StyleSheet } from "react-native";

export default function PairingModeSelector({ onSelectMode }) {
  return (
    <View style={styles.modeCard}>
      <Text style={styles.menuTitle}>Válaszd ki a végrehajtandó műveletet:</Text>

      <Pressable
        style={styles.modeButton}
        onPress={() => onSelectMode("double_rfid_barcode")}
      >
        <Text style={styles.modeButtonText}>2 RFID + Vonalkód</Text>
      </Pressable>

      <Pressable
        style={styles.modeButton}
        onPress={() => onSelectMode("single_rfid_barcode")}
      >
        <Text style={styles.modeButtonText}>1 RFID + Vonalkód</Text>
      </Pressable>

      <Pressable
        style={styles.modeButton}
        onPress={() => onSelectMode("double_rfid")}
      >
        <Text style={styles.modeButtonText}>2 RFID párosítás / javítás</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  modeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#DDE7E3",
    marginBottom: 14,
    gap: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B3E3A",
    marginBottom: 16,
    lineHeight: 22,
  },
  modeButton: {
    backgroundColor: "#E8F3F1",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BEE1DA",
  },
  modeButtonText: {
    color: "#0E7A6D",
    fontSize: 15,
    fontWeight: "700",
  },
});
