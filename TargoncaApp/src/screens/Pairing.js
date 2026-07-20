import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useEffect, useState } from "react";
import {
  createInactiveGongyoleg,
  completeGongyolegPairing,
  getCimkeVkods,
  getGongyolegekRfids,
  apiGet,
} from "../services/api";
import ErrorPopup from "../components/ErrorPopup";

export default function Pairing({ navigation }) {
  const [rfids, setRfids] = useState([]);
  const [gongyolegek, setGongyolegek] = useState([]);
  const [vkodok, setVkodok] = useState([]);
  const [lfId, setLfId] = useState("");
  const [rfId, setRfId] = useState("");
  const [selectedGId, setSelectedGId] = useState("");
  const [selectedPairingId, setSelectedPairingId] = useState("");
  const [vkod, setVkod] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);

  const rfidItems = rfids.map(({ rfid }) => ({ label: rfid, value: rfid }));
  const gongyolegItems = gongyolegek.map(({ id, nev }) => ({
    label: nev,
    value: String(id),
  }));
  const vkodItems = vkodok.map(({ vkod: value }) => ({ label: value, value }));

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    setLoading(true);
    setError("");
    setErrorVisible(false);

    try {
      const [rfidData, gongyolegData, vkodData] = await Promise.all([
        getGongyolegekRfids(),
        apiGet("/gongyoleg"),
        getCimkeVkods(),
      ]);
      setRfids(Array.isArray(rfidData) ? rfidData : []);
      setGongyolegek(Array.isArray(gongyolegData) ? gongyolegData : []);
      setVkodok(Array.isArray(vkodData) ? vkodData : []);
    } catch (err) {
      setError(err.message || "Nem sikerult betolteni az adatokat.");
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const createRfidPairing = async () => {
    if (!lfId || !rfId) {
      setError("Valaszd ki mindket RF ID-t.");
      setErrorVisible(true);
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    setErrorVisible(false);

    try {
      if (!selectedGId) {
        setError("Valassz gongyoleget.");
        setErrorVisible(true);
        return;
      }

      const result = await createInactiveGongyoleg({
        g_id: selectedGId,
        lf_id: lfId,
        RFID: rfId,
      });
      if (!result?.success || !result?.id) {
        throw new Error("A szerver nem adott vissza ervenyes azonosítot.");
      }

      setSelectedPairingId(String(result.id));
      await loadFormData();
      setMessage("Az RF ID-k mentve. A masodik formon aktivalhatod a parositast.");
    } catch (err) {
      setError(err.message || "Nem sikerult menteni az RF ID-ket.");
      setErrorVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const completePairing = async () => {
    if (!selectedPairingId || !selectedGId || !lfId || !rfId || !vkod) {
      setError("Add meg a vonalkodot az aktivalashoz.");
      setErrorVisible(true);
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    setErrorVisible(false);

    try {
      const result = await completeGongyolegPairing({
        pairing_id: selectedPairingId,
        g_id: selectedGId,
        lf_id: lfId,
        RFID: rfId,
        vkod,
      });
      if (!result?.success) {
        throw new Error("A parositas aktivalasa nem sikerult.");
      }

      setMessage("Parositas aktivalva.");
      setLfId("");
      setRfId("");
      setSelectedGId("");
      setSelectedPairingId("");
      setVkod("");
      await loadFormData();
      navigation.navigate("Home");
    } catch (err) {
      setError(err.message || "Nem sikerult aktivalni a parositast.");
      setErrorVisible(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Párosítás</Text>

      {!selectedPairingId ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. RF ID-k rögzítése</Text>
          {loading ? (
            <ActivityIndicator color="#0E7A6D" />
          ) : (
            <>
              <Text style={styles.label}>RF ID 1</Text>
              <Dropdown
                style={styles.dropdown}
                data={rfidItems}
                labelField="label"
                valueField="value"
                placeholder="Válaszd ki az első RF ID-t"
                value={lfId}
                search
                searchPlaceholder="RF ID keresése"
                onChange={(item) => setLfId(item.value)}
              />

              <Text style={styles.label}>RF ID 2</Text>
              <Dropdown
                style={styles.dropdown}
                data={rfidItems}
                labelField="label"
                valueField="value"
                placeholder="Válaszd ki a második RF ID-t"
                value={rfId}
                search
                searchPlaceholder="RF ID keresése"
                onChange={(item) => setRfId(item.value)}
              />

              <Text style={styles.label}>Göngyöleg</Text>
              <Dropdown
                style={styles.dropdown}
                data={gongyolegItems}
                labelField="label"
                valueField="value"
                placeholder="Válaszd ki a göngyöleget"
                value={selectedGId}
                search
                searchPlaceholder="Keresés név alapján"
                onChange={(item) => setSelectedGId(item.value)}
              />
            </>
          )}

          <Pressable
            style={[styles.button, (saving || loading) && styles.buttonDisabled]}
            onPress={createRfidPairing}
            disabled={saving || loading}
          >
            <Text style={styles.buttonText}>{saving ? "Mentés..." : "RF ID-k mentése"}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Gongyoleg aktivalasa</Text>
          <Text style={styles.label}>Vonalkod</Text>
          <Dropdown
            style={styles.input}
            data={vkodItems}
            labelField="label"
            valueField="value"
            placeholder="Válaszd ki a vonalkodot"
            value={vkod}
            search
            searchPlaceholder="Vonalkod keresése"
            disable={saving}
            onChange={(item) => setVkod(item.value)}
          />
          <Pressable
            style={[styles.button, (loading || saving) && styles.buttonDisabled]}
            onPress={completePairing}
            disabled={loading || saving}
          >
            <Text style={styles.buttonText}>{saving ? "Mentés..." : "Aktiválás"}</Text>
          </Pressable>
        </View>
      )}

      {!!message && <Text style={styles.successText}>{message}</Text>}
      <ErrorPopup visible={errorVisible && !!error} message={error} onClose={() => setErrorVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7F5",
    paddingHorizontal: 20, 
    paddingTop: 28 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "800", 
    color: "#1B3E3A", 
    marginBottom: 6 
  },
  subtitle: { 
    fontSize: 14, 
    color: "#4D5C58", 
    marginBottom: 16 
  },
  card: { 
    backgroundColor: "#FFFFFF", 
    borderRadius: 16, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: "#DDE7E3", 
    gap: 8, 
    marginBottom: 14 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#1B3E3A", 
    marginBottom: 4 
  },
  label: { 
    fontSize: 14, 
    color: "#2F4B46", 
    marginTop: 6, 
    fontWeight: "600" 
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#C8D7D1", 
    borderRadius: 10, 
    backgroundColor: "#FAFCFB", 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    fontSize: 15 
  },
  dropdown: { 
    height: 46, 
    borderWidth: 1, 
    borderColor: "#C8D7D1", 
    borderRadius: 10, 
    backgroundColor: "#FAFCFB", 
    paddingHorizontal: 12 
  },
  button: { 
    marginTop: 10, 
    backgroundColor: "#0E7A6D", 
    borderRadius: 12, 
    paddingVertical: 14, 
    alignItems: "center" 
  },
  buttonDisabled: {
    opacity: 0.7 
  },
  buttonText: { 
    color: "#FFFFFF", 
    fontSize: 16, 
    fontWeight: "700" 
  },
  successText: { 
    color: "#0B7A4D", 
    fontWeight: "700", 
    marginTop: 6 
  },
});
