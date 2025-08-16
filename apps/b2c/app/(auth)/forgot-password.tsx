import { ErrorBoundary } from '@components/ErrorBoundary';
import { resetPasswordForEmail } from '@shared/api/auth';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await resetPasswordForEmail(email);
      router.push('/login');
    } catch (error: any) {
      // Avoid alerts in tests/app; optionally track error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <View className='flex-1 items-center justify-center bg-white p-4'>
        <Stack.Screen options={{ headerShown: false }} />
        <Text className='mb-8 text-3xl font-extrabold text-gray-900'>
          Forgot Your Password?
        </Text>
        <Text className='mb-6 text-center text-lg text-gray-700'>
          Enter your email address below and we will send you a link to reset
          your password.
        </Text>

        <TextInput
          autoCapitalize='none'
          className='mb-6 w-full rounded-xl border border-gray-300 p-4 text-lg focus:border-blue-500'
          keyboardType='email-address'
          onChangeText={setEmail}
          placeholder='Email'
          value={email}
        />

        <TouchableOpacity
          className={`w-full rounded-xl p-4 ${loading ? 'bg-blue-300' : 'bg-blue-600'}`}
          disabled={loading}
          onPress={handleResetPassword}
        >
          <Text className='text-center text-lg font-semibold text-white'>
            {loading ? 'Sending Link...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className='mt-4'
          onPress={() => router.push('/login')}
        >
          <Text className='text-lg text-blue-600'>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ErrorBoundary>
  );
}
