import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ErrorBoundary } from '../../components/ErrorBoundary';

export default function AddressesUnavailableScreen() {
  const router = useRouter();
  return (
    <ErrorBoundary>
      <View className='flex-1 items-center justify-center bg-white p-6'>
        <Text className='mb-2 text-2xl font-bold text-gray-800'>
          Addresses Unavailable
        </Text>
        <Text className='mb-6 text-center text-base text-gray-600'>
          Address management is not available in this build.
        </Text>
        <TouchableOpacity
          className='rounded-lg bg-blue-600 px-5 py-3 shadow-sm'
          onPress={() => router.back()}
        >
          <Text className='text-base font-semibold text-white'>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ErrorBoundary>
  );
}
