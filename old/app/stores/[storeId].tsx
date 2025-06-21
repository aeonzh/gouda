import { useState } from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import StoreDetails from '@/components/store/StoreDetails';
import CartButton from '@/components/CartButton';
import StoreCatalogItem from '@/components/store/StoreCatalogItem';

import STORES from '@/mock/stores.json';
import STORE_ITEMS from '@/mock/storeitems.json';
import { StoreItemType } from '@/types';

export default function StoreScreen() {
  const { storeId } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState([]);

  // Find the store with the matching ID
  const store = STORES.find((s) => s.id === storeId);

  if (!store) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Store not found</Text>
      </View>
    );
  }

  const storeItems = STORE_ITEMS[storeId] || [];

  const storeScreenHeader = (
    <View className="flex-1">
      <Image source={{ uri: store.image }} className="w-full h-64" />

      <View className="bg-white rounded-t-3xl -mt-6 px-5 pt-6 pb-8">
        <StoreDetails store={store} />

        <Text className="text-2xl font-bold text-gray-800">Catalogue</Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: 'transparent' },
          headerTransparent: true,
          headerShadowVisible: false,
        }}
      />
      <FlatList
        ListHeaderComponent={storeScreenHeader}
        data={storeItems}
        renderItem={StoreCatalogItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <CartButton itemCount={cartItems.length} />
    </>
  );
}
