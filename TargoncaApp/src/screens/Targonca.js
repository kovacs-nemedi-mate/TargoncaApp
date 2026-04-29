import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useEffect, useState } from "react";
import { RadioButton } from "react-native-paper";
import { apiGet, apiPost } from "../services/api";
import ErrorPopup from "../components/ErrorPopup";

const dropdownData = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
];

const getFieldValue = (item, fieldName) => {
  if (!item || typeof item !== "object") {
    return "";
  }

  const match = Object.entries(item).find(([key]) => key.toLowerCase() === fieldName.toLowerCase());
  return match?.[1] != null ? String(match[1]) : "";
};

export default function Targonca({ navigation, route }) {
  const [targoncaNev, setTargoncaNev] = useState("");
  const [targoncaTomeg, setTargoncaTomeg] = useState("");
  const [rfId, setRfId] = useState("");
  const [radioValue, setRadioValue] = useState(-1);
  const [sor, setSor] = useState("");
  const [oszlop, setOszlop] = useState("");
  const [melyseg, setMelyseg] = useState("");
  const [targoncak, setTargoncak] = useState([]);
  const [raktarak, setRaktarak] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedRfId, setSelectedRfId] = useState("");
  const [selectedRaktarId, setSelectedRaktarId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);

  const raktarDropdownData = raktarak.map((item, index) => ({
    label: item?.nev != null ? String(item.nev) : "",
    value: String(item?.id ?? ""),
    index,
    raw: item,
  }));

  useEffect(() => {
    loadTargoncak();
    loadRaktarak();
  }, []);

  const loadTargoncak = async () => {
    setLoading(true);
    setError("");
    setErrorVisible(false);

    try {
      const data = await apiGet("/targonca");
      const rows = Array.isArray(data) ? data : [];
      setTargoncak(rows);

      // If the navigator passed a full selected item, prefer it
      const paramItem = route?.params?.selectedItem;
      if (paramItem) {
        const paramRf = getFieldValue(paramItem, "RFID");
        // try to find the same item in the loaded rows
        const found = rows.findIndex((r) => getFieldValue(r, "RFID") === paramRf);
        const initialIndex = found >= 0 ? found : 0;

        setSelectedIndex(initialIndex);
        setTargoncaNev(paramItem?.nev ?? rows[initialIndex]?.nev ?? "");
        setTargoncaTomeg(getFieldValue(paramItem, "tomeg") || getFieldValue(rows[initialIndex], "tomeg"));
        const initialRfId = paramRf || getFieldValue(rows[initialIndex], "RFID");
        setRfId(initialRfId);
        setSelectedRfId(initialRfId);
      } else if (rows.length > 0) {
        const paramRf = route?.params?.selectedRfId;
        let initialIndex = 0;
        if (paramRf) {
          const found = rows.findIndex((r) => getFieldValue(r, "RFID") === paramRf);
          if (found >= 0) initialIndex = found;
        }

        setSelectedIndex(initialIndex);
        setTargoncaNev(rows[initialIndex]?.nev ?? "");
        setTargoncaTomeg(getFieldValue(rows[initialIndex], "tomeg"));
        const initialRfId = getFieldValue(rows[initialIndex], "RFID");
        setRfId(initialRfId);
        setSelectedRfId(initialRfId);
      } else {
        setSelectedIndex(0);
        setTargoncaNev("");
        setTargoncaTomeg("");
        setRfId("");
        setSelectedRfId("");
      }
    } catch (err) {
      setError(err.message || "Nem sikerült betölteni a targoncákat.");
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const loadRaktarak = async () => {
    try {
      const data = await apiGet("/raktar");
      const rows = Array.isArray(data) ? data : [];
      setRaktarak(rows);

      if (rows.length > 0 && !selectedRaktarId) {
        setSelectedRaktarId(String(rows[0]?.id ?? ""));
      }
    } catch (err) {
      setError(err.message || "Nem sikerült betölteni a raktárakat.");
      setErrorVisible(true);
    }
  };

  const selectTargonca = (item, index) => {
    const currentRfId = getFieldValue(item, "RFID");

    setSelectedIndex(index);
    setTargoncaNev(item?.nev ?? "");
    setTargoncaTomeg(getFieldValue(item, "tomeg"));
    setRfId(currentRfId);
    setSelectedRfId(currentRfId);
  };

  const saveTargonca = async () => {
    setSaving(true);
    setError("");
    setErrorVisible(false);

    try {
      const result = await apiPost("/targonca_update", {
        nev: targoncaNev,
        tomeg: targoncaTomeg,
        RFID: rfId,
      });

      if (!result?.success) {
        throw new Error("A szerver nem erősítette meg a mentést.");
      }

      if (selectedRaktarId) {
        const mozgasResult = await apiPost("/mozgasok", {
          raktar_id: selectedRaktarId,
          tomeg: targoncaTomeg,
          sor,
          oszlop,
          melyseg,
          irany: radioValue,
          rfid: rfId,
        });

        if (!mozgasResult?.success) {
          throw new Error("A mozgasok endpoint nem erősítette meg a mentést.");
        }
      }

      await loadTargoncak();
    } catch (err) {
      setError(err.message || "Nem sikerült menteni a targoncát.");
      setErrorVisible(true);
    } finally {
      setSaving(false);
    }
    navigation.navigate("Home");
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Targonca adatlap</Text>
      <Text style={styles.subtitle}>Töltsd ki az adatokat, majd mentsd a rekordot.</Text>

      

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Targoncanév</Text>
            <TextInput
              style={styles.input}
              placeholder="Targonca"
              placeholderTextColor="#7A8783"
              value={targoncaNev}
              onChangeText={setTargoncaNev}
            />
          </View>
        </View>

        <View style={[styles.row, { marginTop: 8 }]}>
          <View style={styles.column}>
            <Text style={styles.label}>Raktár</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelected}
              data={raktarDropdownData}
              labelField="label"
              valueField="value"
              placeholder="Válassz raktárat"
              value={selectedRaktarId}
              search
              searchPlaceholder="Keresés név alapján"
              onChange={(item) => setSelectedRaktarId(item.value)}
            />
          </View>
        </View>
        
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Targonca tömeg</Text>
            <TextInput
              style={styles.input}
              placeholder="Tömeg"
              placeholderTextColor="#7A8783"
              value={targoncaTomeg}
              onChangeText={setTargoncaTomeg}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>RF id</Text>
            <TextInput
              style={styles.input}
              placeholder="RF id"
              placeholderTextColor="#7A8783"
              value={rfId}
              onChangeText={setRfId}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Pozíció</Text>

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Sor</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelected}
              data={dropdownData}
              labelField="label"
              valueField="value"
              placeholder="Válassz sort"
              value={sor}
              onChange={(item) => setSor(item.value)}
            />
          </View>

          <View style={styles.column}>
            <Text style={styles.label}>Oszlop</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelected}
              data={dropdownData}
              labelField="label"
              valueField="value"
              placeholder="Válassz oszlopot"
              value={oszlop}
              onChange={(item) => setOszlop(item.value)}
            />
          </View>
          <View style={styles.column} >
            <Text style={styles.label}>Mélység</Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelected}
              data={dropdownData}
              labelField="label"
              valueField="value"
              placeholder="Válassz mélységet"
              value={melyseg}
              onChange={(item) => setMelyseg(item.value)}
            />
          </View>
          
        </View>

        <Text style={styles.label}>Elhelyezés</Text>
        <RadioButton.Group
          onValueChange={(newValue) => setRadioValue(newValue)}
          value={radioValue}
        >
          <View style={styles.radioRow}>
            <Pressable style={styles.radioItem} onPress={() => setRadioValue(-1)}>
              <RadioButton value={-1} />
              <Text style={styles.radioText}>Ki</Text>
            </Pressable>

            <Pressable style={styles.radioItem} onPress={() => setRadioValue(1)}>
              <RadioButton value={1} />
              <Text style={styles.radioText}>Be</Text>
            </Pressable>
          </View>
        </RadioButton.Group>

        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={saveTargonca}
          disabled={saving}
        >
          <Text style={styles.buttonText}>{saving ? "Mentés..." : "Mentés"}</Text>
        </Pressable>
      </View>

      <ErrorPopup
        visible={errorVisible && !!error}
        message={error}
        onClose={() => setErrorVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7F5",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    gap: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1B3E3A",
  },
  subtitle: {
    fontSize: 14,
    color: "#4D5C58",
    marginBottom: 4,
  },
  apiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7E3",
    gap: 10,
  },
  apiHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  refreshButton: {
    backgroundColor: "#EAF5F2",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  refreshButtonText: {
    color: "#0E7A6D",
    fontWeight: "700",
  },
  apiRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF3F1",
  },
  apiRowSelected: {
    backgroundColor: "#F0FBF7",
    borderRadius: 12,
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },
  apiMain: {
    color: "#1B3E3A",
    fontWeight: "700",
  },
  apiMeta: {
    color: "#5D6F6A",
    marginTop: 2,
  },
  apiHint: {
    color: "#0E7A6D",
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyText: {
    color: "#5D6F6A",
  },
  errorText: {
    color: "#B42318",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7E3",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B3E3A",
    marginBottom: 2,
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
  row: {
    flexDirection: "row",
    gap: 10,
  },
  column: {
    flex: 1,
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  dropdown: {
    height: 56,
    borderWidth: 1,
    borderColor: "#C8D7D1",
    borderRadius: 12,
    backgroundColor: "#FAFCFB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    flex: 1,
    justifyContent: 'center',
  },
  dropdownPlaceholder: {
    color: "#7A8783",
    fontSize: 15,
  },
  dropdownSelected: {
    color: "#1B3E3A",
    fontSize: 16,
    fontWeight: "700",
  },
  radioRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#D2DED9",
    borderRadius: 10,
    backgroundColor: "#FBFDFC",
  },
  radioText: {
    color: "#2F4B46",
    fontWeight: "600",
  },
  button: {
    marginTop: 4,
    backgroundColor: "#0E7A6D",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});