import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useState } from "react";
import { RadioButton } from "react-native-paper";

const dropdownData = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
];

export default function Targonca({ navigation }) {
  const [targoncaNev, setTargoncaNev] = useState("");
  const [targoncaTomeg, setTargoncaTomeg] = useState("");
  const [rfId, setRfId] = useState("");
  const [radioValue, setRadioValue] = useState("kint");
  const [sor, setSor] = useState("");
  const [oszlop, setOszlop] = useState("");

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Targonca adatlap</Text>
      <Text style={styles.subtitle}>Töltsd ki az adatokat, majd mentsd a rekordot.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Targoncanév</Text>
        <TextInput
          style={styles.input}
          placeholder="Targonca"
          placeholderTextColor="#7A8783"
          value={targoncaNev}
          onChangeText={setTargoncaNev}
        />

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
      </View>

      <View style={styles.card}>
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
        </View>

        <Text style={styles.label}>Elhelyezés</Text>
        <RadioButton.Group
          onValueChange={(newValue) => setRadioValue(newValue)}
          value={radioValue}
        >
          <View style={styles.radioRow}>
            <Pressable style={styles.radioItem} onPress={() => setRadioValue("kint")}>
              <RadioButton value="kint" />
              <Text style={styles.radioText}>Kint</Text>
            </Pressable>

            <Pressable style={styles.radioItem} onPress={() => setRadioValue("bent")}>
              <RadioButton value="bent" />
              <Text style={styles.radioText}>Bent</Text>
            </Pressable>
          </View>
        </RadioButton.Group>
      </View>

      <Pressable
        style={styles.button}
        onPress={() => {
          navigation.navigate("Home");
        }}
      >
        <Text style={styles.buttonText}>Mentés</Text>
      </Pressable>
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
  dropdown: {
    height: 44,
    borderWidth: 1,
    borderColor: "#C8D7D1",
    borderRadius: 10,
    backgroundColor: "#FAFCFB",
    paddingHorizontal: 12,
  },
  dropdownPlaceholder: {
    color: "#7A8783",
    fontSize: 14,
  },
  dropdownSelected: {
    color: "#1B3E3A",
    fontSize: 14,
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});