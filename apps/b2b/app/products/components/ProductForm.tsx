import { Picker } from '@react-native-picker/picker';
import { ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import type { Category, Product } from 'shared/api/products';

export interface ProductFormValues {
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  category_id?: string;
}

export function ProductForm({
  categories,
  values,
  validationErrors,
  isSubmitting,
  onChange,
  onSubmit,
}: {
  categories: Category[];
  values: Partial<ProductFormValues>;
  validationErrors: Partial<Record<keyof ProductFormValues, string>>;
  isSubmitting: boolean;
  onChange: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void;
  onSubmit: () => void;
}) {
  return (
    <ScrollView className="p-4">
      <View className="mb-4">
        <Text className="text-base font-medium text-gray-700 mb-1">Product Name</Text>
        <TextInput
          placeholder="Enter product name"
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
          value={values.name || ''}
          onChangeText={(t) => onChange('name', t.trimStart())}
          accessibilityLabel="Product name"
          testID="product-name-input"
        />
        {!!validationErrors.name && (
          <Text className="text-red-600 mt-1">{validationErrors.name}</Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-base font-medium text-gray-700 mb-1">Description</Text>
        <TextInput
          placeholder="Enter product description"
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 h-24"
          value={values.description || ''}
          onChangeText={(t) => onChange('description', t)}
          multiline
          textAlignVertical="top"
          accessibilityLabel="Product description"
          testID="product-description-input"
        />
      </View>

      <View className="mb-4">
        <Text className="text-base font-medium text-gray-700 mb-1">Price</Text>
        <TextInput
          placeholder="Enter price"
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
          keyboardType="numeric"
          value={values.price != null ? String(values.price) : ''}
          onChangeText={(t) => onChange('price', Number.isNaN(parseFloat(t)) ? 0 : parseFloat(Number(parseFloat(t).toFixed(2)).toString()))}
          accessibilityLabel="Product price"
          testID="product-price-input"
        />
        {!!validationErrors.price && (
          <Text className="text-red-600 mt-1">{validationErrors.price}</Text>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-base font-medium text-gray-700 mb-1">Category</Text>
        <View className="border border-gray-300 rounded-lg bg-white">
          <Picker
            selectedValue={values.category_id || ''}
            onValueChange={(val: string) => onChange('category_id', val || undefined)}
            testID="product-category-picker"
          >
            <Picker.Item label="Select a category" value="" />
            {categories.map((c) => (
              <Picker.Item key={c.id || c.name} label={c.name} value={c.id || ''} />
            ))}
          </Picker>
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-base font-medium text-gray-700 mb-1">Image URL</Text>
        <TextInput
          placeholder="https://..."
          className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
          value={values.image_url || ''}
          onChangeText={(t) => onChange('image_url', t.trim())}
          accessibilityLabel="Product image URL"
          testID="product-image-url-input"
        />
      </View>

      <TouchableOpacity
        accessibilityLabel="Submit"
        className={`w-full p-4 rounded-lg flex-row justify-center items-center ${isSubmitting ? 'bg-indigo-300' : 'bg-indigo-600'}`}
        disabled={isSubmitting}
        onPress={onSubmit}
        testID="product-submit-button"
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-lg font-semibold">Save</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}



