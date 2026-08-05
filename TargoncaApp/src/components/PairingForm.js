import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function PairingForm({
  pairingMode,
  lfId,
  setLfId,
  rfId,
  setRfId,
  vkod,
  setVkod,
  saving,
  editableField,
  lfInputRef,
  rfInputRef,
  vkodInputRef,
  lfScanTimer,
  rfScanTimer,
  enableEditing,
  completePairing,
  resetForm,
}) {
  return (
    <>
      <Pressable style={styles.backButton} onPress={resetForm}>
        <MaterialIcons name="arrow-back" size={20} color="#0E7A6D" />
        <Text style={styles.backButtonText}>Vissza a választáshoz</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          {pairingMode === "double_rfid_barcode" && "2 RF ID + Vonalkód"}
          {pairingMode === "single_rfid_barcode" && "1 RF ID + Vonalkód"}
          {pairingMode === "double_rfid" && "2 RF ID párosítás"}
        </Text>

        {(pairingMode === "double_rfid_barcode" || pairingMode === "double_rfid") && (
          <>
            <Text style={styles.label}>RF ID 1</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Add meg az első RF ID-t"
                value={lfId}
                onChangeText={(text) => {
                  setLfId(text);
                  if (lfScanTimer.current) {
                    clearTimeout(lfScanTimer.current);
                  }
                  lfScanTimer.current = setTimeout(() => {
                    rfInputRef.current?.focus();
                  }, 200);
                }}
                ref={lfInputRef}
                placeholderTextColor="#2F4B46"
                maxLength={25}
                showSoftInputOnFocus={editableField === "lf"}
              />
              <Pressable
                style={styles.editButton}
                onPress={() => enableEditing("lf", lfInputRef)}
              >
                <MaterialIcons name="edit" size={22} color="#0E7A6D" />
              </Pressable>
            </View>
          </>
        )}

        {(pairingMode === "double_rfid_barcode" ||
          pairingMode === "single_rfid_barcode" ||
          pairingMode === "double_rfid") && (
          <>
            <Text style={styles.label}>
              {pairingMode === "single_rfid_barcode" ? "RF ID" : "RF ID 2"}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={
                  pairingMode === "single_rfid_barcode"
                    ? "Add meg az RF ID-t"
                    : "Add meg a második RF ID-t"
                }
                value={rfId}
                onChangeText={(text) => {
                  setRfId(text);
                  if (rfScanTimer.current) {
                    clearTimeout(rfScanTimer.current);
                  }

                  rfScanTimer.current = setTimeout(() => {
                    if (pairingMode === "double_rfid") {
                      // No vkod field in double_rfid mode
                    } else {
                      vkodInputRef.current?.focus();
                    }
                  }, 200);
                }}
                ref={rfInputRef}
                placeholderTextColor="#2F4B46"
                maxLength={25}
                showSoftInputOnFocus={editableField === "rf"}
              />
              <Pressable
                style={styles.editButton}
                onPress={() => enableEditing("rf", rfInputRef)}
              >
                <MaterialIcons name="edit" size={22} color="#0E7A6D" />
              </Pressable>
            </View>
          </>
        )}

        {(pairingMode === "double_rfid_barcode" || pairingMode === "single_rfid_barcode") && (
          <>
            <Text style={styles.label}>Vonalkód</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Add meg a vonalkódot"
                value={vkod}
                onChangeText={setVkod}
                placeholderTextColor="#2F4B46"
                ref={vkodInputRef}
                maxLength={13}
                showSoftInputOnFocus={editableField === "vkod"}
              />
              <Pressable
                style={styles.editButton}
                onPress={() => enableEditing("vkod", vkodInputRef)}
              >
                <MaterialIcons name="edit" size={22} color="#0E7A6D" />
              </Pressable>
            </View>
          </>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            saving && styles.buttonDisabled,
          ]}
          onPress={completePairing}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Mentés..." : "Aktiválás"}
          </Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7E3",
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B3E3A",
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: "#2F4B46",
    marginTop: 6,
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#C8D7D1",
    borderRadius: 10,
    backgroundColor: "#FAFCFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editButton: {
    marginLeft: 8,
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F3F1",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#0E7A6D",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonPressed: {
    backgroundColor: "#0A5E55",
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 12,
    gap: 6,
  },
  backButtonText: {
    color: "#0E7A6D",
    fontWeight: "700",
    fontSize: 15,
  },
});
