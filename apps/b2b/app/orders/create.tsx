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
import { Product, getProducts } from 'shared/api/products';
import { supabase } from 'shared/api/supabase';

// Assuming profiles table is accessible via supabase client

interface Customer {
  id: string;
  full_name: string;
  email: string;
}

interface OrderItemInput {
  productId: string;
  quantity: string; // Use string for TextInput, convert to number later
  priceAtOrder: string; // Use string for TextInput, convert to number later
}

export default function CreateOrderScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<
    string | undefined
  >(undefined);
  const [orderItems, setOrderItems] = useState<OrderItemInput[]>([
    { productId: '', quantity: '', priceAtOrder: '' },
  ]);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [billingAddress, setBillingAddress] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
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
          id: p.id,
          full_name: p.full_name,
          email: p.username,
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
      { productId: '', quantity: '', priceAtOrder: '' },
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
    addressType: 'shipping' | 'billing',
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
        productId: item.productId,
        quantity,
        priceAtOrder,
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
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="mt-4 text-gray-700">Loading data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Create Order',
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
        {/* Customer Selection */}
        <View className="mb-4 bg-white p-4 rounded-lg shadow-md">
          <Text className="text-base font-medium text-gray-700 mb-1">
            Select Customer:
          </Text>
          <View className="border border-gray-300 rounded-lg bg-white">
            <Picker
              selectedValue={selectedCustomerId}
              onValueChange={(itemValue: string | undefined) =>
                setSelectedCustomerId(itemValue)
              }
              className="w-full text-gray-800"
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
              key={index}
              className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="font-semibold text-gray-700">
                  Item {index + 1}
                </Text>
                {orderItems.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(index)}
                    className="p-1 rounded-full bg-red-100"
                  >
                    <Feather name="x" size={18} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>
              <View className="mb-2">
                <Text className="text-sm font-medium text-gray-600 mb-1">
                  Product:
                </Text>
                <View className="border border-gray-300 rounded-lg bg-white">
                  <Picker
                    selectedValue={item.productId}
                    onValueChange={(itemValue: string) =>
                      handleOrderItemChange(index, 'productId', itemValue)
                    }
                    className="w-full text-gray-800"
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
                    placeholder="Quantity"
                    keyboardType="numeric"
                    value={item.quantity}
                    onChangeText={(text) =>
                      handleOrderItemChange(index, 'quantity', text)
                    }
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-sm font-medium text-gray-600 mb-1">
                    Price at Order:
                  </Text>
                  <TextInput
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-800"
                    placeholder="Price"
                    keyboardType="numeric"
                    value={item.priceAtOrder}
                    onChangeText={(text) =>
                      handleOrderItemChange(index, 'priceAtOrder', text)
                    }
                  />
                </View>
              </View>
            </View>
          ))}
          <TouchableOpacity
            onPress={handleAddItem}
            className="w-full p-3 rounded-lg bg-blue-500 flex-row justify-center items-center mt-2"
          >
            <Feather name="plus" size={20} color="white" />
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
            placeholder="Street"
            value={shippingAddress.street}
            onChangeText={(text) =>
              handleAddressChange('shipping', 'street', text)
            }
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            placeholder="City"
            value={shippingAddress.city}
            onChangeText={(text) =>
              handleAddressChange('shipping', 'city', text)
            }
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            placeholder="State"
            value={shippingAddress.state}
            onChangeText={(text) =>
              handleAddressChange('shipping', 'state', text)
            }
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            placeholder="Zip Code"
            value={shippingAddress.zipCode}
            onChangeText={(text) =>
              handleAddressChange('shipping', 'zipCode', text)
            }
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
            placeholder="Country"
            value={shippingAddress.country}
            onChangeText={(text) =>
              handleAddressChange('shipping', 'country', text)
            }
          />
        </View>

        {/* Billing Address */}
        <View className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <Text className="text-xl font-bold text-gray-800 mb-2">
            Billing Address
          </Text>
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            placeholder="Street"
            value={billingAddress.street}
            onChangeText={(text) =>
              handleAddressChange('billing', 'street', text)
            }
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            placeholder="City"
            value={billingAddress.city}
            onChangeText={(text) =>
              handleAddressChange('billing', 'city', text)
            }
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            placeholder="State"
            value={billingAddress.state}
            onChangeText={(text) =>
              handleAddressChange('billing', 'state', text)
            }
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800 mb-2"
            placeholder="Zip Code"
            value={billingAddress.zipCode}
            onChangeText={(text) =>
              handleAddressChange('billing', 'zipCode', text)
            }
          />
          <TextInput
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-800"
            placeholder="Country"
            value={billingAddress.country}
            onChangeText={(text) =>
              handleAddressChange('billing', 'country', text)
            }
          />
        </View>

        {/* Submit Button */}
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
              Create Order
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
