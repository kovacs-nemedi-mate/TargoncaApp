import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import ErrorPopup from "../components/ErrorPopup";

export default function Home({ navigation }) {
  const [serverStatus, setServerStatus] = useState("Ellenőrzés...");
  const [targoncak, setTargoncak] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedRfId, setSelectedRfId] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);

  useEffect(() => {
    let active = true;

    const loadServerData = async () => {
      setError("");
      setErrorVisible(false);

      try {
        const data = await apiGet("/health");
        if (active) {
          setServerStatus(data?.status === "ok" ? "Szerver elérhető" : "Ismeretlen állapot");
        }
      } catch (err) {
        if (active) {
          setServerStatus("Szerver nem érhető el");
          setError(err.message || "A szerver nem érhető el.");
          setErrorVisible(true);
        }
      }

      try {
        const rows = await apiGet("/targonca");
        if (active) {
          const list = Array.isArray(rows) ? rows : [];
          setTargoncak(list);
          if (list.length > 0) {
            setSelectedIndex(0);
            setSelectedRfId(list[0]?.RFID ?? list[0]?.rfid ?? "");
          } else {
            setSelectedIndex(0);
            setSelectedRfId("");
          }
        }
      } catch (err) {
        if (active) {
          setTargoncak([]);
          if (!errorVisible) {
            setError(err.message || "Nem sikerült betölteni a szerveradatokat.");
            setErrorVisible(true);
          }
        }
      } finally {
        if (active) {
          setLoadingData(false);
        }
      }
    };

    loadServerData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>TargoncaApp</Text>
        <Text style={styles.title}>Fooldal</Text>
        <Text style={styles.subtitle}>Valassz egy muveletet a folytatashoz.</Text>
        <Text style={styles.serverStatus}>{serverStatus}</Text>
      </View>

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
                  setSelectedRfId(rfid);
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