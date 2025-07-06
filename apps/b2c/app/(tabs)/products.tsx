import { Link } from 'expo-router';
import {
  Category,
  Product,
  getCategories,
  getProducts,
} from 'packages/shared/api/products';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [searchQuery, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        getProducts({
          search_query: searchQuery,
          category_id: selectedCategory || undefined,
        }),
        getCategories(),
      ]);

      if (fetchedProducts) {
        setProducts(fetchedProducts);
      }
      if (fetchedCategories) {
        setCategories([{ id: null, name: 'All' }, ...fetchedCategories]); // Add 'All' category
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Optionally, set an error state to display to the user
    } finally {
      setLoading(false);
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <Link href={`/products/${item.id}`} asChild>
      <TouchableOpacity className="p-4 border-b border-gray-200 flex-row items-center bg-white rounded-lg shadow-md mb-3 mx-4 active:bg-gray-50 transition-all duration-200">
        {item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            className="w-24 h-24 rounded-lg mr-4 object-cover"
          />
        )}
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-gray-900 mb-1">
            {item.name}
          </Text>
          <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
            {item.description}
          </Text>
          <Text className="text-lg font-bold text-green-600">
            ${item.price.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4 bg-white shadow-sm border-b border-gray-200">
        <TextInput
          className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          placeholder="Search products..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 -mx-4 px-4"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id || 'all'}
              onPress={() => setSelectedCategory(category.id)}
              className={`px-5 py-2 rounded-full mr-3 shadow-sm transition-all duration-200 ${
                selectedCategory === category.id ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedCategory === category.id
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" className="mt-10" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerClassName="py-4"
          ListEmptyComponent={
            <Text className="text-center text-gray-500 text-lg mt-10">
              No products found. Try adjusting your search or filters.
            </Text>
          }
        />
      )}
    </View>
  );
}
