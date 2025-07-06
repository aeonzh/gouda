import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Order, getOrderDetails, updateOrderStatus } from 'shared/api/orders';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (typeof id !== 'string') {
      Alert.alert('Error', 'Invalid order ID.');
      router.back();
      return;
    }
    try {
      setLoading(true);
      const orderData = await getOrderDetails(id);
      if (orderData) {
        setOrder(orderData);
      } else {
        Alert.alert('Error', 'Order not found.');
        router.back();
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to fetch order details: ${error.message}`);
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleUpdateStatus = async (newStatus: Order['status']) => {
    if (!order) return;
    setSubmitting(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}.`);
      fetchOrderDetails(); // Refresh order details
    } catch (error: any) {
      Alert.alert('Error', `Failed to update status: ${error.message}`);
      console.error('Error updating order status:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-700">Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-lg text-gray-600">Order not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Order #${order.id.substring(0, 8)}`,
          headerLargeTitle: true,
          headerTransparent: false,
          headerBlurEffect: 'light',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Feather name="arrow-left" size={24} color="#6366F1" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView className="p-4">
        <View className="bg-white rounded-lg shadow-md p-4 mb-4">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Order Summary
          </Text>
          <Text className="text-base text-gray-700">
            <Text className="font-semibold">Status:</Text>{' '}
            <Text
              className={`font-bold ${
                order.status === 'delivered'
                  ? 'text-green-600'
                  : order.status === 'cancelled'
                    ? 'text-red-600'
                    : 'text-blue-600'
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </Text>
          <Text className="text-base text-gray-700">
            <Text className="font-semibold">Total Amount:</Text> $
            {order.total_amount.toFixed(2)}
          </Text>
          <Text className="text-base text-gray-700">
            <Text className="font-semibold">Order Date:</Text>{' '}
            {new Date(order.order_date).toLocaleDateString()}
          </Text>
          <Text className="text-base text-gray-700">
            <Text className="font-semibold">Cuyer ID:</Text> {order.user_id}
          </Text>
          {order.sales_agent_id && (
            <Text className="text-base text-gray-700">
              <Text className="font-semibold">Sales Agent ID:</Text>{' '}
              {order.sales_agent_id}
            </Text>
          )}
        </View>

        <View className="bg-white rounded-lg shadow-md p-4 mb-4">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Shipping Address
          </Text>
          <Text className="text-base text-gray-700">
            {order.shipping_address.street}
          </Text>
          <Text className="text-base text-gray-700">
            {order.shipping_address.city}, {order.shipping_address.state}{' '}
            {order.shipping_address.zip_code}
          </Text>
          <Text className="text-base text-gray-700">
            {order.shipping_address.country}
          </Text>
        </View>

        <View className="bg-white rounded-lg shadow-md p-4 mb-4">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Billing Address
          </Text>
          <Text className="text-base text-gray-700">
            {order.billing_address.street}
          </Text>
          <Text className="text-base text-gray-700">
            {order.billing_address.city}, {order.billing_address.state}{' '}
            {order.billing_address.zip_code}
          </Text>
          <Text className="text-base text-gray-700">
            {order.billing_address.country}
          </Text>
        </View>

        <View className="bg-white rounded-lg shadow-md p-4 mb-4">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Order Items
          </Text>
          {order.order_items?.map((item) => (
            <View
              key={item.id}
              className="flex-row justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <Text className="text-base text-gray-700 flex-1">
                {item.product?.name || 'Unknown Product'} (x{item.quantity})
              </Text>
              <Text className="text-base text-gray-700">
                ${(item.quantity * item.price_at_order).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View className="bg-white rounded-lg shadow-md p-4">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Update Status
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(
              (status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() => handleUpdateStatus(status as Order['status'])}
                  disabled={submitting || order.status === status}
                  className={`w-[48%] p-3 rounded-lg mb-2 flex-row justify-center items-center ${
                    order.status === status
                      ? 'bg-gray-400'
                      : submitting
                        ? 'bg-indigo-300'
                        : 'bg-indigo-600'
                  }`}
                >
                  {submitting && order.status !== status ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white text-base font-semibold">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  )}
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
