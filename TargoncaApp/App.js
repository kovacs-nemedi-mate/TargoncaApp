import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { useNetInfo } from "@react-native-community/netinfo";
import { View, StyleSheet } from "react-native";
import Home from "./src/screens/Home";
import Targonca from "./src/screens/Targonca";
import Pairing from "./src/screens/Pairing";
import Settings from "./src/screens/Settings";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
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
  );
}

export default function App() {
  const netInfo = useNetInfo();
  const offline = netInfo.isConnected === false || netInfo.isInternetReachable === false;

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen
            name="HomeTab"
            component={HomeStack}
            options={{ title: "Home" }}
          />
          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{ title: "Settings" }}
          />
        </Tab.Navigator>
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


