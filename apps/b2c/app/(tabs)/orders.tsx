import { Link, Stack } from 'expo-router';
import { getCustomerOrderHistory, Order } from 'packages/shared/api/orders';
import { supabase } from 'packages/shared/api/supabase';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setOrders([]);
          setError(new Error('You need to be logged in to view orders.'));
          return;
        }
        const fetchedOrders = await getCustomerOrderHistory(user.id);
        setOrders(fetchedOrders || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator
          color='#0000ff'
          size='large'
        />
        <Text className='mt-2 text-gray-600'>Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className='flex-1 items-center justify-center bg-white p-4'>
        <Text className='text-lg font-bold text-red-500'>
          Error loading orders:
        </Text>
        <Text className='mt-2 text-center text-gray-700'>
          {error.message || 'An unknown error occurred.'}
        </Text>
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <Text className='text-xl font-bold text-gray-800'>
          No orders found.
        </Text>
        <Text className='mt-2 text-gray-600'>
          Start shopping to see your order history here!
        </Text>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-100'>
      <Stack.Screen options={{ title: 'Order History' }} />
      <FlatList
        contentContainerClassName='p-4'
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const displayDate = item.order_date || item.created_at;
          return (
            <Link
              asChild
              href={`/orders/${item.id}`}
            >
              <TouchableOpacity className='mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-md active:bg-gray-50'>
                <View className='mb-2 flex-row items-center justify-between'>
                  <Text className='text-lg font-bold text-gray-900'>
                    Order #{item.id}
                  </Text>
                  <Text className='text-sm text-gray-600'>
                    {displayDate
                      ? new Date(displayDate).toLocaleDateString()
                      : '—'}
                  </Text>
                </View>
                <Text className='mb-1 text-base text-gray-700'>
                  Status:{' '}
                  <Text className='font-semibold text-blue-600'>
                    {item.status}
                  </Text>
                </Text>
                <Text className='text-base text-gray-700'>
                  Total:{' '}
                  <Text className='font-bold text-green-700'>
                    ${item.total_amount?.toFixed(2) || 'N/A'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </Link>
          );
        }}
      />
    </View>
  );
}
