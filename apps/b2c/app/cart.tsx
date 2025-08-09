import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  createOrderFromCart,
  getCartItems,
  getOrCreateCart,
  removeCartItem as removeCartItemApi,
  updateCartItemQuantity as updateCartItemQuantityApi,
} from 'packages/shared/api/orders';
import { Product } from 'packages/shared/api/products';
import { supabase } from 'packages/shared/api/supabase';
import { Button } from 'packages/shared/components';
import { QuantitySelector } from 'packages/shared/components/QuantitySelector';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CartItem {
  cart_id: string;
  id: string;
  product_id: string;
  price_at_time_of_add: number;
  product?: Product; // Optional: to include product details when fetching cart
  quantity: number;
  created_at: string;
  updated_at: string;
}

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const { businessId: paramBusinessId } = useLocalSearchParams();
  const router = useRouter();

  console.log('=== DEBUG: CartScreen - paramBusinessId:', paramBusinessId);

  const fetchCartItems = useCallback(async () => {
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

    console.log(
      '=== DEBUG: CartScreen - Fetching cart items for user:',
      user.id,
    );

    // Get the user's authorized businesses
    const { data: businesses, error: businessesError } = await supabase
      .from('members')
      .select('business_id')
      .eq('profile_id', user.id);

    if (businessesError || !businesses || businesses.length === 0) {
      console.log(
        '=== DEBUG: CartScreen - No authorized businesses found for user ===',
      );
      Alert.alert('Error', 'No authorized businesses found.');
      setCartItems([]);
      setLoading(false);
      return;
    }

    console.log(
      '=== DEBUG: CartScreen - Authorized businesses:',
      businesses.map((b) => b.business_id),
    );

    // For now, use the first authorized business
    const businessId = (paramBusinessId as string) || businesses[0].business_id;
    console.log('=== DEBUG: CartScreen - Using businessId:', businessId); // Added log
    console.log('Businesses from members table:', businesses); // Added log

    try {
      // Get or create cart using the shared API function
      const cart = await getOrCreateCart(user.id, businessId);
      if (!cart) {
        console.log('=== DEBUG: CartScreen - Failed to get/create cart ===');
        Alert.alert('Error', 'Failed to create cart.');
        setLoading(false);
        return;
      }

      console.log('=== DEBUG: CartScreen - Found cart:', cart);

      // Get cart items using the shared API function
      console.log(
        '=== DEBUG: CartScreen - About to fetch cart items for cartId:',
        cart.id,
        'with businessId:',
        cart.business_id,
      );
      const cartItemsData = await getCartItems(cart.id);
      if (!cartItemsData) {
        console.log('=== DEBUG: CartScreen - No cart items found ===');
        setCartItems([]);
        return;
      }

      console.log('Cart items data:', cartItemsData);
      cartItemsData.forEach((item) =>
        console.log('DEBUG: Individual cart item product:', item.product),
      );
      console.log('Cart items data BEFORE filter:', cartItemsData);
      const items: CartItem[] = cartItemsData.map((item) => {
        const processedProduct = Array.isArray(item.product)
          ? (item.product.length > 0 ? (item.product[0] as Product) : undefined)
          : (item.product as Product | undefined);
        console.log('DEBUG: Mapped item product:', processedProduct);
        return {
          ...item,
          product: processedProduct,
        };
      });
      console.log('=== DEBUG: CartScreen - Processed cart items for state:', items);
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Alert.alert('Error', 'Failed to fetch cart items.');
    } finally {
      setLoading(false);
    }
  }, [paramBusinessId]); // Added paramBusinessId to dependency array

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const calculateTotalPrice = useCallback(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity,
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
    console.log('=== DEBUG: updateCartItemQuantity started ===');
    console.log('Product ID:', productId);
    console.log('New quantity:', newQuantity);
    console.log('Current cart items:', cartItems);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found for update');
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    // Get the user's authorized businesses
    const { data: businesses, error: businessesError } = await supabase
      .from('members')
      .select('business_id')
      .eq('profile_id', user.id);

    if (businessesError || !businesses || businesses.length === 0) {
      console.log('No authorized businesses found for update');
      console.log('Business error:', businessesError);
      Alert.alert('Error', 'No authorized businesses found.');
      return;
    }

    console.log(
      'Authorized businesses:',
      businesses.map((b) => b.business_id),
    );

    const targetBusinessId =
      (paramBusinessId as string) || businesses[0].business_id;

    if (newQuantity <= 0) {
      console.log('Quantity <= 0, removing item');
      await removeCartItem(productId);
      console.log('=== DEBUG: updateCartItemQuantity completed (removal) ===');
      return;
    }

    try {
      // First get the user's cart
      const cart = await getOrCreateCart(user.id, targetBusinessId);
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

      console.log('Cart items data from API:', cartItemsData);

      const cartItem = cartItemsData.find(
        (item) => item.product_id === productId,
      );
      if (!cartItem) {
        console.log('Cart item not found for update');
        console.log(
          'Available product IDs in cart:',
          cartItemsData.map((item) => item.product_id),
        );
        return;
      }

      console.log('Found cart item for update:', cartItem.id);
      console.log('Current quantity in cart item:', cartItem.quantity);

      // Use the shared API to update quantity
      const updatedItem = await updateCartItemQuantityApi(
        cartItem.id,
        newQuantity,
      );
      console.log('API response from updateCartItemQuantityApi:', updatedItem);

      if (updatedItem) {
        console.log('Successfully updated quantity');
        fetchCartItems();
      }
      console.log(
        '=== DEBUG: updateCartItemQuantity completed successfully ===',
      );
    } catch (error) {
      console.error('=== DEBUG: Error updating cart item quantity ===', error);
      Alert.alert('Error', 'Failed to update item quantity.');
    }
  };

  const removeCartItem = async (productId: string) => {
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
    const targetBusinessId =
      (paramBusinessId as string) || businesses[0].business_id;

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
      fetchCartItems();
    } catch (error) {
      console.error('Error removing cart item:', error);
      Alert.alert('Error', 'Failed to remove item from cart.');
    }
  };

  const createOrder = async () => {
    console.log('=== DEBUG: createOrder called ===');
    console.log('Current cart items:', cartItems);
    console.log('Total price:', totalPrice);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log('=== DEBUG: No user found for order creation ===');
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    // Get the user's authorized businesses
    const { data: businesses, error: businessesError } = await supabase
      .from('members')
      .select('business_id')
      .eq('profile_id', user.id);

    if (businessesError || !businesses || businesses.length === 0) {
      console.log(
        '=== DEBUG: No authorized businesses found for order creation ===',
      );
      Alert.alert('Error', 'No authorized businesses found.');
      return;
    }

    if (cartItems.length === 0) {
      console.log('=== DEBUG: Cart is empty, cannot create order ===');
      Alert.alert(
        'Cart Empty',
        'Please add items to your cart before creating an order.',
      );
      return;
    }

    setLoading(true);
    try {
      console.log('=== DEBUG: Creating order from cart ===');
      // Use the shared API to create order from cart
      const order = await createOrderFromCart(
        user.id,
        (paramBusinessId as string) || businesses[0].business_id,
      );
      if (!order) {
        console.log('=== DEBUG: Failed to create order - order is null ===');
        throw new Error('Failed to create order');
      }

      console.log('=== DEBUG: Successfully created order ===', order);
      router.push({
        params: { orderId: order.id, total: totalPrice.toFixed(2) },
        pathname: '/order-confirmation',
      });
    } catch (error) {
      console.error('=== DEBUG: Error creating order ===', error);
      Alert.alert('Error', 'Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View className='flex-row items-center justify-between border-b border-gray-200 p-4'>
      <View className='flex-1'>
        <Text className='text-lg font-bold'>
          {item.product?.name || 'Unknown Product'}
        </Text>
        <Text className='text-gray-600'>
          ${item.product?.price?.toFixed(2) || 'N/A'}
        </Text>
      </View>
      <View className='flex-row items-center space-x-2'>
        <QuantitySelector
          maxQuantity={item.product?.stock_quantity || 0}
          onQuantityChange={(newQuantity) => {
            console.log('DEBUG: QuantitySelector - item.product.id:', item.product?.id, 'newQuantity:', newQuantity);
            item.product?.id &&
            updateCartItemQuantity(item.product.id, newQuantity);
          }
          }
          quantity={item.quantity}
        />
        <TouchableOpacity
          className='ml-2 rounded-md bg-gray-300 p-2'
          onPress={() => {
            console.log('DEBUG: Remove button - item.product.id:', item.product?.id);
            item.product?.id && removeCartItem(item.product.id);
          }
          }
        >
          <Text className='text-gray-800'>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <Stack.Screen options={{ headerShown: true, title: 'Your Cart' }} />
      <View className='flex-1 p-4'>
        {loading ? (
          <Text className='text-center text-lg'>Loading cart...</Text>
        ) : cartItems.length === 0 ? (
          <Text className='text-center text-lg'>Your cart is empty.</Text>
        ) : (
          <FlatList
            contentContainerClassName='pb-4'
            data={cartItems}
            keyExtractor={(item) => item.id}
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
