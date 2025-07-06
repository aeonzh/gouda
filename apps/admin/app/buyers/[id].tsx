import { Link, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Profile, getBuyerById } from 'shared/api/profiles';
import { TabBarIcon } from 'shared/components/TabBarIcon';

export default function BuyerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [buyer, setBuyer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchBuyerDetails(id as string);
    }
  }, [id]);

  const fetchBuyerDetails = async (buyerId: string) => {
    try {
      setLoading(true);
      const data = await getBuyerById(buyerId);
      if (data) {
        setBuyer(data);
      } else {
        setError('Buyer not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch buyer details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">{error}</Text>
        <TouchableOpacity
          onPress={() => fetchBuyerDetails(id as string)}
          className="mt-4 p-2 bg-blue-500 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!buyer) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">Buyer details not available.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Stack.Screen
        options={{
          title: buyer.full_name || buyer.username,
          headerRight: () => (
            <Link
              href={{
                pathname: '/buyers/manage' as any,
                params: { id: buyer.id },
              }}
              asChild
            >
              <TouchableOpacity className="p-2">
                <TabBarIcon name="create" color="blue" />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <View className="mb-4">
        <Text className="text-xl font-bold mb-2">
          {buyer.full_name || 'N/A'}
        </Text>
        <Text className="text-gray-700">
          <Text className="font-semibold">Username:</Text> @{buyer.username}
        </Text>
        <Text className="text-gray-700">
          <Text className="font-semibold">Role:</Text> {buyer.role}
        </Text>
        <Text className="text-gray-700">
          <Text className="font-semibold">Member Since:</Text>{' '}
          {new Date(buyer.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Add more buyer details here as needed, e.g., addresses, order history summary */}
      <Text className="text-lg font-semibold mt-4">
        Additional Details (Future)
      </Text>
      <Text className="text-gray-500">
        Order history, addresses, etc. will be displayed here.
      </Text>
    </View>
  );
}
