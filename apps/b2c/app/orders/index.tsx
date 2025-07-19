import { Link, Stack } from 'expo-router';
import { getCustomerOrderHistory, Order } from 'packages/shared/api/orders';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual user ID from authentication context
        const fetchedOrders = await getCustomerOrderHistory('current_user_id');
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
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator color="#0000ff" size="large" />
        <Text className="mt-2 text-gray-600">Loading orders...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg font-bold">
          Error loading orders:
        </Text>
        <Text className="text-gray-700 text-center mt-2">
          {error.message || 'An unknown error occurred.'}
        </Text>
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl font-bold text-gray-800">
          No orders found.
        </Text>
        <Text className="text-gray-600 mt-2">
          Start shopping to see your order history here!
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: 'Order History' }} />
      <FlatList
        contentContainerClassName="p-4"
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link asChild href={`/orders/${item.id}`}>
            <TouchableOpacity className="bg-white rounded-lg shadow-md p-4 mb-4 border border-gray-200 active:bg-gray-50">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-lg font-bold text-gray-900">
                  Order #{item.id}
                </Text>
                <Text className="text-sm text-gray-600">
                  {new Date(item.order_date).toLocaleDateString()}
                </Text>
              </View>
              <Text className="text-base text-gray-700 mb-1">
                Status:{' '}
                <Text className="font-semibold text-blue-600">
                  {item.status}
                </Text>
              </Text>
              <Text className="text-base text-gray-700">
                Total:{' '}
                <Text className="font-bold text-green-700">
                  ${item.total_amount?.toFixed(2) || 'N/A'}
                </Text>
              </Text>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}
