import { Stack, useLocalSearchParams } from 'expo-router';
import { Product, getProductById } from 'packages/shared/api/products';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

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
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 p-4">
        <Text className="text-lg text-gray-700">Product not found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: product.name, headerShown: true }} />
      <ScrollView className="flex-1">
        {product.image_url && (
          <Image
            source={{ uri: product.image_url }}
            className="w-full h-80 object-cover shadow-lg"
          />
        )}
        <View className="p-6 bg-white rounded-t-3xl -mt-6 shadow-xl">
          <Text className="text-4xl font-extrabold text-gray-900 mb-2">
            {product.name}
          </Text>
          <Text className="text-3xl font-bold text-green-600 mb-4">
            ${product.price.toFixed(2)}
          </Text>
          <Text className="text-base text-gray-700 leading-relaxed mb-8">
            {product.description}
          </Text>

          {/* Add to Cart Button - Placeholder for future implementation */}
          <TouchableOpacity className="bg-blue-700 py-4 rounded-xl items-center justify-center shadow-lg active:bg-blue-800 transition-all duration-200">
            <Text className="text-white text-xl font-bold">Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
