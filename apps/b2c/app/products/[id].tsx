import { Stack, useLocalSearchParams } from 'expo-router';
import {
  addOrUpdateCartItem,
  getOrCreateCart,
} from 'packages/shared/api/orders';
import { getProductById, Product } from 'packages/shared/api/products';
import { supabase } from 'packages/shared/api/supabase';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<null | Product>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    if (!product) return;

    console.log('Product details:', product);
    setAddingToCart(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log('No user found for cart addition');
        Alert.alert('Error', 'Please log in to add items to cart.');
        return;
      }

      console.log(
        'Adding to cart for user:',
        user.id,
        'product business:',
        product.business_id,
      );

      // Get or create a cart for the user
      console.log('Getting or creating cart...');
      const cart = await getOrCreateCart(user.id, product.business_id);
      if (!cart) {
        console.log('Failed to get/create cart');
        throw new Error('Failed to create cart');
      }

      console.log('Cart obtained:', cart);

      // Add the product to the cart
      console.log('Adding item to cart:', {
        cartId: cart.id,
        price: product.price,
        productId: product.id,
        quantity: 1,
      });
      await addOrUpdateCartItem(
        cart.id,
        product.id,
        1, // quantity
        product.price, // price at addition
      );

      console.log('Product successfully added to cart');
      Alert.alert('Success', 'Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add product to cart.');
    } finally {
      setAddingToCart(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductDetails(id as string);
    }
  }, [id]);

  const fetchProductDetails = async (productId: string) => {
    setLoading(true);
    try {
      const fetchedProduct = await getProductById(productId);
      setProduct(fetchedProduct);
    } catch (error) {
      console.error('Failed to fetch product details:', error);
      // Optionally, set an error state to display to the user
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-100'>
        <ActivityIndicator
          color='#0000ff'
          size='large'
        />
      </View>
    );
  }

  if (!product) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-100 p-4'>
        <Text className='text-lg text-gray-700'>Product not found.</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-100'>
      <Stack.Screen options={{ headerShown: true, title: product.name }} />
      <ScrollView className='flex-1'>
        {product.image_url && (
          <Image
            className='h-80 w-full object-cover shadow-lg'
            source={{ uri: product.image_url }}
          />
        )}
        <View className='-mt-6 rounded-t-3xl bg-white p-6 shadow-xl'>
          <Text className='mb-2 text-4xl font-extrabold text-gray-900'>
            {product.name}
          </Text>
          <Text className='mb-4 text-3xl font-bold text-green-600'>
            ${product.price.toFixed(2)}
          </Text>
          <Text className='mb-8 text-base leading-relaxed text-gray-700'>
            {product.description}
          </Text>

          {/* Add to Cart Button */}
          <TouchableOpacity
            className='items-center justify-center rounded-xl bg-blue-700 py-4 shadow-lg transition-all duration-200 active:bg-blue-800 disabled:bg-gray-400'
            disabled={addingToCart}
            onPress={handleAddToCart}
          >
            {addingToCart ? (
              <ActivityIndicator
                color='white'
                size='small'
              />
            ) : (
              <Text className='text-xl font-bold text-white'>Add to Cart</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
