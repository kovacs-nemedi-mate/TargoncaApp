import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { useEffect, useRef, useState } from "react";
import {
  getApiBaseUrl,
  hasStoredApiBaseUrl,
  resetApiBaseUrl,
  setApiBaseUrl,
} from "../services/api";
import ErrorPopup from "../components/ErrorPopup";

const displayBaseUrl = (value) => String(value || "").replace(/^https?:\/\//i, "").replace(/\/+$/, "");

export default function Settings() {
  const [serverAddress, setServerAddress] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressConfigured, setAddressConfigured] = useState(false);
  const [statusText, setStatusText] = useState("Ellenorzes...");
  const [error, setError] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrapAddress = async () => {
      const storedAddressExists = await hasStoredApiBaseUrl();

      if (!active || !mountedRef.current) {
        return;
      }

      if (!storedAddressExists) {
        setServerAddress("");
        setAddressConfigured(false);
        setStatusText("Adj meg egy szerver cimet.");
        return;
      }

      const baseUrl = await getApiBaseUrl();

      if (active && mountedRef.current) {
        setServerAddress(displayBaseUrl(baseUrl));
        setAddressConfigured(true);
        setStatusText("Aktiv szerver elmentve.");
      }
    };

    bootstrapAddress();

    return () => {
      active = false;
    };
  }, []);

  const saveServerAddress = async () => {
    setSavingAddress(true);
    setError("");
    setErrorVisible(false);

    try {
      const savedAddress = await setApiBaseUrl(serverAddress);

      if (mountedRef.current) {
        setServerAddress(displayBaseUrl(savedAddress));
        setAddressConfigured(true);
        setStatusText("Szerver cim elmentve.");
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || "Nem sikerult elmenteni a szervercimet.");
        setErrorVisible(true);
      }
    } finally {
      if (mountedRef.current) {
        setSavingAddress(false);
      }
    }
  };

  const resetServerAddress = async () => {
    setSavingAddress(true);
    setError("");
    setErrorVisible(false);

    try {
      const resetValue = await resetApiBaseUrl();

      if (mountedRef.current) {
        setServerAddress(displayBaseUrl(resetValue));
        setAddressConfigured(true);
        setStatusText("Alapertelmezett szerver beallitva.");
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || "Nem sikerult visszaallitani a szervercimet.");
        setErrorVisible(true);
      }
    } finally {
      if (mountedRef.current) {
        setSavingAddress(false);
      }
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Beallitasok</Text>
        <Text style={styles.title}>Szerver kapcsolat</Text>
        <Text style={styles.subtitle}>{statusText}</Text>
        {addressConfigured ? (
          <Text style={styles.serverAddressLabel}>Aktiv szerver: {serverAddress}</Text>
        ) : null}
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>Szerver cime</Text>
        <Text style={styles.settingsSubtitle}>
          Add meg az IP cimet vagy a teljes URL-t. Az app helyben elmenti a valasztasod.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="192.168.1.50:3004 vagy http://192.168.1.50:3004"
          placeholderTextColor="#7A8783"
          value={serverAddress}
          onChangeText={setServerAddress}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.saveButton, savingAddress && styles.saveButtonDisabled]}
            onPress={saveServerAddress}
            disabled={savingAddress}
          >
            <Text style={styles.saveButtonText}>{savingAddress ? "Mentes..." : "Mentes"}</Text>
          </Pressable>
          <Pressable
            style={[styles.resetButton, savingAddress && styles.saveButtonDisabled]}
            onPress={resetServerAddress}
            disabled={savingAddress}
          >
            <Text style={styles.resetButtonText}>Alapertelmezett</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.hintCard}>
        <Text style={styles.hintTitle}>Tipp</Text>
        <Text style={styles.hintText}>
          Valodi telefonon a geped LAN IP cimet hasznald. Expo Go-hoz a telefon es a gep ugyanazon a halozaton legyen.
        </Text>
      </View>

      <ErrorPopup
        visible={errorVisible && !!error}
        message={error}
        onClose={() => {
          setErrorVisible(false);
        }}
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
    paddingTop: 24,
    paddingBottom: 30,
    gap: 18,
  },
  heroCard: {
    backgroundColor: "#0B2F2B",
    borderRadius: 18,
    padding: 18,
    gap: 6,
  },
  eyebrow: {
    color: "#9ADBCF",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#D8F3EE",
    fontSize: 14,
  },
  serverAddressLabel: {
    color: "#9ADBCF",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D7E7E2",
    gap: 12,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1B3E3A",
  },
  settingsSubtitle: {
    fontSize: 13,
    color: "#4D5C58",
    lineHeight: 18,
  },
  input: {
    backgroundColor: "#F4F7F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1B3E3A",
    borderWidth: 1,
    borderColor: "#D7E7E2",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#0E7A6D",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#EEF3F1",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D7E7E2",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  resetButtonText: {
    color: "#1B3E3A",
    fontWeight: "700",
  },
  hintCard: {
    backgroundColor: "#EAF5F2",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D7E7E2",
    gap: 6,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1B3E3A",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  hintText: {
    fontSize: 13,
    color: "#4D5C58",
    lineHeight: 18,
  },
});
