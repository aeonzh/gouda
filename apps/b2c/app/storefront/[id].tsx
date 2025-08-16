import { ErrorBoundary } from '@components/ErrorBoundary';
import { Product } from '@shared/api/products';
import { useAuth } from '@shared/components/AuthProvider';
import { Input } from '@shared/components/Input';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ErrorComponent } from '../../components/ErrorComponent';
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
    categories,
    error,
    loading,
    products,
    searchQuery,
    selectedCategoryId,
    storeName,
  } = state;
  const { setSearchQuery, setSelectedCategoryId } = actions;

  // Extract storeId from the hook's internal state
  const storeId =
    state.products.length > 0 ? state.products[0]?.business_id : null;

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
      <ErrorBoundary>
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator
            color='#0000ff'
            size='large'
          />
        </View>
      </ErrorBoundary>
    );
  }

  if (error) {
    return (
      <ErrorBoundary>
        <ErrorComponent
          error={error}
          onRetry={() => {
            // Navigate back to the same page to trigger a reload
            router.replace({
              params: { id: rawStoreId as string },
              pathname: '/storefront/[id]',
            });
          }}
          title='Failed to load store'
        />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
            onPress={() => {
              if (storeId) {
                router.push({
                  params: { businessId: storeId },
                  pathname: '/cart',
                });
              } else {
                // Fallback to rawStoreId if storeId is not available
                router.push({
                  params: { businessId: rawStoreId },
                  pathname: '/cart',
                });
              }
            }}
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
    </ErrorBoundary>
  );
}
