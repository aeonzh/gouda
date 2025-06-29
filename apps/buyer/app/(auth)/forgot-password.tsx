import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { resetPasswordForEmail } from "../../../packages/shared/api/supabase"; // Adjust path as needed
import { Stack } from "expo-router";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await resetPasswordForEmail(email);
      Alert.alert(
        "Password Reset",
        "If an account with that email exists, a password reset link has been sent to your email."
      );
      router.push("/login"); // Navigate back to login after sending reset link
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
        Forgot Your Password?
      </Text>
      <Text className="text-gray-700 text-lg text-center mb-6">
        Enter your email address below and we'll send you a link to reset your
        password.
      </Text>

      <TextInput
        className="w-full p-4 mb-6 text-lg border border-gray-300 rounded-xl focus:border-blue-500"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TouchableOpacity
        className={`w-full p-4 rounded-xl ${
          loading ? "bg-blue-300" : "bg-blue-600"
        }`}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text className="text-white text-center text-lg font-semibold">
          {loading ? "Sending Link..." : "Send Reset Link"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-4" onPress={() => router.push("/login")}>
        <Text className="text-blue-600 text-lg">Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
