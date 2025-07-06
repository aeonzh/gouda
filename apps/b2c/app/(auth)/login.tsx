import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { signInWithEmail } from "packages/shared/api/supabase";
import { Stack } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      Alert.alert("Success", "Logged in successfully!");
      // Navigate to main app screen after successful login
      router.replace("/"); // Navigate to the root of the app (e.g., home screen)
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
        Welcome Back!
      </Text>

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
          loading ? "bg-blue-300" : "bg-blue-600"
        }`}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {loading ? "Logging In..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push("/forgot-password")}
      >
        <Text className="text-blue-600 text-lg">Forgot Password?</Text>
      </TouchableOpacity>

      <View className="flex-row mt-8">
        <Text className="text-gray-700 text-lg">Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/signup")}>
          <Text className="text-blue-600 text-lg font-semibold">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
