import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { useNetInfo } from "@react-native-community/netinfo";
import { View, Text, StyleSheet, SafeAreaView, Platform, StatusBar } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Home from "./src/screens/Home";
import Targonca from "./src/screens/Targonca";
import Pairing from "./src/screens/Pairing";
import Settings from "./src/screens/Settings";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { height: 44 },
        headerTitleStyle: {
          fontSize: 14,
          fontWeight: "700",
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerLargeTitle: false,
      }}
    >
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
      {offline ? (
        <SafeAreaView style={styles.bannerContainer}>
          <View style={styles.banner}>
            <Text style={styles.bannerText}>Nincs hálózati kapcsolat. A szerver nem lesz elérhető.</Text>
          </View>
        </SafeAreaView>
      ) : null}
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "#1D4ED8",
            tabBarInactiveTintColor: "#64748B",
          }}
        >
          <Tab.Screen
            name="HomeTab"
            component={HomeStack}
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home-outline" color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={Settings}
            options={{
              title: "Settings",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings-outline" color={color} size={size} />
              ),
            }}
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
  bannerContainer: {
    backgroundColor: "#B42318",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  banner: {
    backgroundColor: "#B42318",
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center",
  },
  bannerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});


