import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Text, View, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { getProducts, getCategories, Product, Category } from 'packages/shared/api/products';
import { Input } from 'packages/shared/components';
import { Organisation, getAuthorizedBusinesses } from 'packages/shared/api/organisations';

export default function StorefrontPage() {
  const { id: storeId } = useLocalSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('Store');

  useEffect(() => {
    if (storeId) {
      fetchStoreData();
    }
  }, [storeId, selectedCategory, searchQuery]);

  const fetchStoreData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch store name (assuming storeId is business_id)
      const organizations = await getAuthorizedBusinesses('some_user_id'); // TODO: Replace with actual user ID
      const currentOrg = organizations?.find(org => org.id === storeId);
      if (currentOrg) {
        setStoreName(currentOrg.name);
      }

      const fetchedProducts = await getProducts({
        business_id: storeId as string,
        category_id: selectedCategory || undefined,
        search_query: searchQuery || undefined,
      });
      setProducts(fetchedProducts || []);

      const fetchedCategories = await getCategories({
        business_id: storeId as string,
      });
      setCategories([{ id: null, name: 'All' }, ...(fetchedCategories || [])]);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load products or categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Stack.Screen options={{ title: storeName }} />
      <Input
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="mb-4"
      />
      <View className="flex-row mb-4">
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item.id || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.id)}
              className={`px-3 py-1 rounded-full mr-2 ${selectedCategory === item.id ? 'bg-blue-500' : 'bg-gray-200'}`}
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
        <Text className="text-center text-gray-500">No products found for this store.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="p-4 border-b border-gray-200 flex-row items-center"
              onPress={() => handleProductPress(item.id)}
            >
              {item.image_url && (
                <Image source={{ uri: item.image_url }} className="w-16 h-16 mr-4 rounded" />
              )}
              <View className="flex-1">
                <Text className="text-lg font-bold">{item.name}</Text>
                <Text className="text-gray-600">${item.price.toFixed(2)}</Text>
                <Text className="text-gray-500">{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
