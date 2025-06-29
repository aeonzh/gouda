import { useState } from "react";
import { View, Text, Alert } from "react-native";
import { Input } from "shared/components/Input";
import { Button } from "shared/components/Button";
import { signIn } from "shared/api/supabase";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
      // Session change will be handled by the root layout
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-4 bg-gray-50">
      <View className="w-full max-w-sm">
        <Text className="text-3xl font-bold text-center mb-8 text-gray-800">
          Admin Login
        </Text>
        <Input
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="mb-4"
        />
        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="mb-6"
        />
        <Button
          title={loading ? "Logging in..." : "Login"}
          onPress={handleLogin}
          disabled={loading}
        />
      </View>
    </View>
  );
}
