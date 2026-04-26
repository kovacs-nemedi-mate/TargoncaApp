import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useState } from "react";
import { RadioButton } from "react-native-paper";

export default function Targonca() {
  const [targoncaNev, setTargoncaNev] = useState("");
  const [targoncaTomeg, setTargoncaTomeg] = useState("");
  const [rfId, setRfId] = useState("");
  const [radioValue, setRadioValue] = useState("kint");
  const [sor, setSor] = useState("");
  const [oszlop, setOszlop] = useState("");
  return (
    <View style={styles.container}>
      <View>
        <Text>Targoncanév:</Text>
        <TextInput
          placeholder="Targonca"
          value={targoncaNev}
          onChangeText={setTargoncaNev}
        />
      </View>
      <View>
        <View>
          <Text>Targonca tömeg:</Text>
          <TextInput
            placeholder="Tömeg"
            value={targoncaTomeg}
          onChangeText={setTargoncaTomeg}
          />
        </View>
        <View>
          <Text>RF id:</Text>
          <TextInput
            placeholder="RF id"
            value={rfId}
            onChangeText={setRfId}
          />
        </View>
      </View>
      <View>
        <View>
          <Text>Sor:</Text>
          <Dropdown
            data={[
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
            ]}
            placeholder="Válasszon sor"
            value={sor}
            onChange={(item) => setSor(item.value)}
          />
          
       </View>
        <View>
          <Text>Oszlop:</Text>
          <Dropdown
            data={[
              { label: "1", value: "1" },
              { label: "2", value: "2" },
              { label: "3", value: "3" },
            ]}
            placeholder="Válasszon oszlop"
            value={oszlop}
            onChange={(item) => setOszlop(item.value)}
          />
        </View>
        <View>
          <RadioButton.Group onValueChange={newValue => setRadioValue(newValue)} value={radioValue}>
            <View>
              <Text>Kint</Text>
              <RadioButton 
                value="kint"
                status={radioValue === "kint" ? "checked" : "unchecked"} 
                onPress={() => {setRadioValue("kint")}}
              />
            </View>
            <View>
              <Text>Bent</Text>
              <RadioButton 
                value="bent"
                status={radioValue === "bent" ? "checked" : "unchecked"} 
                onPress={() => {setRadioValue("bent")}}
              />
            </View>
          </RadioButton.Group>
        </View>
        <Pressable
          style={styles.button} 
          onPress={() => {navigation.navigate("Home")}}
        >
          <Text>Mentés</Text>
        </Pressable>
      </View>
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