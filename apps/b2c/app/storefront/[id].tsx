import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { getAuthorizedBusinesses } from 'packages/shared/api/organisations';
import {
  Category,
  getCategories,
  getProducts,
  Product,
} from 'packages/shared/api/products';
import { Input } from 'packages/shared/components';
import { useAuth } from 'packages/shared/components/AuthProvider';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function StorefrontPage() {
  const { id: storeId } = useLocalSearchParams();
  console.log('Current storeId from params:', storeId);
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<null | string>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [storeName, setStoreName] = useState<string>('Store');
  const { session } = useAuth();

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch store name (assuming storeId is business_id)
        const organizations = await getAuthorizedBusinesses(
          session?.user?.id || '',
        );
        const currentOrg = organizations?.find((org) => org.id === storeId);
        if (currentOrg) {
          setStoreName(currentOrg.name);
        }

        const fetchedProducts = await getProducts({
          business_id: storeId as string,
          category_id: selectedCategory || undefined,
          search_query: searchQuery || undefined,
          status: 'published',
        });
        setProducts(fetchedProducts || []);

        const fetchedCategories = await getCategories({
          business_id: storeId as string,
        });
        setCategories([
          { id: null, name: 'All' },
          ...(fetchedCategories || []),
        ]);
        console.log('Fetched Categories:', fetchedCategories);
        console.log('Fetched Products:', fetchedProducts);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load products or categories.');
      } finally {
        setLoading(false);
      }
    };

    if (storeId && session?.user?.id) {
      fetchStoreData();
    }
  }, [storeId, selectedCategory, searchQuery, session?.user?.id]);

  const handleProductPress = (productId: string) => {
    router.push(`/products/${productId}`);
  };

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
      <Input
        className='mb-4'
        onChangeText={setSearchQuery}
        placeholder='Search products...'
        value={searchQuery}
      />
      <View className='mb-4 flex-row'>
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(item) => item.id || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`mr-2 rounded-full px-3 py-1 ${selectedCategory === item.id ? 'bg-blue-500' : 'bg-gray-200'}`}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Text
                className={`${selectedCategory === item.id ? 'text-white' : 'text-gray-800'}`}
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
          renderItem={({ item }) => (
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
          )}
        />
      )}
    </View>
  );
}
