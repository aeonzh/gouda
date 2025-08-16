import { ErrorBoundary } from '@components/ErrorBoundary';
import { addOrUpdateCartItem, getOrCreateCart } from '@shared/api/orders';
import { getProductById, Product } from '@shared/api/products';
import { supabase } from '@shared/api/supabase';
import { Button } from '@shared/components/Button';
import { QuantitySelector } from '@shared/components/QuantitySelector';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductDetailsScreen() {
  return (
    <ErrorBoundary>
      <ProductDetailsContent />
    </ErrorBoundary>
  );
}

function ProductDetailsContent() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!product) return;

    console.log('=== DEBUG: handleAddToCart started ===');
    console.log('Product details:', product);
    console.log('Current selectedQuantity:', selectedQuantity);
    console.log('Available stock:', product.stock_quantity);

    setAddingToCart(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      console.log(
        '=== DEBUG: ProductDetails - Adding to cart for user:',
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

      console.log('=== DEBUG: ProductDetails - Cart obtained:', cart);

      // Add the product to the cart
      console.log('=== DEBUG: ProductDetails - Adding item to cart:', {
        businessId: cart.business_id,
        cartId: cart.id,
        price: product.price,
        productId: product.id,
        quantity: selectedQuantity,
      });

      const result = await addOrUpdateCartItem(
        cart.id,
        product.id,
        selectedQuantity, // quantity
        product.price, // price at addition
      );

      console.log('API result from addOrUpdateCartItem:', result);

      console.log('Product successfully added to cart');
      setSelectedQuantity(1); // Reset quantity selector
      console.log('=== DEBUG: handleAddToCart completed successfully ===');
    } catch (error) {
      console.error('=== DEBUG: Error adding to cart ===', error);
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
      <SafeAreaView className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator
          color='#0000ff'
          size='large'
        />
        <Text className='mt-2 text-gray-600'>Loading product details...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className='flex-1 items-center justify-center bg-white p-4'>
        <Text className='text-xl font-bold text-gray-800'>
          Product not found.
        </Text>
        <Text className='mt-2 text-gray-600'>
          The requested product could not be found.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-100'>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              className='mr-2 rounded-md bg-blue-500 px-3 py-1'
              onPress={() =>
                router.push({
                  params: { businessId: product.business_id },
                  pathname: '/cart',
                })
              }
            >
              <Text className='text-sm text-white'>Cart</Text>
            </TouchableOpacity>
          ),
          headerShown: true,
          title: product.name,
        }}
      />
      <ScrollView
        className='flex-1'
        contentContainerClassName='pb-6'
        showsVerticalScrollIndicator={false}
      >
        {product.image_url && (
          <Image
            className='h-80 w-full object-cover shadow-lg'
            source={{ uri: product.image_url }}
          />
        )}
        <View className='-mt-6 rounded-t-3xl bg-white p-6 shadow-xl'>
          <Text className='mb-3 text-3xl font-bold text-gray-900'>
            {product.name}
          </Text>
          <Text className='mb-4 text-2xl font-bold text-green-600'>
            ${product.price.toFixed(2)}
          </Text>
          <Text className='mb-6 text-base leading-relaxed text-gray-700'>
            {product.description}
          </Text>

          {/* Stock Information */}
          <View className='mb-4 rounded-lg bg-gray-50 p-3'>
            <Text className='text-sm text-gray-600'>
              Stock: {product.stock_quantity} available
            </Text>
          </View>

          {/* Quantity Selector */}
          <View className='mb-6'>
            <Text className='mb-2 text-sm font-medium text-gray-700'>
              Quantity:
            </Text>
            <QuantitySelector
              maxQuantity={product.stock_quantity}
              onQuantityChange={setSelectedQuantity}
              quantity={selectedQuantity}
            />
          </View>

          {/* Add to Cart Button */}
          <Button
            className='w-full rounded-lg bg-blue-600 py-4 shadow-lg'
            disabled={addingToCart}
            isLoading={addingToCart}
            onPress={handleAddToCart}
            title='Add to Cart'
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
