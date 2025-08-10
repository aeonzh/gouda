import { Stack, useRouter } from 'expo-router';
import { signUpWithEmail } from 'packages/shared/api/supabase';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      await signUpWithEmail(email, password, fullName);
      router.replace('/login'); // Navigate to login after successful registration
    } catch (error: any) {
      // Avoid alerts in tests/app; optionally track error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 items-center justify-center bg-white p-4'>
      <Stack.Screen options={{ headerShown: false }} />
      <Text className='mb-8 text-3xl font-extrabold text-gray-900'>
        Join Gouda!
      </Text>

      <TextInput
        autoCapitalize='words'
        className='mb-4 w-full rounded-xl border border-gray-300 p-4 text-lg focus:border-blue-500'
        onChangeText={setFullName}
        placeholder='Full Name'
        value={fullName}
      />
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
        className={`w-full rounded-xl p-4 ${loading ? 'bg-green-300' : 'bg-green-600'}`}
        disabled={loading}
        onPress={handleSignUp}
      >
        <Text className='text-center text-lg font-semibold text-white'>
          {loading ? 'Registering...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <View className='mt-8 flex-row'>
        <Text className='text-lg text-gray-700'>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text className='text-lg font-semibold text-blue-600'>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
