import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  createOrderFromCart,
  createOrderFromCartAtomic,
  getCartItems,
  getOrCreateCart,
  removeCartItem as removeCartItemApi,
  updateCartItemQuantity as updateCartItemQuantityApi,
} from 'packages/shared/api/orders';
import { Product } from 'packages/shared/api/products';
import { supabase } from 'packages/shared/api/supabase';
import { Button } from 'packages/shared/components';
import { QuantitySelector } from 'packages/shared/components/QuantitySelector';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resolveBusinessIdForUser } from 'packages/shared/api/organisations';

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
  const [placingOrder, setPlacingOrder] = useState(false);
  const { businessId: paramBusinessId } = useLocalSearchParams();
  const router = useRouter();

  console.log('=== DEBUG: CartScreen - paramBusinessId:', paramBusinessId);

  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    if (__DEV__) {
      console.log('=== DEBUG: Fetching cart items for user:', user.id);
    }

    const businessId = await resolveBusinessIdForUser(
      user.id,
      (paramBusinessId as string) || null,
    );
    if (!businessId) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    if (__DEV__) {
      console.log('=== DEBUG: Using businessId:', businessId);
    }

    try {
      // Get or create cart using the shared API function
      const cart = await getOrCreateCart(user.id, businessId);
      if (!cart) {
        setLoading(false);
        return;
      }

      if (__DEV__) console.log('=== DEBUG: Found cart:', cart);

      // Get cart items using the shared API function
      if (__DEV__) {
        console.log(
          '=== DEBUG: About to fetch cart items for cartId:',
          cart.id,
          'with businessId:',
          cart.business_id,
        );
      }
      const cartItemsData = await getCartItems(cart.id);
      if (!cartItemsData) {
        console.log('=== DEBUG: CartScreen - No cart items found ===');
        setCartItems([]);
        return;
      }

      if (__DEV__) console.log('Cart items data:', cartItemsData);
      const items: CartItem[] = cartItemsData.map((item) => {
        const processedProduct = Array.isArray(item.product)
          ? item.product.length > 0
            ? (item.product[0] as Product)
            : undefined
          : (item.product as Product | undefined);
        return {
          ...item,
          product: processedProduct,
        };
      });
      if (__DEV__) console.log('Cart items processed and set in state');
      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  }, [paramBusinessId]); // Added paramBusinessId to dependency array

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0,
      ),
    [cartItems],
  );

  const updateCartItemQuantity = async (
    productId: string,
    newQuantity: number,
  ) => {
    if (__DEV__) console.log('=== DEBUG: updateCartItemQuantity started ===');
    if (__DEV__) {
      console.log('Product ID:', productId);
      console.log('New quantity:', newQuantity);
      console.log('Current cart items:', cartItems);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const targetBusinessId = await resolveBusinessIdForUser(
      user.id,
      (paramBusinessId as string) || null,
    );
    if (!targetBusinessId) return;

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

      if (__DEV__) console.log('Found cart for update:', cart.id);

      // Get the cart items to find the cart item ID
      const cartItemsData = await getCartItems(cart.id);
      if (!cartItemsData) {
        console.log('No cart items found for update');
        return;
      }

      if (__DEV__) console.log('Cart items data from API:', cartItemsData);

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

      if (__DEV__) {
        console.log('Found cart item for update:', cartItem.id);
        console.log('Current quantity in cart item:', cartItem.quantity);
      }

      // Use the shared API to update quantity
      const updatedItem = await updateCartItemQuantityApi(
        cartItem.id,
        newQuantity,
      );
      if (__DEV__)
        console.log(
          'API response from updateCartItemQuantityApi:',
          updatedItem,
        );

      if (updatedItem) {
        if (__DEV__) console.log('Successfully updated quantity');
        fetchCartItems();
      }
      if (__DEV__)
        console.log(
          '=== DEBUG: updateCartItemQuantity completed successfully ===',
        );
    } catch (error) {
      if (__DEV__)
        console.error(
          '=== DEBUG: Error updating cart item quantity ===',
          error,
        );
    }
  };

  const removeCartItem = async (productId: string) => {
    if (__DEV__) console.log('Removing product from cart:', productId);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found for removal');
      return;
    }

    const targetBusinessId = await resolveBusinessIdForUser(
      user.id,
      (paramBusinessId as string) || null,
    );
    if (!targetBusinessId) return;

    try {
      // First get the user's cart
      const cart = await getOrCreateCart(user.id, targetBusinessId);
      if (!cart) {
        console.log('No cart found for removal');
        return;
      }

      if (__DEV__) console.log('Found cart for removal:', cart.id);

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
      if (__DEV__) console.log('Successfully removed item');
      fetchCartItems();
    } catch (error) {
      if (__DEV__) console.error('Error removing cart item:', error);
    }
  };

  const createOrder = async () => {
    if (__DEV__) {
      console.log('=== DEBUG: createOrder called ===');
      console.log('Current cart items:', cartItems);
      console.log('Total price:', totalPrice);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const businessId = await resolveBusinessIdForUser(
      user.id,
      (paramBusinessId as string) || null,
    );
    if (!businessId) return;

    if (cartItems.length === 0) return;

    setPlacingOrder(true);
    try {
      if (__DEV__) console.log('=== DEBUG: Creating order from cart ===');
      // Feature flag to use RPC-based atomic order creation
      const useRpc = true;
      const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      const order = useRpc
        ? await createOrderFromCartAtomic(user.id, businessId, idempotencyKey)
        : await createOrderFromCart(user.id, businessId);
      if (!order) {
        if (__DEV__)
          console.log('=== DEBUG: Failed to create order - order is null ===');
        throw new Error('Failed to create order');
      }

      if (__DEV__)
        console.log('=== DEBUG: Successfully created order ===', order);
      router.push({
        params: { orderId: order.id, total: totalPrice.toFixed(2) },
        pathname: '/order-confirmation',
      });
    } catch (error) {
      if (__DEV__) console.error('=== DEBUG: Error creating order ===', error);
    } finally {
      setPlacingOrder(false);
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
            console.log(
              'DEBUG: QuantitySelector - item.product.id:',
              item.product?.id,
              'newQuantity:',
              newQuantity,
            );
            item.product?.id &&
              updateCartItemQuantity(item.product.id, newQuantity);
          }}
          quantity={item.quantity}
        />
        <TouchableOpacity
          className='ml-2 rounded-md bg-gray-300 p-2'
          onPress={() => {
            console.log(
              'DEBUG: Remove button - item.product.id:',
              item.product?.id,
            );
            item.product?.id && removeCartItem(item.product.id);
          }}
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
              isLoading={placingOrder}
              disabled={placingOrder}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
