import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../../packages/shared/components/Button';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { orderId, total } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center p-4">
      <Stack.Screen options={{ title: 'Order Confirmation' }} />
      <View className="bg-green-100 p-8 rounded-lg items-center shadow-md">
        <Text className="text-4xl font-bold text-green-700 mb-4">🎉</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Order Placed Successfully!
        </Text>
        <Text className="text-lg text-gray-600 mb-1">
          Your order ID: <Text className="font-bold">{orderId}</Text>
        </Text>
        <Text className="text-lg text-gray-600 mb-6">
          Total amount: <Text className="font-bold">${total}</Text>
        </Text>
        <Button
          onPress={() => router.replace('/orders')}
          title="View My Orders"
          className="bg-blue-600 py-3 px-6 rounded-lg mb-4"
        />
        <Button
          onPress={() => router.replace('/products')}
          title="Continue Shopping"
          className="bg-gray-300 py-3 px-6 rounded-lg text-gray-800"
        />
      </View>
    </SafeAreaView>
  );
}
