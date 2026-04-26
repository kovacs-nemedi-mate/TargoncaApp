import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useState } from "react";

export default function Pairing({ navigation }) {
  const [barcode, setBarcode] = useState("");
  const [rfId, setRfId] = useState("");
  return (
    <View style={styles.container}>
      <Text>Vonalkód</Text>
      <TextInput
        placeholder="Add meg a vonalkódot"
        value={barcode}
        onChangeText={setBarcode}
      />
      <TextInput
        placeholder="Add meg az RF id-t"
        value={rfId}
        onChangeText={setRfId}
      />
      <Pressable
        style={styles.button}
        onPress={() => {navigation.navigate("Home")}}
      >
        <Text>Mentés</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  
  button: {
    backgroundColor: "lightblue",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
});