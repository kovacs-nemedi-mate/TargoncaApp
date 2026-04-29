import { View, Text, TextInput, Pressable, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../services/api";
import ErrorPopup from "../components/ErrorPopup";

export default function Pairing({ navigation }) {
  const [barcode, setBarcode] = useState("");
  const [rfId, setRfId] = useState("");
  const [gongyolegek, setGongyolegek] = useState([]);
  const [selectedGId, setSelectedGId] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);

  const dropdownItems = gongyolegek.map((item, index) => ({
    label: `${item.nev}`,
    value: String(item.id),
    index,
    raw: item,
  }));

  useEffect(() => {
    loadGongyolegek();
  }, []);

  const loadGongyolegek = async () => {
    setLoading(true);
    setError("");
    setErrorVisible(false);

    try {
      const data = await apiGet("/gongyoleg");
      setGongyolegek(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Nem sikerült betölteni az adatokat.");
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

 

  const savePairing = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    setErrorVisible(false);

    if (!selectedGId || !barcode || !rfId) {
      setError('Válassz gongyoleget, add meg a vonalkódot és az RF id-t.');
      setErrorVisible(true);
      setSaving(false);
      return;
    }

    try {
      const gongyoResult = await apiPost("/gongyolegek", {
        id: selectedGId,
        RFID: rfId,
      });

      if (!gongyoResult?.success) {
        throw new Error("A gongyolegek endpoint nem adott vissza sikert.");
      }

      const result = await apiPost("/cimkek", {
        g_id: selectedGId,
        rfid: rfId,
        vkod: barcode
      });

      setMessage(result?.success ? "Párosítás mentve." : "A szerver nem adott vissza sikert.");
      setBarcode("");
      setRfId("");
      loadGongyolegek();
    } catch (err) {
      setError(err.message || "Nem sikerült menteni a párosítást.");
      setErrorVisible(true);
    } finally {
      setSaving(false);
    }
    navigation.navigate("Home");
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Párosítás</Text>
      <Text style={styles.subtitle}>Add meg az azonosítókat az összekapcsoláshoz.</Text>

      <Dropdown
        style={styles.dropdown}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        data={dropdownItems}
        labelField="label"
        valueField="value"
        placeholder="Válassz gongyoleget"
        value={String(selectedGId || "")}
        search
        searchPlaceholder="Keresés név alapján"
        onChange={(item) => {
          setSelectedGId(item.value);
          setSelectedIndex(item.index);
        }}
      />

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

      {!!message && <Text style={styles.successText}>{message}</Text>}

      

      <Pressable
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={savePairing}
        disabled={saving}
      >
        <Text style={styles.buttonText}>{saving ? "Mentés..." : "Mentés"}</Text>
      </Pressable>

      <ErrorPopup
        visible={errorVisible && !!error}
        message={error}
        onClose={() => {
          setErrorVisible(false);
        }}
      />
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
  statusCard: {
    backgroundColor: "#EAF5F2",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D7E7E2",
    marginBottom: 14,
    gap: 6,
  },
  statusLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#5C726D",
    fontWeight: "700",
  },
  statusValue: {
    color: "#1B3E3A",
    fontWeight: "700",
  },
  linkButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C8D7D1",
  },
  linkButtonText: {
    color: "#0E7A6D",
    fontWeight: "700",
  },
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7E3",
    marginBottom: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B3E3A",
  },
  listRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF3F1",
  },
  listMain: {
    color: "#1B3E3A",
    fontWeight: "700",
  },
  listMeta: {
    color: "#5D6F6A",
    marginTop: 2,
  },
  emptyText: {
    color: "#5D6F6A",
  },
  successText: {
    color: "#0B7A4D",
    fontWeight: "700",
    marginTop: 6,
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  dropdown: {
    height: 46,
    borderWidth: 1,
    borderColor: "#C8D7D1",
    borderRadius: 10,
    backgroundColor: "#FAFCFB",
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  placeholderStyle: {
    color: "#7A8783",
    fontSize: 14,
  },
  selectedTextStyle: {
    color: "#1B3E3A",
    fontSize: 14,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    color: "#1B3E3A",
  },
  apiRowSelected: {
    backgroundColor: "#F0FBF7",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginHorizontal: -16,
  },
});