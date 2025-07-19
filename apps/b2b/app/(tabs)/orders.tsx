import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCustomerOrderHistory, Order } from 'shared/api/orders';

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      // For admin, we might want to fetch all orders, not just for a specific customer.
      // The current getCustomerOrderHistory requires a userId.
      // For now, we'll assume we fetch all orders if userId is not provided, or we'll need a new API function.
      // Let's adapt getCustomerOrderHistory to fetch all orders if userId is null/undefined for admin view.
      // This will require a modification to getCustomerOrderHistory in packages/shared/api/orders.ts
      // For now, I'll mock it or fetch a limited set.
      // TODO: Implement proper admin API for fetching all orders.
      const ordersData = await getCustomerOrderHistory(null as any); // Temporarily pass null to fetch all orders (will modify API)
      setOrders(ordersData || []);
    } catch (error: any) {
      Alert.alert('Error', `Failed to fetch orders: ${error.message}`);
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      className="p-4 border-b border-gray-200 bg-white"
      onPress={() =>
        router.push({ params: { id: item.id }, pathname: 'orders/[id]' })
      }
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-semibold text-gray-800">
          Order #{item.id.substring(0, 8)}
        </Text>
        <Text
          className={`text-sm font-medium ${
            item.status === 'delivered'
              ? 'text-green-600'
              : item.status === 'cancelled'
                ? 'text-red-600'
                : 'text-blue-600'
          }`}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
      <Text className="text-sm text-gray-600 mt-1">
        Total: ${item.total_amount.toFixed(2)}
      </Text>
      <Text className="text-xs text-gray-500 mt-1">
        Date: {new Date(item.order_date).toLocaleDateString()}
      </Text>
      <Text className="text-xs text-gray-500 mt-1">
        Customer ID: {item.customer_id.substring(0, 8)}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator color="#6366F1" size="large" />
        <Text className="mt-4 text-gray-700">Loading orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {orders.length === 0 && !loading ? (
        <View className="flex-1 justify-center items-center p-4">
          <Feather color="#9CA3AF" name="clipboard" size={60} />
          <Text className="text-xl text-gray-600 mt-4 font-semibold">
            No Orders Found
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            It looks like there are no orders yet.
          </Text>
        </View>
      ) : (
        <FlatList
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 20 }}
          data={orders}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl onRefresh={onRefresh} refreshing={refreshing} />
          }
          renderItem={renderOrderItem}
        />
      )}
    </SafeAreaView>
  );
}
