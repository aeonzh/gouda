import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { createOrderForCustomer } from 'shared/api/orders';
import { getProducts, Product } from 'shared/api/products';
import { supabase } from 'shared/api/supabase';

// Assuming profiles table is accessible via supabase client

interface Customer {
  id: string;
  full_name: string;
  email: string;
}

interface OrderItemInput {
  priceAtOrder: string; // Use string for TextInput, convert to number later
  productId: string;
  quantity: string; // Use string for TextInput, convert to number later
}

export default function CreateOrderScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([
    { priceAtOrder: '', productId: '', quantity: '' },
  ]);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    city: '',
    country: '',
    state: '',
    street: '',
    zipCode: '',
  });
  const [billingAddress, setBillingAddress] = useState<Address>({
    city: '',
    country: '',
    state: '',
    street: '',
    zipCode: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomersAndProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch customers (users with 'customer' role from profiles table)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username') // Assuming username is email
        .eq('role', 'customer');

      if (profilesError) throw profilesError;
      setCustomers(
        profilesData.map((p) => ({
          email: p.username,
          full_name: p.full_name,
          id: p.id,
        })),
      );

      // Fetch all products
      const productsData = await getProducts({ limit: 1000 }); // Fetch a large number for selection
      setProducts(productsData || []);
    } catch (error: any) {
      Alert.alert('Error', `Failed to load data: ${error.message}`);
      console.error('Error fetching customers or products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomersAndProducts();
  }, [fetchCustomersAndProducts]);

  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      { priceAtOrder: '', productId: '', quantity: '' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
  };

  const handleOrderItemChange = (
    index: number,
    field: keyof OrderItemInput,
    value: string,
  ) => {
    const newItems = [...orderItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderItems(newItems);
  };

  const handleAddressChange = (
    addressType: 'billing' | 'shipping',
    field: keyof Address,
    value: string,
  ) => {
    if (addressType === 'shipping') {
      setShippingAddress((prev: Address) => ({ ...prev, [field]: value }));
    } else {
      setBillingAddress((prev: Address) => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Validation Error', 'Please select a customer.');
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert(
        'Validation Error',
        'Please add at least one product to the order.',
      );
      return;
    }

    const parsedItems = orderItems.map((item) => {
      const quantity = parseInt(item.quantity, 10);
      const priceAtOrder = parseFloat(item.priceAtOrder);
      if (
        isNaN(quantity) ||
        quantity <= 0 ||
        isNaN(priceAtOrder) ||
        priceAtOrder <= 0
      ) {
        throw new Error('Invalid quantity or price for an order item.');
      }
      return {
        priceAtOrder,
        productId: item.productId,
        quantity,
      };
    });

    // Basic address validation
    const isShippingAddressValid = Object.values(shippingAddress).every(
      (val: string) => val.trim() !== '',
    );
    const isBillingAddressValid = Object.values(billingAddress).every(
      (val: string) => val.trim() !== '',
    );

    if (!isShippingAddressValid || !isBillingAddressValid) {
      Alert.alert(
        'Validation Error',
        'Please fill in all shipping and billing address fields.',
      );
      return;
    }

    setSubmitting(true);
    try {
      // TODO: Get salesAgentId from current authenticated admin user
      const salesAgentId = 'YOUR_ADMIN_USER_ID'; // Placeholder for now

      await createOrderForCustomer(
        selectedCustomerId,
        salesAgentId,
        parsedItems,
      );
      Alert.alert('Success', 'Order created successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', `Failed to create order: ${error.message}`);
      console.error('Error creating order:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator color="#6366F1" size="large" />
        <Text className="mt-4 text-gray-700">Loading data...</Text>
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
          title: 'Create Order',
        }}
      />
      <ScrollView className="p-4">
        {/* Customer Selection */}
        <View className="mb-4 bg-white p-4 rounded-lg shadow-md">
          <Text className="text-base font-medium text-gray-700 mb-1">
            Select Customer:
          </Text>
          <View className="border border-gray-300 rounded-lg bg-white">
            <Picker
              className="w-full text-gray-800"
              onValueChange={(itemValue: string | undefined) =>
                setSelectedCustomerId(itemValue)
              }
              selectedValue={selectedCustomerId}
            >
              <Picker.Item label="-- Select a Customer --" value={undefined} />
              {customers.map((customer) => (
                <Picker.Item
                  key={customer.id}
                  label={`${customer.full_name} (${customer.email})`}
                  value={customer.id}
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Order Items */}
        <View className="mb-4 bg-white p-4 rounded-lg shadow-md">
          <Text className="text-base font-medium text-gray-700 mb-2">
            Order Items:
          </Text>
          {orderItems.map((item, index) => (
            <View
              className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50"
              key={index}
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-gray-700">
                  Item {index + 1}
                </Text>
                {orderItems.length > 1 && (
                  <TouchableOpacity
                    className="p-1 rounded-full bg-red-100"
                    onPress={() => handleRemoveItem(index)}
                  >
                    <Feather color="#EF4444" name="x" size={18} />
                  </TouchableOpacity>
                )}
              </View>
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-600 mb-1">
                  Product:
                </Text>
                <View className="border border-gray-300 rounded-lg bg-white">
                  <Picker
                    className="w-full text-gray-800"
                    onValueChange={(itemValue: string) =>
                      handleOrderItemChange(index, 'productId', itemValue)
                    }
                    selectedValue={item.productId}
                  >
                    <Picker.Item label="-- Select a Product --" value="" />
                    {products.map((product) => (
                      <Picker.Item
                        key={product.id}
                        label={`${product.name} ($${product.price.toFixed(2)})`}
                        value={product.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
              <View className="flex-row justify-between mb-2">
                <View className="flex-1 mr-2">
                  <Text className="text-sm font-medium text-gray-600 mb-1">
                    Quantity:
                  </Text>
                  <TextInput
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800"
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      handleOrderItemChange(index, 'quantity', text)
                    }
                    placeholder="Quantity"
                    value={item.quantity}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-sm font-medium text-gray-600 mb-1">
                    Price at Order:
                  </Text>
                  <TextInput
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800"
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      handleOrderItemChange(index, 'priceAtOrder', text)
                    }
                    placeholder="Price"
                    value={item.priceAtOrder}
                  />
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity
            className="w-full p-3 rounded-lg bg-blue-500 flex-row justify-center items-center mt-2"
            onPress={handleAddItem}
          >
            <Feather color="white" name="plus" size={20} />
            <Text className="text-white text-base font-semibold ml-2">
              Add Item
            </Text>
          </TouchableOpacity>
        </View>

        {/* Shipping Address */}
        <View className="mb-4 bg-white p-4 rounded-lg shadow-md">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Shipping Address
          </Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            onChangeText={(text) =>
              handleAddressChange('shipping', 'street', text)
            }
            placeholder="Street"
            value={shippingAddress.street}
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            onChangeText={(text) =>
              handleAddressChange('shipping', 'city', text)
            }
            placeholder="City"
            value={shippingAddress.city}
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            onChangeText={(text) =>
              handleAddressChange('shipping', 'state', text)
            }
            placeholder="State"
            value={shippingAddress.state}
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            onChangeText={(text) =>
              handleAddressChange('shipping', 'zipCode', text)
            }
            placeholder="Zip Code"
            value={shippingAddress.zipCode}
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
            onChangeText={(text) =>
              handleAddressChange('shipping', 'country', text)
            }
            placeholder="Country"
            value={shippingAddress.country}
          />
        </View>

        {/* Billing Address */}
        <View className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Billing Address
          </Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            onChangeText={(text) =>
              handleAddressChange('billing', 'street', text)
            }
            placeholder="Street"
            value={billingAddress.street}
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            onChangeText={(text) =>
              handleAddressChange('billing', 'city', text)
            }
            placeholder="City"
            value={billingAddress.city}
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            onChangeText={(text) =>
              handleAddressChange('billing', 'state', text)
            }
            placeholder="State"
            value={billingAddress.state}
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            onChangeText={(text) =>
              handleAddressChange('billing', 'zipCode', text)
            }
            placeholder="Zip Code"
            value={billingAddress.zipCode}
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
            onChangeText={(text) =>
              handleAddressChange('billing', 'country', text)
            }
            placeholder="Country"
            value={billingAddress.country}
          />
        </View>

        {/* Submit Button */}
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
              Create Order
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
