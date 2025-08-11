import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from 'packages/shared/components';
import { useAuth } from 'packages/shared/components/AuthProvider';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useStorefront } from './useStorefront';

export default function StorefrontPage() {
  const { id: rawStoreId } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const [state, actions] = useStorefront({
    rawStoreId,
    userId: session?.user?.id ?? null,
  });
  const {
    loading,
    error,
    products,
    categories,
    selectedCategoryId,
    storeName,
    searchQuery,
  } = state;
  const { setSearchQuery, setSelectedCategoryId } = actions;

  const handleProductPress = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const renderProductItem = useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity
        className='flex-row items-center border-b border-gray-200 p-4'
        onPress={() => handleProductPress(item.id)}
      >
        {item.image_url && (
          <Image
            className='mr-4 h-16 w-16 rounded'
            source={{ uri: item.image_url }}
          />
        )}
        <View className='flex-1'>
          <Text className='text-lg font-bold'>{item.name}</Text>
          <Text className='text-gray-600'>${item.price.toFixed(2)}</Text>
          <Text className='text-gray-500'>{item.description}</Text>
        </View>
      </TouchableOpacity>
    ),
    [],
  );

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator
          color='#0000ff'
          size='large'
        />
      </View>
    );
  }

  if (error) {
    return (
      <View className='flex-1 items-center justify-center'>
        <Text className='text-red-500'>{error}</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 p-4'>
      <Stack.Screen options={{ title: storeName }} />
      <View className='mb-4 flex-row items-center justify-between'>
        <Input
          className='mr-2 flex-1'
          onChangeText={setSearchQuery}
          placeholder='Search products...'
          value={searchQuery}
        />
        <TouchableOpacity
          className='rounded-md bg-blue-500 px-4 py-2'
          onPress={() =>
            router.push({ pathname: '/cart', params: { businessId: storeId } })
          }
        >
          <Text className='text-white'>Cart</Text>
        </TouchableOpacity>
      </View>
      <View className='mb-4 flex-row'>
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(item) => item.id || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`mr-2 rounded-full px-3 py-1 ${selectedCategoryId === item.id ? 'bg-blue-500' : 'bg-gray-200'}`}
              onPress={() => setSelectedCategoryId(item.id)}
            >
              <Text
                className={`${selectedCategoryId === item.id ? 'text-white' : 'text-gray-800'}`}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      {products.length === 0 ? (
        <Text className='text-center text-gray-500'>
          No products found for this store.
        </Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
        />
      )}
    </View>
  );
}
