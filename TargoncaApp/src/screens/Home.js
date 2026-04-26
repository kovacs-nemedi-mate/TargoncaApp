import { View, Text, Pressable } from 'react-native';


export default function Home({ navigation }) {
  return (
    <View>
      <Pressable onPress={() => {navigation.navigate("Targonca")}}>
        <Text>Targonca</Text>
      </Pressable>
      <Pressable onPress={() => {navigation.navigate("Pairing")}}>
        <Text>Párosítás</Text>
      </Pressable>
    </View>
  );
}