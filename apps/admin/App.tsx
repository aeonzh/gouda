import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import "./global.css";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold">Admin Home Screen</Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Admin Dashboard" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
