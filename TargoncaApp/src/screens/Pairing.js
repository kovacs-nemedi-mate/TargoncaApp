import { View, Text, Pressable, StyleSheet, ActivityIndicator, TextInput, ScrollView } from "react-native";
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
import { MaterialIcons } from "@expo/vector-icons";


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
  const [editableField, setEditableField] = useState(null);
  const lfInputRef = useRef(null);
  const rfInputRef = useRef(null);
  const vkodInputRef = useRef(null);
  const rfScanTimer = useRef(null);
  const lfScanTimer = useRef(null);



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

  const enableEditing = (field, ref) => {
    setEditableField(field);

    setTimeout(() => {
      ref.current?.focus();
    }, 50);
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

    const result = await createInactiveGongyoleg({
    lf_id: lfId,
    RFID: rfId,
  });
  

  if (!result?.success || !result?.id) {
    throw new Error("A szerver nem adott vissza érvényes pairing ID-t.");
  }

  return result.id;
};

const completePairing = async () => {
  
  if (!lfId || !rfId || !vkod) {
    
    setError("Add meg a vonalkódot az aktiváláshoz.");
    setErrorVisible(true);
    return;
  }
   
  setSaving(true);
  setMessage("");
  setError("");
  setErrorVisible(false);

  try {
    
    // Create the pairing and get its ID
    const pairingId = await createRfidPairing();
    
    // Activate it immediately
    const result = await completeGongyolegPairing({
      pairing_id: pairingId,
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
    setSelectedPairingId("");
    setVkod("");

    await loadFormData();

    navigation.navigate("Home");
  } catch (err) {
    setError(err.message || "Nem sikerült aktiválni a párosítást.");
    setErrorVisible(true);
  } finally {
    setSaving(false);
  }
};

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Párosítás</Text>

       <ErrorPopup
          visible={errorVisible}
          message={error}
          onClose={() => setErrorVisible(false)}
        />


       {!selectedPairingId ? (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}> RF ID-k rögzítése</Text>

        {loading ? (
          <ActivityIndicator color="#0E7A6D" />
        ) : (
          <>
            <Text style={styles.label}>RF ID 1</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Add meg az első RF ID-t"
                value={lfId}
                onChangeText={(text) => {
                  setLfId(text);
                  // Example: RFID is always 25 characters
                  if (lfScanTimer.current) {
                    clearTimeout(lfScanTimer.current);
                  }
                  lfScanTimer.current = setTimeout(() => {
                    rfInputRef.current?.focus();
                  }, 200); // adjust to 50–200 ms if needed
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

            <Text style={styles.label}>RF ID 2</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Add meg a második RF ID-t"
                value={rfId}
                onChangeText={(text) => {
                  setRfId(text);
                  if (rfScanTimer.current) {
                    clearTimeout(rfScanTimer.current);
                  }

                  rfScanTimer.current = setTimeout(() => {
                    vkodInputRef.current?.focus();
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
            <Pressable
               style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
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
  </ScrollView>
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

  editIcon: {
    fontSize: 20,
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
   buttonPressed: {
    backgroundColor: "#0A5E55",
    transform: [{ scale: 0.98 }],
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
