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
import { getAllCustomers, Profile } from 'shared/api/profiles';
import { TabBarIcon } from 'shared/components/TabBarIcon';

export default function AdminCustomerListScreen() {
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await getAllCustomers();
      if (data) {
        setCustomers(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const renderCustomerItem = ({ item }: { item: Profile }) => (
    <Link
      asChild
      href={{ params: { id: item.id }, pathname: '/customers/[id]' as any }}
    >
      <TouchableOpacity className='flex-row items-center justify-between border-b border-gray-200 p-4'>
        <View>
          <Text className='text-lg font-semibold'>
            {item.full_name || item.username}
          </Text>
          <Text className='text-gray-600'>@{item.username}</Text>
        </View>
        <TabBarIcon
          color='gray'
          name='chevron-forward'
        />
      </TouchableOpacity>
    </Link>
  );

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator
          color='#0000ff'
          size='large'
        />
      </View>
    );
  }

  if (error) {
    return (
      <View className='flex-1 items-center justify-center p-4'>
        <Text className='text-center text-red-500'>{error}</Text>
        <TouchableOpacity
          className='mt-4 rounded bg-blue-500 p-2'
          onPress={fetchCustomers}
        >
          <Text className='text-white'>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-white'>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link
              asChild
              href={{ pathname: '/customers/manage' as any }}
            >
              <TouchableOpacity className='p-2'>
                <TabBarIcon
                  color='blue'
                  name='add'
                />
              </TouchableOpacity>
            </Link>
          ),
          title: 'Manage Customers',
        }}
      />
      {customers.length === 0 ? (
        <View className='flex-1 items-center justify-center'>
          <Text className='text-gray-500'>No customers found.</Text>
          <Link
            asChild
            href={{ pathname: '/customers/manage' as any }}
          >
            <TouchableOpacity className='mt-4 rounded bg-blue-500 p-2'>
              <Text className='text-white'>Add New Customer</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          contentContainerClassName='py-2'
          data={customers}
          keyExtractor={(item) => item.id}
          renderItem={renderCustomerItem}
        />
      )}
    </View>
  );
}
