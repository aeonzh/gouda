import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  type Category,
  createProduct,
  getCategories,
  getProductById,
  type Product,
  updateProduct,
} from 'shared/api/products';
import { getBusinessIdForUser } from 'shared/api/profiles';
import { useAuth } from 'shared/components/AuthProvider';

import { ProductForm } from './components/ProductForm';
import { type ProductFormState, useProductForm } from './hooks/useProductForm';

export default function ManageProductScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const isEditing = !!id;
  const { session } = useAuth();

  const userId = session?.user?.id;
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialProduct, setInitialProduct] = useState<Partial<Product> | null>(
    null,
  );

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        if (!userId) {
          Alert.alert('Error', 'You must be logged in.');
          router.back();
          return;
        }
        const bId = await getBusinessIdForUser(userId);
        if (!bId) {
          Alert.alert('Error', 'Business context missing.');
          router.back();
          return;
        }
        setBusinessId(bId);

        const [cats, product] = await Promise.all([
          getCategories({ business_id: bId }),
          isEditing && typeof id === 'string'
            ? getProductById(id)
            : Promise.resolve(null),
        ]);
        setCategories(cats || []);
        if (isEditing) {
          if (!product) {
            Alert.alert('Error', 'Product not found.');
            router.back();
            return;
          }
          setInitialProduct(product);
        } else {
          setInitialProduct({
            category_id: undefined,
            description: '',
            image_url: '',
            name: '',
            price: 0,
          });
        }
      } catch (error: any) {
        Alert.alert('Error', error?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEditing, router, userId]);

  const handleSubmit = async (values: ProductFormState) => {
    if (!businessId) {
      Alert.alert('Error', 'Business context missing.');
      return;
    }
    if (isEditing && typeof id === 'string') {
      await updateProduct(id, {
        category_id: values.category_id,
        description: values.description,
        image_url: values.image_url,
        name: values.name,
        price: values.price,
      });
      Alert.alert('Success', 'Product updated successfully');
    } else {
      await createProduct({
        business_id: businessId,
        category_id: values.category_id,
        description: values.description,
        id: '', // DB default
        image_url: values.image_url,
        name: values.name,
        price: values.price,
        status: 'draft',
        stock_quantity: 0, // DB default or policy
      } as Product);
      Alert.alert('Success', 'Product created successfully');
    }
    router.back();
  };

  const form = useProductForm({
    initialValues: useMemo(
      () =>
        (initialProduct ?? {
          category_id: undefined,
          description: '',
          image_url: '',
          name: '',
          price: 0,
        }) as Partial<Product>,
      [initialProduct],
    ),
    mode: isEditing ? 'edit' : 'create',
    onSubmit: handleSubmit,
  });

  if (loading || !initialProduct) {
    return <View className='flex-1 bg-gray-50' />;
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isEditing ? 'Edit Product' : 'Add Product',
        }}
      />
      <ProductForm
        categories={categories}
        isSubmitting={form.isSubmitting}
        onChange={form.onChange}
        onSubmit={form.onSubmit}
        validationErrors={form.validationErrors}
        values={form.values}
      />
    </SafeAreaView>
  );
}
