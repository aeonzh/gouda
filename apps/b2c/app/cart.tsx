import { Stack, useRouter } from 'expo-router';
import {
  addOrUpdateCartItem,
  createOrderFromCart,
  getCartItems,
  getOrCreateCart,
  removeCartItem as removeCartItemApi,
  updateCartItemQuantity as updateCartItemQuantityApi,
} from 'packages/shared/api/orders';
import { Product } from 'packages/shared/api/products';
import { supabase } from 'packages/shared/api/supabase';
import { Button } from 'packages/shared/components';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  const fetchCartItems = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found - not logged in');
      Alert.alert('Error', 'User not logged in.');
      setLoading(false);
      return;
    }

    console.log('Fetching cart items for user:', user.id);

    // Get the user's authorized businesses
    const { data: businesses, error: businessesError } = await supabase
      .from('members')
      .select('business_id')
      .eq('profile_id', user.id);

    if (businessesError || !businesses || businesses.length === 0) {
      console.log('No authorized businesses found for user');
      Alert.alert('Error', 'No authorized businesses found.');
      setCartItems([]);
      setLoading(false);
      return;
    }

    // For now, use the first authorized business
    const businessId = businesses[0].business_id;
    console.log('Using business:', businessId);

    try {
      // Get or create cart using the shared API function
      const cart = await getOrCreateCart(user.id, businessId);
      if (!cart) {
        console.log('Failed to get/create cart');
        Alert.alert('Error', 'Failed to create cart.');
        setLoading(false);
        return;
      }

      console.log('Found cart:', cart);

      // Get cart items using the shared API function
      const cartItemsData = await getCartItems(cart.id);
      if (!cartItemsData) {
        console.log('No cart items found');
        setCartItems([]);
        return;
      }

      console.log('Cart items data:', cartItemsData);
      const items: CartItem[] = cartItemsData
        .filter((item) => item.product !== undefined)
        .map((item) => ({
          product: item.product as Product,
          quantity: item.quantity,
        }));
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Alert.alert('Error', 'Failed to fetch cart items.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = useCallback(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    setTotalPrice(total);
  }, [cartItems]);

  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice]);

  const updateCartItemQuantity = async (
    productId: string,
    newQuantity: number,
  ) => {
    console.log(
      'Updating quantity for product:',
      productId,
      'to:',
      newQuantity,
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found for update');
      return;
    }

    // Get the user's authorized businesses
    const { data: businesses, error: businessesError } = await supabase
      .from('members')
      .select('business_id')
      .eq('profile_id', user.id);

    if (businessesError || !businesses || businesses.length === 0) {
      console.log('No authorized businesses found for update');
      Alert.alert('Error', 'No authorized businesses found.');
      return;
    }

    if (newQuantity <= 0) {
      console.log('Quantity <= 0, removing item');
      await removeCartItem(productId, businesses[0].business_id);
      return;
    }

    try {
      // First get the user's cart
      const cart = await getOrCreateCart(user.id, businesses[0].business_id);
      if (!cart) {
        console.log('No cart found for update');
        return;
      }

      console.log('Found cart for update:', cart.id);

      // Get the cart items to find the cart item ID
      const cartItemsData = await getCartItems(cart.id);
      if (!cartItemsData) {
        console.log('No cart items found for update');
        return;
      }

      const cartItem = cartItemsData.find(
        (item) => item.product_id === productId,
      );
      if (!cartItem) {
        console.log('Cart item not found for update');
        return;
      }

      console.log('Found cart item for update:', cartItem.id);

      // Use the shared API to update quantity
      const updatedItem = await updateCartItemQuantityApi(
        cartItem.id,
        newQuantity,
      );
      if (updatedItem) {
        console.log('Successfully updated quantity');
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: newQuantity }
              : item,
          ),
        );
      }
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      Alert.alert('Error', 'Failed to update item quantity.');
    }
  };

  const removeCartItem = async (productId: string, businessId?: string) => {
    console.log('Removing product from cart:', productId);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found for removal');
      return;
    }

    // Get the user's authorized businesses
    const { data: businesses, error: businessesError } = await supabase
      .from('members')
      .select('business_id')
      .eq('profile_id', user.id);

    if (businessesError || !businesses || businesses.length === 0) {
      console.log('No authorized businesses found for removal');
      Alert.alert('Error', 'No authorized businesses found.');
      return;
    }

    // Use provided business_id or first authorized business
    const targetBusinessId = businessId || businesses[0].business_id;

    try {
      // First get the user's cart
      const cart = await getOrCreateCart(user.id, targetBusinessId);
      if (!cart) {
        console.log('No cart found for removal');
        return;
      }

      console.log('Found cart for removal:', cart.id);

      // Find the cart item ID for the product
      const cartItemsData = await getCartItems(cart.id);
      if (!cartItemsData) {
        console.log('No cart items found for removal');
        return;
      }

      const cartItem = cartItemsData.find(
        (item) => item.product_id === productId,
      );
      if (!cartItem) {
        console.log('Cart item not found for removal');
        return;
      }

      // Use the shared API to remove the item
      await removeCartItemApi(cartItem.id);
      console.log('Successfully removed item');
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.product.id !== productId),
      );
    } catch (error) {
      console.error('Error removing cart item:', error);
      Alert.alert('Error', 'Failed to remove item from cart.');
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

    // Get the user's authorized businesses
    const { data: businesses, error: businessesError } = await supabase
      .from('members')
      .select('business_id')
      .eq('profile_id', user.id);

    if (businessesError || !businesses || businesses.length === 0) {
      console.log('No authorized businesses found for order creation');
      Alert.alert('Error', 'No authorized businesses found.');
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
    try {
      // Use the shared API to create order from cart
      const order = await createOrderFromCart(
        user.id,
        businesses[0].business_id,
      );
      if (!order) {
        throw new Error('Failed to create order');
      }

      router.push({
        params: { orderId: order.id, total: totalPrice.toFixed(2) },
        pathname: '/order-confirmation',
      });
    } catch (error) {
      console.error('Error creating order:', error);
      Alert.alert('Error', 'Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View className='flex-row items-center justify-between border-b border-gray-200 p-4'>
      <View className='flex-1'>
        <Text className='text-lg font-bold'>{item.product.name}</Text>
        <Text className='text-gray-600'>${item.product.price.toFixed(2)}</Text>
      </View>
      <View className='flex-row items-center'>
        <TouchableOpacity
          className='rounded-md bg-red-500 p-2'
          onPress={() =>
            updateCartItemQuantity(item.product.id, item.quantity - 1)
          }
        >
          <Text className='font-bold text-white'>-</Text>
        </TouchableOpacity>
        <Text className='mx-3 text-lg'>{item.quantity}</Text>
        <TouchableOpacity
          className='rounded-md bg-green-500 p-2'
          onPress={() =>
            updateCartItemQuantity(item.product.id, item.quantity + 1)
          }
        >
          <Text className='font-bold text-white'>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className='ml-4 rounded-md bg-gray-300 p-2'
          onPress={() => removeCartItem(item.product.id)}
        >
          <Text className='text-gray-800'>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <Stack.Screen options={{ title: 'Your Cart' }} />
      <View className='flex-1 p-4'>
        {loading ? (
          <Text className='text-center text-lg'>Loading cart...</Text>
        ) : cartItems.length === 0 ? (
          <Text className='text-center text-lg'>Your cart is empty.</Text>
        ) : (
          <FlatList
            contentContainerClassName='pb-4'
            data={cartItems}
            keyExtractor={(item) => item.product.id}
            renderItem={renderCartItem}
          />
        )}

        {!loading && cartItems.length > 0 && (
          <View className='mt-4 border-t border-gray-200 p-4'>
            <Text className='text-right text-xl font-bold'>
              Total: ${totalPrice.toFixed(2)}
            </Text>
            <Button
              className='mt-4 rounded-lg bg-blue-600 py-3'
              onPress={createOrder}
              title='Create Order'
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
