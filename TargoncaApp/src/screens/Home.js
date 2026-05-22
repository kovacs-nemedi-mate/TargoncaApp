import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { useEffect, useRef, useState } from "react";
import { apiGet, getApiBaseUrl, hasStoredApiBaseUrl, setApiBaseUrl } from "../services/api";
import ErrorPopup from "../components/ErrorPopup";

const displayBaseUrl = (value) => String(value || "").replace(/^https?:\/\//i, "").replace(/\/+$/, "");

export default function Home({ navigation }) {
  const [serverStatus, setServerStatus] = useState("Ellenőrzés...");
  const [targoncak, setTargoncak] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [serverAddress, setServerAddress] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressConfigured, setAddressConfigured] = useState(false);
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
        setServerStatus("Add meg a szerver címét a folytatáshoz.");
        return;
      }

      const baseUrl = await getApiBaseUrl();

      if (active && mountedRef.current) {
        setServerAddress(displayBaseUrl(baseUrl));
        setAddressConfigured(true);
      }
    };

    bootstrapAddress();

    return () => {
      active = false;
    };
  }, []);

  const loadServerData = async () => {
    if (!addressConfigured) {
      return;
    }

    if (!mountedRef.current) {
      return;
    }

    setError("");
    setErrorVisible(false);

    try {
      const data = await apiGet("/health");
      if (mountedRef.current) {
        setServerStatus(data?.status === "ok" ? "Szerver elérhető" : "Ismeretlen állapot");
      }
    } catch (err) {
      if (mountedRef.current) {
        setServerStatus("Szerver nem érhető el");
        setError(err.message || "A szerver nem érhető el.");
        setErrorVisible(true);
      }
    }

    try {
      const rows = await apiGet("/targonca");
      if (mountedRef.current) {
        const list = Array.isArray(rows)
          ? rows
          : Array.isArray(rows?.data)
            ? rows.data
            : Array.isArray(rows?.rows)
              ? rows.rows
              : Array.isArray(rows?.items)
                ? rows.items
                : [];
        setTargoncak(list);
        if (list.length > 0) {
          setSelectedIndex(0);
          setSelectedItem(list[0]);
        } else {
          setSelectedIndex(0);
          setSelectedItem(null);
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setTargoncak([]);
        if (!errorVisible) {
          setError(err.message || "Nem sikerült betölteni a szerveradatokat.");
          setErrorVisible(true);
        }
      }
    }
  };

  useEffect(() => {
    loadServerData();
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
      }

      return;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || "Nem sikerült elmenteni a szervercímet.");
        setErrorVisible(true);
      }
    } finally {
      if (mountedRef.current) {
        setSavingAddress(false);
      }
    }
  };


  useEffect(() => {
    if (!addressConfigured) {
      return;
    }

    loadServerData();
  }, [addressConfigured]);


  return (
    <ScrollView style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>TargoncaApp</Text>
        <Text style={styles.subtitle}>Valassz egy muveletet a folytatashoz.</Text>
       
      </View>

      {!addressConfigured ? (
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Szerver címe</Text>
          <Text style={styles.settingsSubtitle}>Add meg az IP címet vagy a teljes URL-t, és az app elmenti helyben.</Text>
          <TextInput
            style={styles.input}
            placeholder="192.168.1.50 vagy http://192.168.1.50:3004"
            placeholderTextColor="#7A8783"
            value={serverAddress}
            onChangeText={setServerAddress}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Pressable
            style={[styles.saveButton, savingAddress && styles.saveButtonDisabled]}
            onPress={saveServerAddress}
            disabled={savingAddress}
          >
            <Text style={styles.saveButtonText}>{savingAddress ? "Mentés..." : "Mentés"}</Text>
          </Pressable>
        </View>
      ) : null}

      {!addressConfigured ? (
        <View style={styles.lockCard}>
          <Text style={styles.lockTitle}>Kezdéshez add meg a szerver címét.</Text>
          <Text style={styles.lockText}>Az app addig nem enged tovább, amíg nincs elmentve érvényes IP vagy URL.</Text>
        </View>
      ) : (
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Aktív targonca</Text>
            <Text style={styles.previewCount}>{targoncak.length} rekord</Text>
          </View>

          {targoncak.length === 0 ? (
            <Text style={styles.previewEmpty}>Nincs elérhető targonca.</Text>
          ) : (
            targoncak.map((item, idx) => {
              const rfid = item?.RFID ?? item?.rfid ?? "";
              const selected = idx === selectedIndex;

              return (
                <Pressable
                  key={`${rfid || item.nev || idx}`}
                  onPress={() => {
                    setSelectedIndex(idx);
                    setSelectedItem(item);
                  }}
                  style={({ pressed }) => [
                    styles.previewRow,
                    selected && styles.apiRowSelected,
                    pressed && styles.previewPressed,
                  ]}
                >
                  <Text style={styles.previewMain}>{item.nev}</Text>
                  <Text style={styles.previewMeta}>RFID: {rfid || "-"}</Text>
                </Pressable>
              );
            })
          )}
        </View>
      )}

      {addressConfigured ? (
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => {
              navigation.navigate("Targonca", { selectedItem });
            }}
          >
            <Text style={styles.primaryButtonText}>Targonca adatlap</Text>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => {
              navigation.navigate("Pairing");
            }}
          >
            <Text style={styles.secondaryButtonText}>Párosítás</Text>
          </Pressable>
        </View>
      ) : null}

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
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  heroCard: {
    backgroundColor: "#1D4E4A",
    borderRadius: 18,
    padding: 20,
    marginBottom: 24,
  },
  eyebrow: {
    color: "#BCE9E1",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    fontWeight: "700",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "#D8F2EE",
    fontSize: 14,
    marginBottom: 10,
  },
  serverStatus: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    paddingTop: 4,
  },
  settingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7E3",
    marginBottom: 18,
    gap: 10,
  },
  settingsTitle: {
    color: "#1B3E3A",
    fontSize: 16,
    fontWeight: "800",
  },
  settingsSubtitle: {
    color: "#5D6F6A",
    fontSize: 13,
  },
  lockCard: {
    backgroundColor: "#FFF3E6",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F4D2AF",
    marginBottom: 18,
    gap: 6,
  },
  lockTitle: {
    color: "#7A4310",
    fontSize: 16,
    fontWeight: "800",
  },
  lockText: {
    color: "#9C5F22",
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderColor: "#C8D7D1",
    borderRadius: 12,
    backgroundColor: "#FAFCFB",
    color: "#1B3E3A",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  saveButton: {
    backgroundColor: "#0E7A6D",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 14,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DDE7E3",
    marginBottom: 18,
    gap: 10,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewTitle: {
    color: "#1B3E3A",
    fontSize: 16,
    fontWeight: "800",
  },
  previewCount: {
    color: "#0E7A6D",
    fontWeight: "700",
  },
  previewRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF3F1",
  },
  previewPressed: {
    backgroundColor: "#DFF7F1",
  },
  previewMain: {
    color: "#1B3E3A",
    fontWeight: "700",
  },
  previewMeta: {
    color: "#5D6F6A",
    marginTop: 2,
  },
  previewEmpty: {
    color: "#5D6F6A",
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  primaryButton: {
    backgroundColor: "#0E7A6D",
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D4DFDA",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButtonText: {
    color: "#224A45",
    fontSize: 16,
    fontWeight: "700",
  },
});