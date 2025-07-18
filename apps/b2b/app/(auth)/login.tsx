import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { signInWithEmail } from 'shared/api/supabase';
import { Button } from 'shared/components/Button';
import { Input } from 'shared/components/Input';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      // Session change will be handled by the root layout
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-gradient-to-br from-blue-600 to-purple-700">
      <View className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
        <Text className="text-4xl font-extrabold text-center mb-2 text-gray-900">
          Welcome Back
        </Text>
        <Text className="text-lg text-center text-gray-600 mb-8">
          Admin Portal
        </Text>
        <Input
          className="mb-4"
          inputClassName="border-gray-300 focus:border-blue-500"
          keyboardType="email-address"
          label="Email Address"
          onChangeText={setEmail}
          placeholder="admin@example.com"
          value={email}
        />
        <Input
          className="mb-6"
          inputClassName="border-gray-300 focus:border-blue-500"
          label="Password"
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          value={password}
        />
        <Button
          className="w-full py-3"
          disabled={loading}
          onPress={handleLogin}
          size="lg"
          title={loading ? 'Authenticating...' : 'Login Securely'}
        />
      </View>
    </View>
  );
}
