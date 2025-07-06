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
  Product,
  createProduct,
  getCategories,
  getProductById,
  updateProduct,
} from 'shared/api/products';

export default function ManageProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isEditing = !!id;

  const [product, setProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category_id: undefined,
    image_url: '',
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
    value: string | number | undefined,
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
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-700">Loading product data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEditing ? 'Edit Product' : 'Add Product',
          headerLargeTitle: true,
          headerTransparent: false,
          headerBlurEffect: 'light',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <Feather name="arrow-left" size={24} color="#6366F1" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView className="p-4">
        <View className="mb-4">
          <Text className="text-base font-medium text-gray-700 mb-1">
            Product Name:
          </Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
            placeholder="Enter product name"
            value={product.name}
            onChangeText={(text) => handleChange('name', text)}
          />
        </View>

        <View className="mb-4">
          <Text className="text-base font-medium text-gray-700 mb-1">
            Description:
          </Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 h-24"
            placeholder="Enter product description"
            multiline
            textAlignVertical="top"
            value={product.description}
            onChangeText={(text) => handleChange('description', text)}
          />
        </View>

        <View className="mb-4">
          <Text className="text-base font-medium text-gray-700 mb-1">
            Price:
          </Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
            placeholder="Enter price"
            keyboardType="numeric"
            value={product.price?.toString()}
            onChangeText={(text) =>
              handleChange('price', parseFloat(text) || 0)
            }
          />
        </View>

        <View className="mb-4">
          <Text className="text-base font-medium text-gray-700 mb-1">
            Category:
          </Text>
          <View className="border border-gray-300 rounded-lg bg-white">
            <Picker
              selectedValue={product.category_id || ''}
              onValueChange={(itemValue: string | null) =>
                handleChange(
                  'category_id',
                  itemValue === '' ? undefined : itemValue || undefined,
                )
              }
              className="w-full text-gray-800"
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
            placeholder="Enter image URL"
            value={product.image_url}
            onChangeText={(text) => handleChange('image_url', text)}
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className={`w-full p-4 rounded-lg flex-row justify-center items-center ${
            submitting ? 'bg-indigo-300' : 'bg-indigo-600'
          }`}
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
