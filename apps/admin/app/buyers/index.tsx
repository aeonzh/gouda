import { Link, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Profile, getAllBuyers } from 'shared/api/profiles';
import { TabBarIcon } from 'shared/components/TabBarIcon';

export default function AdminBuyerListScreen() {
  const [buyers, setBuyers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      setLoading(true);
      const data = await getAllBuyers();
      if (data) {
        setBuyers(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch buyers');
    } finally {
      setLoading(false);
    }
  };

  const renderBuyerItem = ({ item }: { item: Profile }) => (
    <Link
      href={{ pathname: '/buyers/[id]' as any, params: { id: item.id } }}
      asChild
    >
      <TouchableOpacity className="p-4 border-b border-gray-200 flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold">
            {item.full_name || item.username}
          </Text>
          <Text className="text-gray-600">@{item.username}</Text>
        </View>
        <TabBarIcon name="chevron-forward" color="gray" />
      </TouchableOpacity>
    </Link>
  );

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
          onPress={fetchBuyers}
          className="mt-4 p-2 bg-blue-500 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: 'Manage Buyers',
          headerRight: () => (
            <Link href={{ pathname: '/buyers/manage' as any }} asChild>
              <TouchableOpacity className="p-2">
                <TabBarIcon name="add" color="blue" />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      {buyers.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">No buyers found.</Text>
          <Link href={{ pathname: '/buyers/manage' as any }} asChild>
            <TouchableOpacity className="mt-4 p-2 bg-blue-500 rounded">
              <Text className="text-white">Add New Buyer</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={buyers}
          keyExtractor={(item) => item.id}
          renderItem={renderBuyerItem}
          contentContainerClassName="py-2"
        />
      )}
    </View>
  );
}
