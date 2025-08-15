import type { Category } from '@api/products';

import { Picker } from '@react-native-picker/picker';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export interface ProductFormValues {
  category_id?: string;
  name: string;
  description?: string;
  image_url?: string;
  price: number;
}

export function ProductForm({
  categories,
  isSubmitting,
  onChange,
  onSubmit,
  validationErrors,
  values,
}: {
  categories: Category[];
  isSubmitting: boolean;
  onChange: <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => void;
  onSubmit: () => void;
  validationErrors: Partial<Record<keyof ProductFormValues, string>>;
  values: Partial<ProductFormValues>;
}) {
  return (
    <ScrollView className='p-4'>
      <View className='mb-4'>
        <Text className='mb-1 text-base font-medium text-gray-700'>
          Product Name
        </Text>
        <TextInput
          accessibilityLabel='Product name'
          className='w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-800'
          onChangeText={(t) => onChange('name', t.trimStart())}
          placeholder='Enter product name'
          testID='product-name-input'
          value={values.name || ''}
        />
        {!!validationErrors.name && (
          <Text className='mt-1 text-red-600'>{validationErrors.name}</Text>
        )}
      </View>

      <View className='mb-4'>
        <Text className='mb-1 text-base font-medium text-gray-700'>
          Description
        </Text>
        <TextInput
          accessibilityLabel='Product description'
          className='h-24 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-800'
          multiline
          onChangeText={(t) => onChange('description', t)}
          placeholder='Enter product description'
          testID='product-description-input'
          textAlignVertical='top'
          value={values.description || ''}
        />
      </View>

      <View className='mb-4'>
        <Text className='mb-1 text-base font-medium text-gray-700'>Price</Text>
        <TextInput
          accessibilityLabel='Product price'
          className='w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-800'
          keyboardType='numeric'
          onChangeText={(t) =>
            onChange(
              'price',
              Number.isNaN(parseFloat(t))
                ? 0
                : parseFloat(Number(parseFloat(t).toFixed(2)).toString()),
            )
          }
          placeholder='Enter price'
          testID='product-price-input'
          value={values.price != null ? String(values.price) : ''}
        />
        {!!validationErrors.price && (
          <Text className='mt-1 text-red-600'>{validationErrors.price}</Text>
        )}
      </View>

      <View className='mb-4'>
        <Text className='mb-1 text-base font-medium text-gray-700'>
          Category
        </Text>
        <View className='rounded-lg border border-gray-300 bg-white'>
          <Picker
            onValueChange={(val: string) =>
              onChange('category_id', val || undefined)
            }
            selectedValue={values.category_id || ''}
            testID='product-category-picker'
          >
            <Picker.Item
              label='Select a category'
              value=''
            />
            {categories.map((c) => (
              <Picker.Item
                key={c.id || c.name}
                label={c.name}
                value={c.id || ''}
              />
            ))}
          </Picker>
        </View>
      </View>

      <View className='mb-6'>
        <Text className='mb-1 text-base font-medium text-gray-700'>
          Image URL
        </Text>
        <TextInput
          accessibilityLabel='Product image URL'
          className='w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-800'
          onChangeText={(t) => onChange('image_url', t.trim())}
          placeholder='https://...'
          testID='product-image-url-input'
          value={values.image_url || ''}
        />
      </View>

      <TouchableOpacity
        accessibilityLabel='Submit'
        className={`w-full flex-row items-center justify-center rounded-lg p-4 ${isSubmitting ? 'bg-indigo-300' : 'bg-indigo-600'}`}
        disabled={isSubmitting}
        onPress={onSubmit}
        testID='product-submit-button'
      >
        {isSubmitting ? (
          <ActivityIndicator color='#fff' />
        ) : (
          <Text className='text-lg font-semibold text-white'>Save</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
