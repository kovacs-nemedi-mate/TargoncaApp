import { View, Text, Pressable, StyleSheet, ActivityIndicator, TextInput } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useEffect, useState, useRef } from "react";
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
  const lfInputRef = useRef(null);
  const rfInputRef = useRef(null);



  const rfidItems = rfids.map(({ rfid }) => ({ label: rfid, value: rfid }));
  const gongyolegItems = gongyolegek.map(({ id, nev }) => ({
    label: nev,
    value: String(id),
  }));
  const vkodItems = vkodok.map(({ vkod: value }) => ({ label: value, value }));
 
  useEffect(() => {
    if (!loading) {
        lfInputRef.current?.focus();
    }
  }, [loading]);

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
      setError(err.message || "Nem sikerült betolteni az adatokat.");
      setErrorVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const createRfidPairing = async () => {
    if (!lfId || !rfId) {
      setError("Válassz ki mindkét RF ID-t.");
      setErrorVisible(true);
      return;
    }else if (lfId === rfId) {
      setError("Az RF ID-k nem lehetnek azonosak.");
      setErrorVisible(true);
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    setErrorVisible(false);

    try {
      

      const result = await createInactiveGongyoleg({
        lf_id: lfId,
        RFID: rfId,
      });
      if (!result?.success || !result?.id) {
        throw new Error("A szerver nem adott vissza érvényes azonosítot.");
      }

      setSelectedPairingId(String(result.id));
      await loadFormData();
      setMessage("Az RF ID-k mentve. A második oldalon aktivalhatod a párosítást.");
    } catch (err) {
      setError(err.message || "Nem sikerült menteni az RF ID-ket.");
      setErrorVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const completePairing = async () => {
    if (!selectedPairingId || !selectedGId || !lfId || !rfId || !vkod) {
      setError("Add meg a vonalkódot az aktivaláshoz.");
      setErrorVisible(true);
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");
    setErrorVisible(false);

    try {
      createRfidPairing();
      const result = await completeGongyolegPairing({
        pairing_id: selectedPairingId,
        lf_id: lfId,
        RFID: rfId,
        vkod,
      });
      if (!result?.success) {
        throw new Error("A párosítás aktiválása nem sikerült.");
      }

      setMessage("Párosítás aktiválva.");
      setLfId("");
      setRfId("");
      setSelectedGId("");
      setSelectedPairingId("");
      setVkod("");
      await loadFormData();
      navigation.navigate("Home");
    } catch (err) {
      setError(err.message || "Nem sikerült0 aktiválni a párosítást.");
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
        <Text style={styles.sectionTitle}> RF ID-k rögzítése</Text>

        {loading ? (
          <ActivityIndicator color="#0E7A6D" />
        ) : (
          <>
            <Text style={styles.label}>RF ID 1</Text>
            <TextInput
              style={styles.input}
              placeholder="Add meg az első RF ID-t"
              value={lfId}
              onChangeText={setLfId}
              ref={lfInputRef}
              placeholderTextColor="#2F4B46"
              maxLength={25}
            />

            <Text style={styles.label}>RF ID 2</Text>
            <TextInput
              style={styles.input}
              placeholder="Add meg a második RF ID-t"
              value={rfId}
              onChangeText={setRfId}
              ref={rfInputRef}
              placeholderTextColor="#2F4B46"
              maxLength={25}
            />

            <Text style={styles.label}>Vonalkód</Text>
            <TextInput
              style={styles.input}
              placeholder="Add meg a vonalkódot"
              value={vkod}
              onChangeText={setVkod}
              placeholderTextColor="#2F4B46"
              maxLength={13}
            />

            <Pressable
              style={[
                styles.button,
                (loading || saving) && styles.buttonDisabled,
              ]}
              onPress={completePairing}
              disabled={loading || saving}
            >
              <Text style={styles.buttonText}>
                {saving ? "Mentés..." : "Aktiválás"}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    ) : null}
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
    paddingVertical: 5, 
    fontSize: 15, 
    placeholderTextColor: "#2F4B46",
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
