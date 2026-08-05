import { Text, ScrollView, StyleSheet } from "react-native";
import { useEffect, useState, useRef } from "react";
import {
  createGongyoleg,
  completeGongyolegPairing,
  pairRfidBarcode,
  repairGongyoleg,
} from "../services/api";
import ErrorPopup from "../components/ErrorPopup";
import PairingModeSelector from "../components/PairingModeSelector";
import PairingForm from "../components/PairingForm";


export default function Pairing({ navigation }) {
  const [pairingMode, setPairingMode] = useState(null); // 'double_rfid_barcode', 'single_rfid_barcode', 'double_rfid'
  const [lfId, setLfId] = useState("");
  const [rfId, setRfId] = useState("");
  const [vkod, setVkod] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const [editableField, setEditableField] = useState(null);
  const lfInputRef = useRef(null);
  const rfInputRef = useRef(null);
  const vkodInputRef = useRef(null);
  const rfScanTimer = useRef(null);
  const lfScanTimer = useRef(null);

  useEffect(() => {
    if (pairingMode) {
      if (pairingMode === "single_rfid_barcode") {
        rfInputRef.current?.focus();
      } else {
        lfInputRef.current?.focus();
      }
    }
  }, [pairingMode]);

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

    const result = await createGongyoleg({
      lf_id: lfId,
      RFID: rfId,
    });
  

    if (!result?.success || !result?.id) {
      throw new Error("A szerver nem adott vissza érvényes pairing ID-t.");
    }

    return result.id;
  };

  const completePairing = async () => {
    if (pairingMode === "double_rfid_barcode") {
      if (!lfId || !rfId || !vkod) {
        setError("Minden mezőt meg kell adnod az aktiváláshoz.");
        setErrorVisible(true);
        return;
      }
    } else if (pairingMode === "single_rfid_barcode") {
      if (!rfId || !vkod) {
        setError("Add meg az RFID-t és a vonalkódot.");
        setErrorVisible(true);
        return;
      }
    } else if (pairingMode === "double_rfid") {
      if (!lfId || !rfId) {
        setError("Add meg mindkét RFID-t.");
        setErrorVisible(true);
        return;
      }
      if (lfId === rfId) {
        setError("A két RFID nem lehet azonos.");
        setErrorVisible(true);
        return;
      }
    }
   
    setSaving(true);
    setError("");
    setErrorVisible(false);

    try {
      if (pairingMode === "double_rfid_barcode") {
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
      } else if (pairingMode === "single_rfid_barcode") {
        const result = await pairRfidBarcode({
          rfid: rfId,
          barcode: vkod,
        });

        if (!result?.success) {
          throw new Error("A párosítás nem sikerült.");
        }
      } else if (pairingMode === "double_rfid") {
        const result = await repairGongyoleg({
          rfid1: lfId,
          rfid2: rfId,
        });

        if (!result?.success) {
          throw new Error("Az RFID-k párosítása nem sikerült.");
        }
      }

      setLfId("");
      setRfId("");
      setVkod("");

      navigation.navigate("Home");
    } catch (err) {
      setError(err.message || "Nem sikerült elvégezni a műveletet.");
      setErrorVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setLfId("");
    setRfId("");
    setVkod("");
    setPairingMode(null);
  };

  return (
    <ScrollView style={styles.screen}>
      <Text style={styles.title}>Párosítás</Text>

      <ErrorPopup
        visible={errorVisible}
        message={error}
        onClose={() => setErrorVisible(false)}
      />

      {pairingMode === null ? (
        <PairingModeSelector onSelectMode={setPairingMode} />
      ) : (
        <PairingForm
          pairingMode={pairingMode}
          lfId={lfId}
          setLfId={setLfId}
          rfId={rfId}
          setRfId={setRfId}
          vkod={vkod}
          setVkod={setVkod}
          saving={saving}
          editableField={editableField}
          lfInputRef={lfInputRef}
          rfInputRef={rfInputRef}
          vkodInputRef={vkodInputRef}
          lfScanTimer={lfScanTimer}
          rfScanTimer={rfScanTimer}
          enableEditing={enableEditing}
          completePairing={completePairing}
          resetForm={resetForm}
        />
      )}
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
    fontSize: 22, 
    fontWeight: "800", 
    color: "#1B3E3A", 
    marginBottom: 6 
  }
});
