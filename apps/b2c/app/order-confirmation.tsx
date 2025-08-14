import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from 'packages/shared/components';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorBoundary } from '../components/ErrorBoundary';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { orderId, total } = useLocalSearchParams();

  return (
    <ErrorBoundary>
      <SafeAreaView className='flex-1 items-center justify-center bg-white p-4'>
        <Stack.Screen options={{ title: 'Order Confirmation' }} />
        <View className='items-center rounded-lg bg-green-100 p-8 shadow-md'>
          <Text className='mb-4 text-4xl font-bold text-green-700'>🎉</Text>
          <Text className='mb-2 text-2xl font-bold text-gray-800'>
            Order Placed Successfully!
          </Text>
          <Text className='mb-1 text-lg text-gray-600'>
            Your order ID: <Text className='font-bold'>{orderId}</Text>
          </Text>
          <Text className='mb-6 text-lg text-gray-600'>
            Total amount: <Text className='font-bold'>${total}</Text>
          </Text>
          <Button
            className='mb-4 rounded-lg bg-blue-600 px-6 py-3'
            onPress={() => router.replace('/(tabs)/orders')}
            title='View My Orders'
          />
          <Button
            className='rounded-lg bg-gray-300 px-6 py-3 text-gray-800'
            onPress={() => router.replace('/(tabs)')}
            title='Continue Shopping'
          />
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
