import { Link } from 'expo-router';
import {
  Category,
  getCategories,
  getProducts,
  Product,
} from 'packages/shared/api/products';
import { getBusinessIdForUser } from 'packages/shared/api/profiles';
import { supabase } from 'packages/shared/api/supabase';
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
  const [selectedCategory, setSelectedCategory] = useState<null | string>(null);
  const [businessId, setBusinessId] = useState<null | string>(null);

  

  // Effect to fetch the business ID on component mount
  useEffect(() => {
    const fetchBusinessId = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const id = await getBusinessIdForUser(user.id);
          setBusinessId(id);
        }
      } catch (error) {
        console.error('Failed to fetch business ID:', error);
      }
    };
    fetchBusinessId();
  }, []);

  // Effect to fetch products and categories when businessId, searchQuery, or selectedCategory changes
  useEffect(() => {
    if (!businessId) {
      // Don't fetch data until we have a businessId
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedProducts, fetchedCategories] = await Promise.all([
          getProducts({
            business_id: businessId,
            category_id: selectedCategory || undefined,
            search_query: searchQuery,
          }),
          getCategories({ business_id: businessId }),
        ]);

        if (fetchedProducts) {
          setProducts(fetchedProducts);
        }
        if (fetchedCategories) {
          setCategories([{ id: null, name: 'All' }, ...fetchedCategories]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId, searchQuery, selectedCategory]);

  const renderProductItem = ({ item }: { item: Product }) => (
    <Link asChild href={`/products/${item.id}`}>
      <TouchableOpacity className='p-4 border-b border-gray-200 flex-row items-center bg-white rounded-lg shadow-md mb-3 mx-4 active:bg-gray-50 transition-all duration-200'>
        {item.image_url && (
          <Image
            className='w-24 h-24 rounded-lg mr-4 object-cover'
            source={{ uri: item.image_url }}
          />
        )}
        <View className='flex-1'>
          <Text className='text-xl font-extrabold text-gray-900 mb-1'>
            {item.name}
          </Text>
          <Text className='text-sm text-gray-600 mb-2' numberOfLines={2}>
            {item.description}
          </Text>
          <Text className='text-lg font-bold text-green-600'>
            ${item.price.toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View className='flex-1 bg-gray-100'>
      <View className='p-4 bg-white shadow-sm border-b border-gray-200'>
        <TextInput
          className='w-full p-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200'
          clearButtonMode='while-editing'
          onChangeText={setSearchQuery}
          placeholder='Search products...'
          placeholderTextColor='#6b7280'
          value={searchQuery}
        />
        <ScrollView
          className='mt-4 -mx-4 px-4'
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => (
            <TouchableOpacity
              className={`px-5 py-2 rounded-full mr-3 shadow-sm transition-all duration-200 ${
                selectedCategory === category.id ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              key={category.id || 'all'}
              onPress={() => setSelectedCategory(category.id)}
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
        <ActivityIndicator className='mt-10' color='#0000ff' size='large' />
      ) : (
        <FlatList
          contentContainerClassName='py-4'
          data={products}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text className='text-center text-gray-500 text-lg mt-10'>
              {businessId
                ? 'No products found. Try adjusting your search or filters.'
                : 'No business associated with your account. Please contact support.'}
            </Text>
          }
          renderItem={renderProductItem}
        />
      )}
    </View>
  );
}
