import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Adjust path as needed
import { Product } from '../../../packages/shared/api/products';
import { supabase } from '../../../packages/shared/api/supabase';
// Adjust path as needed
import { Button } from '../../../packages/shared/components/Button';
// Adjust path as needed
import { Input } from '../../../packages/shared/components/Input';

// Adjust path as needed

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const router = useRouter();

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    calculateTotalPrice();
  }, [cartItems]);

  const fetchCartItems = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('carts')
      .select(
        `
        id,
        quantity,
        products (
          id,
          name,
          description,
          price,
          image_url
        )
      `,
      )
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching cart items:', error);
      Alert.alert('Error', 'Failed to fetch cart items.');
    } else {
      const items: CartItem[] = data.map((item: any) => ({
        product: item.products,
        quantity: item.quantity,
      }));
      setCartItems(items);
    }
    setLoading(false);
  };

  const calculateTotalPrice = () => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    setTotalPrice(total);
  };

  const updateCartItemQuantity = async (
    productId: string,
    newQuantity: number,
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (newQuantity <= 0) {
      await removeCartItem(productId);
      return;
    }

    const { error } = await supabase
      .from('carts')
      .update({ quantity: newQuantity })
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      console.error('Error updating cart item quantity:', error);
      Alert.alert('Error', 'Failed to update item quantity.');
    } else {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );
    }
  };

  const removeCartItem = async (productId: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing cart item:', error);
      Alert.alert('Error', 'Failed to remove item from cart.');
    } else {
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product.id !== productId),
      );
    }
  };

  const createOrder = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert(
        'Cart Empty',
        'Please add items to your cart before creating an order.',
      );
      return;
    }

    setLoading(true);
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({ status: 'pending', total_amount: totalPrice, user_id: user.id })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('Error creating order:', orderError);
      Alert.alert('Error', 'Failed to create order.');
      setLoading(false);
      return;
    }

    const orderItems = cartItems.map((item) => ({
      order_id: orderData.id,
      price_at_order: item.product.price,
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError);
      Alert.alert('Error', 'Failed to add products to order.');
      // Optionally, roll back the order if order items fail
      await supabase.from('orders').delete().eq('id', orderData.id);
      setLoading(false);
      return;
    }

    // Clear the cart after successful order creation
    const { error: clearCartError } = await supabase
      .from('carts')
      .delete()
      .eq('user_id', user.id);

    if (clearCartError) {
      console.error('Error clearing cart:', clearCartError);
      // This is a non-critical error, order is already placed.
    }

    setLoading(false);
    router.push({
      params: { orderId: orderData.id, total: totalPrice.toFixed(2) },
      pathname: '/order-confirmation',
    });
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
      <View className="flex-1">
        <Text className="text-lg font-bold">{item.product.name}</Text>
        <Text className="text-gray-600">${item.product.price.toFixed(2)}</Text>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity
          className="bg-red-500 p-2 rounded-md"
          onPress={() =>
            updateCartItemQuantity(item.product.id, item.quantity - 1)
          }
        >
          <Text className="text-white font-bold">-</Text>
        </TouchableOpacity>
        <Text className="mx-3 text-lg">{item.quantity}</Text>
        <TouchableOpacity
          className="bg-green-500 p-2 rounded-md"
          onPress={() =>
            updateCartItemQuantity(item.product.id, item.quantity + 1)
          }
        >
          <Text className="text-white font-bold">+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="ml-4 bg-gray-300 p-2 rounded-md"
          onPress={() => removeCartItem(item.product.id)}
        >
          <Text className="text-gray-800">Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ title: 'Your Cart' }} />
      <View className="flex-1 p-4">
        {loading ? (
          <Text className="text-center text-lg">Loading cart...</Text>
        ) : cartItems.length === 0 ? (
          <Text className="text-center text-lg">Your cart is empty.</Text>
        ) : (
          <FlatList
            contentContainerClassName="pb-4"
            data={cartItems}
            keyExtractor={(item) => item.product.id}
            renderItem={renderCartItem}
          />
        )}

        {!loading && cartItems.length > 0 && (
          <View className="mt-4 p-4 border-t border-gray-200">
            <Text className="text-xl font-bold text-right">
              Total: ${totalPrice.toFixed(2)}
            </Text>
            <Button
              className="mt-4 bg-blue-600 py-3 rounded-lg"
              onPress={createOrder}
              title="Create Order"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
