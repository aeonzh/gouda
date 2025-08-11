import { Link, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getCustomerById, Profile } from 'shared/api/profiles';
import { TabBarIcon } from 'shared/components/TabBarIcon';

export default function CustomerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [customer, setCustomer] = useState<null | Profile>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (id) {
      fetchCustomerDetails(id as string);
    }
  }, [id]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      setLoading(true);
      const data = await getCustomerById(customerId);
      if (data) {
        setCustomer(data);
      } else {
        setError('Customer not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer details');
    } finally {
      setLoading(false);
    }
  };

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
          onPress={() => fetchCustomerDetails(id as string)}
        >
          <Text className='text-white'>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!customer) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text className='text-gray-500'>Customer details not available.</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-white p-4'>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link
              asChild
              href={{
                params: { id: customer.id },
                pathname: '/customers/manage' as any,
              }}
            >
              <TouchableOpacity className='p-2'>
                <TabBarIcon
                  color='blue'
                  name='create'
                />
              </TouchableOpacity>
            </Link>
          ),
          title: customer.full_name || customer.username,
        }}
      />
      <View className='mb-4'>
        <Text className='mb-2 text-xl font-bold'>
          {customer.full_name || 'N/A'}
        </Text>
        <Text className='text-gray-700'>
          <Text className='font-semibold'>Username:</Text> @{customer.username}
        </Text>
        <Text className='text-gray-700'>
          <Text className='font-semibold'>Role:</Text> {customer.role}
        </Text>
        <Text className='text-gray-700'>
          <Text className='font-semibold'>Member Since:</Text>{' '}
          {new Date(customer.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Add more customer details here as needed, e.g., addresses, order history summary */}
      <Text className='mt-4 text-lg font-semibold'>
        Additional Details (Future)
      </Text>
      <Text className='text-gray-500'>
        Order history, addresses, etc. will be displayed here.
      </Text>
    </View>
  );
}
