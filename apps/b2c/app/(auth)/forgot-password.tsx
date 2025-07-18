import { Stack, useRouter } from 'expo-router';
import { resetPasswordForEmail } from 'packages/shared/api/supabase';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await resetPasswordForEmail(email);
      Alert.alert(
        'Password Reset',
        'If an account with that email exists, a password reset link has been sent to your email.',
      );
      router.push('/login'); // Navigate back to login after sending reset link
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='flex-1 items-center justify-center bg-white p-4'>
      <Stack.Screen options={{ headerShown: false }} />
      <Text className='mb-8 text-3xl font-extrabold text-gray-900'>Forgot Your Password?</Text>
      <Text className='mb-6 text-center text-lg text-gray-700'>
        Enter your email address below and we'll send you a link to reset your password.
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
  );
}
