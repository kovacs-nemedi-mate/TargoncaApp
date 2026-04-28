import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./src/screens/Home";
import Targonca from "./src/screens/Targonca";
import Pairing from "./src/screens/Pairing";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
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
  );
}


