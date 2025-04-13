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
import { useEffect, useState } from 'react';

// Import mock orders data
import mockOrders from '../../mock/orders.json';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    // Find the order with the matching ID from the mock data
    const foundOrder = mockOrders.find(order => order.id === id);
    if (foundOrder) {
      setOrder(foundOrder);
    }
  }, [id]);

  // Show loading state if order is not yet loaded
  if (!order) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-600">Loading order details...</Text>
      </View>
    );
  }

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
              Order #{order.orderNumber}
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

        {/* Store Information */}
        <View className="bg-white rounded-xl p-4 mb-6 shadow-sm">
          <View className="flex-row items-center">
            <Image
              source={{ uri: order.storeImage }}
              className="w-12 h-12 rounded-full"
            />
            <View className="ml-3">
              <Text className="text-base font-bold text-gray-800">{order.storeName}</Text>
              <Text className="text-sm text-gray-600">Order from this store</Text>
            </View>
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
                  {order.storeName}
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
