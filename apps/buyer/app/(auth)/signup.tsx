import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { signUpWithEmail } from "../../../packages/shared/api/supabase"; // Adjust path as needed
import { Stack } from "expo-router";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      await signUpWithEmail(email, password, fullName);
      Alert.alert(
        "Success",
        "Account created! Please check your email to verify."
      );
      navigation.navigate("login"); // Navigate to login after successful registration
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Stack.Screen options={{ headerShown: false }} />
      <Text className="text-3xl font-extrabold text-gray-900 mb-8">
        Join Gouda!
      </Text>

      <TextInput
        className="w-full p-4 mb-4 text-lg border border-gray-300 rounded-xl focus:border-blue-500"
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />
      <TextInput
        className="w-full p-4 mb-4 text-lg border border-gray-300 rounded-xl focus:border-blue-500"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="w-full p-4 mb-6 text-lg border border-gray-300 rounded-xl focus:border-blue-500"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className={`w-full p-4 rounded-xl ${
          loading ? "bg-green-300" : "bg-green-600"
        }`}
        onPress={handleSignUp}
        disabled={loading}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {loading ? "Registering..." : "Sign Up"}
        </Text>
      </TouchableOpacity>

      <View className="flex-row mt-8">
        <Text className="text-gray-700 text-lg">Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text className="text-blue-600 text-lg font-semibold">Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
