import { ErrorBoundary } from '@components/ErrorBoundary';
import { getOrderDetails, Order } from '@shared/api/orders';
import { Stack, useLocalSearchParams } from 'expo-router';
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
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator
          color='#0000ff'
          size='large'
        />
        <Text className='mt-2 text-gray-600'>Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className='flex-1 items-center justify-center bg-white p-4'>
        <Text className='text-lg font-bold text-red-500'>
          Error loading order:
        </Text>
        <Text className='mt-2 text-center text-gray-700'>
          {error.message || 'An unknown error occurred.'}
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <Text className='text-xl font-bold text-gray-800'>
          Order not found.
        </Text>
        <Text className='mt-2 text-gray-600'>
          The requested order could not be found.
        </Text>
      </View>
    );
  }

  const orderDate = order.order_date || order.created_at;

  return (
    <ErrorBoundary>
      <View className='flex-1 bg-gray-100'>
        <Stack.Screen options={{ title: `Order #${order.id}` }} />
        <FlatList
          contentContainerClassName='px-4 pb-4'
          data={order.order_items}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={() => (
            <View className='mx-4 rounded-lg bg-white p-4 shadow-md'>
              <Text className='text-center text-gray-600'>
                No items in this order.
              </Text>
            </View>
          )}
          ListHeaderComponent={() => (
            <View className='mx-4 mb-4 mt-4 rounded-lg bg-white p-4 shadow-md'>
              <Text className='mb-2 text-2xl font-bold text-gray-900'>
                Order Details
              </Text>
              <Text className='mb-1 text-base text-gray-700'>
                Order ID: <Text className='font-semibold'>{order.id}</Text>
              </Text>
              <Text className='mb-1 text-base text-gray-700'>
                Date:{' '}
                <Text className='font-semibold'>
                  {orderDate ? new Date(orderDate).toLocaleDateString() : '—'}
                </Text>
              </Text>
              <Text className='mb-1 text-base text-gray-700'>
                Status:{' '}
                <Text className='font-semibold text-blue-600'>
                  {order.status}
                </Text>
              </Text>
              <Text className='mb-1 text-base text-gray-700'>
                Total Amount:{' '}
                <Text className='font-bold text-green-700'>
                  ${order.total_amount?.toFixed(2)}
                </Text>
              </Text>
              {order.shipping_address && (
                <>
                  <Text className='mt-2 text-base font-bold text-gray-700'>
                    Shipping Address:
                  </Text>
                  <Text className='text-sm text-gray-600'>
                    {order.shipping_address.street}
                  </Text>
                  <Text className='text-sm text-gray-600'>
                    {order.shipping_address.city},{' '}
                    {order.shipping_address.state}{' '}
                    {order.shipping_address.zip_code}
                  </Text>
                  <Text className='text-sm text-gray-600'>
                    {order.shipping_address.country}
                  </Text>
                </>
              )}
              {order.billing_address && (
                <>
                  <Text className='mt-2 text-base font-bold text-gray-700'>
                    Billing Address:
                  </Text>
                  <Text className='text-sm text-gray-600'>
                    {order.billing_address.street}
                  </Text>
                  <Text className='text-sm text-gray-600'>
                    {order.billing_address.city}, {order.billing_address.state}{' '}
                    {order.billing_address.zip_code}
                  </Text>
                  <Text className='text-sm text-gray-600'>
                    {order.billing_address.country}
                  </Text>
                </>
              )}
              <Text className='mb-2 mt-4 text-xl font-bold text-gray-900'>
                Items
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View className='mb-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm'>
              <Text className='text-base font-semibold text-gray-800'>
                {item.product?.name || 'Unknown Product'}
              </Text>
              <Text className='text-sm text-gray-600'>
                Quantity: {item.quantity}
              </Text>
              <Text className='text-sm text-gray-600'>
                Price: ${item.price_at_order?.toFixed(2)}
              </Text>
              <Text className='text-sm text-gray-600'>
                Subtotal: ${(item.quantity * item.price_at_order)?.toFixed(2)}
              </Text>
            </View>
          )}
        />
      </View>
    </ErrorBoundary>
  );
}
