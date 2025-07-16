import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Category,
  Product,
  deleteProduct,
  getCategories,
  getProducts,
} from 'shared/api/products';

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchProductsAndCategories = useCallback(async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts({ limit: 100 }), // Fetch all products for admin view for now
        getCategories(),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (error: any) {
      Alert.alert('Error', `Failed to fetch data: ${error.message}`);
      console.error('Error fetching products or categories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProductsAndCategories();
  }, [fetchProductsAndCategories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProductsAndCategories();
  }, [fetchProductsAndCategories]);

  const handleDeleteProduct = async (id: string) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteProduct(id);
              Alert.alert('Success', 'Product deleted successfully.');
              fetchProductsAndCategories(); // Refresh the list
            } catch (error: any) {
              Alert.alert(
                'Error',
                `Failed to delete product: ${error.message}`,
              );
              console.error('Error deleting product:', error);
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return 'Uncategorized';
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-200 bg-white">
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">{item.name}</Text>
        <Text className="text-sm text-gray-600">
          ${item.price.toFixed(2)} | {getCategoryName(item.category_id)}
        </Text>
        <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
          {item.description}
        </Text>
      </View>
      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={() => router.push(`/products/manage?id=${item.id}`)}
          className="p-2 rounded-full bg-blue-100"
        >
          <Feather name="edit" size={20} color="#3B82F6" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteProduct(item.id)}
          className="p-2 rounded-full bg-red-100"
        >
          <Feather name="trash-2" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-700">Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      
      {products.length === 0 && !loading ? (
        <View className="flex-1 justify-center items-center p-4">
          <Feather name="box" size={60} color="#9CA3AF" />
          <Text className="text-xl text-gray-600 mt-4 font-semibold">
            No Products Found
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            It looks like there are no products yet. Tap the '+' button to add
            one!
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderProductItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          className="flex-1"
        />
      )}
    </SafeAreaView>
  );
}
