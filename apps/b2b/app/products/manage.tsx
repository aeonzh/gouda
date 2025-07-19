import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Category,
  createProduct,
  getCategories,
  getProductById,
  Product,
  updateProduct,
} from 'shared/api/products';

export default function ManageProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isEditing = !!id;

  const [product, setProduct] = useState<Partial<Product>>({
    category_id: undefined,
    description: '',
    image_url: '',
    name: '',
    price: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      try {
        setLoading(true);
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);

        if (isEditing && typeof id === 'string') {
          const productData = await getProductById(id);
          if (productData) {
            setProduct(productData);
          } else {
            Alert.alert('Error', 'Product not found.');
            router.back();
          }
        }
      } catch (error: any) {
        Alert.alert('Error', `Failed to load data: ${error.message}`);
        console.error('Error fetching product or categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndCategories();
  }, [id, isEditing, router]);

  const handleChange = (
    name: keyof Product,
    value: number | string | undefined,
  ) => {
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!product.name || !product.price) {
      Alert.alert('Validation Error', 'Product name and price are required.');
      return;
    }
    if (product.price <= 0) {
      Alert.alert('Validation Error', 'Price must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && typeof id === 'string') {
        await updateProduct(id, product);
        Alert.alert('Success', 'Product updated successfully!');
      } else {
        await createProduct(product as Product);
        Alert.alert('Success', 'Product created successfully!');
      }
      router.back(); // Go back to product list
    } catch (error: any) {
      Alert.alert('Error', `Failed to save product: ${error.message}`);
      console.error('Error saving product:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator color="#6366F1" size="large" />
        <Text className="mt-4 text-gray-700">Loading product data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerBlurEffect: 'light',
          headerLargeTitle: true,
          headerLeft: () => (
            <TouchableOpacity className="p-2" onPress={() => router.back()}>
              <Feather color="#6366F1" name="arrow-left" size={24} />
            </TouchableOpacity>
          ),
          headerShown: true,
          headerTransparent: false,
          title: isEditing ? 'Edit Product' : 'Add Product',
        }}
      />
      <ScrollView className="p-4">
        <View className="mb-4">
          <Text className="text-base font-medium text-gray-700 mb-1">
            Product Name:
          </Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Enter product name"
            value={product.name}
          />
        </View>

        <View className="mb-4">
          <Text className="text-base font-medium text-gray-700 mb-1">
            Description:
          </Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 h-24"
            multiline
            onChangeText={(text) => handleChange('description', text)}
            placeholder="Enter product description"
            textAlignVertical="top"
            value={product.description}
          />
        </View>

        <View className="mb-4">
          <Text className="text-base font-medium text-gray-700 mb-1">
            Price:
          </Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
            keyboardType="numeric"
            onChangeText={(text) =>
              handleChange('price', parseFloat(text) || 0)
            }
            placeholder="Enter price"
            value={product.price?.toString()}
          />
        </View>

        <View className="mb-4">
          <Text className="text-base font-medium text-gray-700 mb-1">
            Category:
          </Text>
          <View className="border border-gray-300 rounded-lg bg-white">
            <Picker
              className="w-full text-gray-800"
              onValueChange={(itemValue: null | string) =>
                handleChange(
                  'category_id',
                  itemValue === '' ? undefined : itemValue || undefined,
                )
              }
              selectedValue={product.category_id || ''}
            >
              <Picker.Item label="Select a category" value={undefined} />
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-base font-medium text-gray-700 mb-1">
            Image URL:
          </Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
            onChangeText={(text) => handleChange('image_url', text)}
            placeholder="Enter image URL"
            value={product.image_url}
          />
        </View>

        <TouchableOpacity
          className={`w-full p-4 rounded-lg flex-row justify-center items-center ${
            submitting ? 'bg-indigo-300' : 'bg-indigo-600'
          }`}
          disabled={submitting}
          onPress={handleSubmit}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-semibold">
              {isEditing ? 'Update Product' : 'Add Product'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
