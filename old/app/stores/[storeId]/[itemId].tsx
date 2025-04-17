import { useState, useEffect } from 'react';
import { View, Image, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react-native';

import STORE_PRODUCTS from '@/mock/storeproducts.json';
import STORES from '@/mock/stores.json';
import CartButton from '@/components/CartButton';

export default function ProductDetailScreen() {
  const { storeId, productId } = useLocalSearchParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState([]);

  const storeProducts = STORE_PRODUCTS[storeId] || [];
  const product = storeProducts.find((p) => p.id === productId);
  const store = STORES.find((s) => s.id === storeId);

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-600">Product not found</Text>
      </View>
    );
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const addToCart = () => {
    const item = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
      storeId: storeId,
      storeName: store?.name || 'Store',
    };

    // Find if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (cartItem) =>
        cartItem.id === item.id && cartItem.storeId === item.storeId,
    );

    let updatedCartItems = [...cartItems];

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      updatedCartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      updatedCartItems.push(item);
    }

    setCartItems(updatedCartItems);

    // In a real app, you might want to save this to AsyncStorage or a backend
    // For now, just show a success message
    alert(`Added ${quantity} ${product.name} to cart`);
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Custom header with back button */}
      <View className="absolute top-14 left-5 z-10">
        <TouchableOpacity
          className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        {/* Product Image */}
        <Image
          source={{ uri: product.image }}
          className="w-full h-96"
          resizeMode="cover"
        />

        {/* Product Info */}
        <View className="bg-white rounded-t-3xl -mt-8 pt-6 px-5">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1 pr-4">
              <Text className="text-2xl font-bold text-gray-800 mb-1">
                {product.name}
              </Text>
              <Text className="text-sm text-gray-500 mb-2">
                {store?.name || 'Store'}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-blue-500">
              ${product.price.toFixed(2)}
            </Text>
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Description
            </Text>
            <Text className="text-base text-gray-600 leading-6">
              {product.description}
            </Text>
          </View>

          {/* Quantity Selector */}
          <View className="mb-8">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Quantity
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                onPress={decrementQuantity}
              >
                <Minus size={20} color="#333" />
              </TouchableOpacity>

              <Text className="text-xl font-bold text-gray-800 mx-6">
                {quantity}
              </Text>

              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
                onPress={incrementQuantity}
              >
                <Plus size={20} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add to Cart Button */}
          <View className="flex-row justify-center mb-10">
            <TouchableOpacity
              className="bg-blue-500 py-4 px-8 rounded-xl items-center"
              onPress={addToCart}
            >
              <View className="flex-row items-center">
                <ShoppingBag size={20} color="#fff" />
                <Text className="text-base font-bold text-white ml-2">
                  Add to Cart
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Cart Button */}
      <CartButton itemCount={cartItems.length} />
    </View>
  );
}
