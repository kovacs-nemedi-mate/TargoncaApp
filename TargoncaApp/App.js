import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useNetInfo } from "@react-native-community/netinfo";
import { View, Text, StyleSheet } from "react-native";
import Home from "./src/screens/Home";
import Targonca from "./src/screens/Targonca";
import Pairing from "./src/screens/Pairing";

const Stack = createNativeStackNavigator();

export default function App() {
  const netInfo = useNetInfo();
  const offline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

  return (
    <View style={styles.container}>
      

      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="Targonca"
            component={Targonca}
            options={{ headerTitle: "" }}
          />
          <Stack.Screen
            name="Pairing"
            component={Pairing}
            options={{ headerTitle: "" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    backgroundColor: "#B42318",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});


