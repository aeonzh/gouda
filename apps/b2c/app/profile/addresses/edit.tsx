import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ErrorBoundary } from '../../components/ErrorBoundary';

export default function AddressesEditUnavailableScreen() {
  const router = useRouter();
  return (
    <ErrorBoundary>
      <ScrollView className='flex-1 bg-white p-6'>
        <Text className='mb-2 text-center text-2xl font-bold text-gray-800'>
          Addresses Unavailable
        </Text>
        <Text className='mb-6 text-center text-base text-gray-600'>
          Editing addresses is not available in this build.
        </Text>
        <TouchableOpacity
          className='self-center rounded-lg bg-blue-600 px-5 py-3 shadow-sm'
          onPress={() => router.back()}
        >
          <Text className='text-base font-semibold text-white'>Go Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </ErrorBoundary>
  );
}
