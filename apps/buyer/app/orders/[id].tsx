import { Stack, useLocalSearchParams } from 'expo-router';
import { Order, OrderItem, getOrderDetails } from 'packages/shared/api/orders';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const orderId = typeof id === 'string' ? id : undefined;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError(new Error('Order ID is missing.'));
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const fetchedOrder = await getOrderDetails(orderId);
        setOrder(fetchedOrder);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg font-bold">
          Error loading order:
        </Text>
        <Text className="text-gray-700 text-center mt-2">
          {error.message || 'An unknown error occurred.'}
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl font-bold text-gray-800">
          Order not found.
        </Text>
        <Text className="text-gray-600 mt-2">
          The requested order could not be found.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: `Order #${order.id}` }} />
      <FlatList
        ListHeaderComponent={() => (
          <View className="p-4 bg-white rounded-lg shadow-md mb-4 mx-4 mt-4">
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Order Details
            </Text>
            <Text className="text-base text-gray-700 mb-1">
              Order ID: <Text className="font-semibold">{order.id}</Text>
            </Text>
            <Text className="text-base text-gray-700 mb-1">
              Date:{' '}
              <Text className="font-semibold">
                {new Date(order.order_date).toLocaleDateString()}
              </Text>
            </Text>
            <Text className="text-base text-gray-700 mb-1">
              Status:{' '}
              <Text className="font-semibold text-blue-600">
                {order.status}
              </Text>
            </Text>
            <Text className="text-base text-gray-700 mb-1">
              Total Amount:{' '}
              <Text className="font-bold text-green-700">
                ${order.total_amount?.toFixed(2)}
              </Text>
            </Text>
            <Text className="text-base text-gray-700 mt-2 font-bold">
              Shipping Address:
            </Text>
            <Text className="text-sm text-gray-600">
              {order.shipping_address.street}
            </Text>
            <Text className="text-sm text-gray-600">
              {order.shipping_address.city}, {order.shipping_address.state}{' '}
              {order.shipping_address.zip_code}
            </Text>
            <Text className="text-sm text-gray-600">
              {order.shipping_address.country}
            </Text>
            {order.billing_address && (
              <>
                <Text className="text-base text-gray-700 mt-2 font-bold">
                  Billing Address:
                </Text>
                <Text className="text-sm text-gray-600">
                  {order.billing_address.street}
                </Text>
                <Text className="text-sm text-gray-600">
                  {order.billing_address.city}, {order.billing_address.state}{' '}
                  {order.billing_address.zip_code}
                </Text>
                <Text className="text-sm text-gray-600">
                  {order.billing_address.country}
                </Text>
              </>
            )}
            <Text className="text-xl font-bold text-gray-900 mt-4 mb-2">
              Items
            </Text>
          </View>
        )}
        data={order.order_items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-4 pb-4"
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg shadow-sm p-3 mb-3 border border-gray-200">
            <Text className="text-base font-semibold text-gray-800">
              {item.product?.name || 'Unknown Product'}
            </Text>
            <Text className="text-sm text-gray-600">
              Quantity: {item.quantity}
            </Text>
            <Text className="text-sm text-gray-600">
              Price: ${item.price_at_order?.toFixed(2)}
            </Text>
            <Text className="text-sm text-gray-600">
              Subtotal: ${(item.quantity * item.price_at_order)?.toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="p-4 bg-white rounded-lg shadow-md mx-4">
            <Text className="text-center text-gray-600">
              No items in this order.
            </Text>
          </View>
        )}
      />
    </View>
  );
}
