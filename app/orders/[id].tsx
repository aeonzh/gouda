import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Package,
  Clock,
  MapPin,
  CreditCard,
  Check,
  Truck,
} from 'lucide-react-native';

// Mock order data
const ORDER = {
  id: '12345',
  date: '2025-05-15',
  status: 'In Transit',
  items: [
    {
      id: '101',
      name: 'Designer T-Shirt',
      price: 49.99,
      quantity: 1,
      image:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHNoaXJ0fGVufDB8fDB8fHww',
      storeName: 'Fashion Boutique',
    },
    {
      id: '202',
      name: 'Smart Watch',
      price: 249.99,
      quantity: 1,
      image:
        'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c21hcnQlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D',
      storeName: 'Tech Haven',
    },
    {
      id: '302',
      name: 'Artisan Cheese',
      price: 12.99,
      quantity: 2,
      image:
        'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hlZXNlfGVufDB8fDB8fHww',
      storeName: 'Gourmet Delights',
    },
  ],
  subtotal: 325.96,
  tax: 26.08,
  deliveryFee: 5.99,
  total: 358.03,
  deliveryAddress: '123 Main St, Apt 4B, New York, NY 10001',
  paymentMethod: 'Visa ending in 4242',
  estimatedDelivery: '2025-05-18',
  trackingNumber: 'TRK-987654321',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // In a real app, you would fetch the order details based on the ID
  const order = ORDER;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return '#f39c12';
      case 'In Transit':
        return '#3498db';
      case 'Delivered':
        return '#27ae60';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Processing':
        return <Package size={20} color="#f39c12" />;
      case 'In Transit':
        return <Truck size={20} color="#3498db" />;
      case 'Delivered':
        return <Check size={20} color="#27ae60" />;
      default:
        return <Clock size={20} color="#666" />;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-white px-5 pt-14 pb-4 border-b border-gray-200">
        <TouchableOpacity
          className="w-10 h-10 rounded-full justify-center items-center"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Order Details</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-5 pt-5 pb-8">
        {/* Order Header */}
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-lg font-bold text-gray-800">
              Order #{order.id}
            </Text>
            <Text className="text-sm text-gray-600">
              Placed on {new Date(order.date).toLocaleDateString()}
            </Text>
          </View>
          <View
            className="flex-row items-center px-3 py-2 rounded-lg"
            style={{ backgroundColor: `${getStatusColor(order.status)}15` }}
          >
            {getStatusIcon(order.status)}
            <Text
              className="text-sm font-medium ml-2"
              style={{ color: getStatusColor(order.status) }}
            >
              {order.status}
            </Text>
          </View>
        </View>

        {/* Items Section */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">Items</Text>
          {order.items.map((item) => (
            <View
              key={item.id}
              className="flex-row mb-4 pb-4 border-b border-gray-100"
            >
              <Image
                source={{ uri: item.image }}
                className="w-16 h-16 rounded-lg"
              />
              <View className="flex-1 ml-4">
                <Text className="text-base font-bold text-gray-800">
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-600 mb-1">
                  {item.storeName}
                </Text>
                <View className="flex-row justify-between items-center">
                  <Text className="text-base font-bold text-blue-500">
                    ${item.price.toFixed(2)}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    x{item.quantity}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Information Section */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Delivery Information
          </Text>
          <View className="flex-row items-center mb-3">
            <MapPin size={18} color="#666" />
            <Text className="text-sm text-gray-600 ml-2">
              {order.deliveryAddress}
            </Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Clock size={18} color="#666" />
            <Text className="text-sm text-gray-600 ml-2">
              Estimated delivery:{' '}
              {new Date(order.estimatedDelivery).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Truck size={18} color="#666" />
            <Text className="text-sm text-gray-600 ml-2">
              Tracking number: {order.trackingNumber}
            </Text>
          </View>
        </View>

        {/* Payment Information Section */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Payment Information
          </Text>
          <View className="flex-row items-center">
            <CreditCard size={18} color="#666" />
            <Text className="text-sm text-gray-600 ml-2">
              {order.paymentMethod}
            </Text>
          </View>
        </View>

        {/* Order Summary Section */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Order Summary
          </Text>
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-gray-600">Subtotal</Text>
            <Text className="text-sm text-gray-800">
              ${order.subtotal.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-sm text-gray-600">Tax</Text>
            <Text className="text-sm text-gray-800">
              ${order.tax.toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-sm text-gray-600">Delivery Fee</Text>
            <Text className="text-sm text-gray-800">
              ${order.deliveryFee.toFixed(2)}
            </Text>
          </View>
          <View className="h-px bg-gray-100 mb-4" />
          <View className="flex-row justify-between">
            <Text className="text-lg font-bold text-gray-800">Total</Text>
            <Text className="text-lg font-bold text-blue-500">
              ${order.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Support Button */}
        <TouchableOpacity
          className="bg-blue-50 py-4 rounded-xl items-center"
          onPress={() => {
            /* In a real app, this would open support */
          }}
        >
          <Text className="text-base font-medium text-blue-500">
            Need Help With This Order?
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
