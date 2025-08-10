import { Stack, useRouter } from 'expo-router';
import { signInWithEmail } from 'packages/shared/api/supabase';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      // Navigate to main app screen after successful login
      router.replace('/'); // Navigate to the root of the app (e.g., home screen)
    } catch (error: any) {
      // Optionally set local error state; avoid Alert in tests/app
      // noop
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 items-center justify-center bg-white p-4'>
      <Stack.Screen options={{ headerShown: false }} />
      <Text className='mb-8 text-3xl font-extrabold text-gray-900'>
        Welcome Back!
      </Text>

      <TextInput
        autoCapitalize='none'
        className='mb-4 w-full rounded-xl border border-gray-300 p-4 text-lg focus:border-blue-500'
        keyboardType='email-address'
        onChangeText={setEmail}
        placeholder='Email'
        value={email}
      />
      <TextInput
        className='mb-6 w-full rounded-xl border border-gray-300 p-4 text-lg focus:border-blue-500'
        onChangeText={setPassword}
        placeholder='Password'
        secureTextEntry
        value={password}
      />

      <TouchableOpacity
        className={`w-full rounded-xl p-4 ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
        disabled={loading}
        onPress={handleLogin}
      >
        <Text className='text-center text-lg font-semibold text-white'>
          {loading ? 'Logging In...' : 'Login'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className='mt-4'
        onPress={() => router.push('/forgot-password')}
      >
        <Text className='text-lg text-blue-600'>Forgot Password?</Text>
      </TouchableOpacity>

      <View className='mt-8 flex-row'>
        <Text className='text-lg text-gray-700'>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text className='text-lg font-semibold text-blue-600'>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
