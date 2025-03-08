import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Phone,
  ShoppingBag,
  ShoppingCart,
} from 'lucide-react-native';
import STORES from '../../mock/stores.json';
import STORE_ITEMS from '../../mock/storeitems.json';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);

  // Find the store with the matching ID
  const store = STORES.find((s) => s.id === id);

  if (!store) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Store not found</Text>
      </View>
    );
  }

  const storeItems = STORE_ITEMS[id] || [];

  const addToCart = (item) => {
    setCartItems([...cartItems, item]);
  };

  const renderItem = ({ item }) => (
    <View className="w-1/2 p-2">
      <TouchableOpacity className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Image source={{ uri: item.image }} className="w-full h-32" />
        <View className="p-3">
          <Text className="text-sm font-medium text-gray-800 mb-1">
            {item.name}
          </Text>
          <Text className="text-lg font-bold text-blue-500">
            ${item.price.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center justify-center bg-blue-500 py-2"
          onPress={() => addToCart(item)}
        >
          <ShoppingBag size={16} color="#fff" />
          <Text className="text-white font-medium ml-1">Add</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 bg-gray-50">
        <View className="absolute top-14 left-5 z-10">
          <TouchableOpacity
            className="w-10 h-10 bg-white/90 rounded-full justify-center items-center shadow-sm"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <Image source={{ uri: store.image }} className="w-full h-64" />

        <View className="bg-white rounded-t-3xl -mt-6 px-5 pt-6 pb-8">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {store.name}
          </Text>

          <View className="flex-row items-center mb-5">
            <Star size={18} color="#FFD700" fill="#FFD700" />
            <Text className="text-base text-gray-600 ml-1 mr-4">
              {store.rating}
            </Text>
            <Text className="text-sm text-blue-500 bg-blue-50 px-3 py-1 rounded-full">
              {store.category}
            </Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-4 mb-6">
            <View className="flex-row items-center mb-3">
              <MapPin size={18} color="#666" />
              <Text className="text-base text-gray-600 ml-2">
                {store.location}
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Clock size={18} color="#666" />
              <Text className="text-base text-gray-600 ml-2">
                {store.hours}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Phone size={18} color="#666" />
              <Text className="text-base text-gray-600 ml-2">
                {store.phone}
              </Text>
            </View>
          </View>

          <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 mb-2">About</Text>
            <Text className="text-base text-gray-600 leading-6">
              {store.description}
            </Text>
          </View>

          <View>
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Available Items
            </Text>
            <FlatList
              data={storeItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 10 }}
            />
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-10 right-10 w-16 h-16 bg-blue-500 rounded-full justify-center items-center shadow-lg"
        onPress={() => router.push('/cart')}
      >
        <ShoppingCart size={24} color="#fff" />
        {cartItems.length > 0 && (
          <View className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full justify-center items-center">
            <Text className="text-white text-xs">{cartItems.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
