import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { ChevronRight, Clock, ShoppingBag } from 'lucide-react-native';
import ORDERS from '../../mock/orders.json';

// Filter options for orders
const FILTERS = [
  { id: 'all', name: 'All' },
  { id: 'processing', name: 'Processing' },
  { id: 'in-transit', name: 'In Transit' },
  { id: 'delivered', name: 'Delivered' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredOrders = ORDERS.filter((order) => {
    if (activeFilter === 'all') return true;
    return order.status.toLowerCase() === activeFilter.replace('-', ' ');
  });

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white rounded-xl mb-4 shadow-sm"
      onPress={() => router.push(`/orders/${item.id}`)}
    >
      <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
        <View className="flex-row items-center">
          <Image
            source={{ uri: item.storeImage }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="text-base font-bold text-gray-800">
              {item.storeName}
            </Text>
            <Text className="text-xs text-gray-500">{item.orderNumber}</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#999" />
      </View>

      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <Clock size={16} color="#666" />
          <Text className="text-sm text-gray-600 ml-2">
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-800 mb-2">
            {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
          </Text>
          {item.items.map((orderItem) => (
            <View key={orderItem.id} className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-600 flex-2">
                {orderItem.name}
              </Text>
              <Text className="text-sm text-gray-600 flex-1 text-center">
                x{orderItem.quantity}
              </Text>
              <Text className="text-sm text-gray-600 flex-1 text-right">
                ${orderItem.price.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
          <View className="flex-row items-center">
            <Text className="text-sm text-gray-600 mr-1">Total:</Text>
            <Text className="text-base font-bold text-gray-800">
              ${item.total.toFixed(2)}
            </Text>
          </View>

          <View
            className={`px-3 py-1 rounded-full ${
              item.status === 'Delivered'
                ? 'bg-green-50'
                : item.status === 'In Transit'
                ? 'bg-blue-50'
                : 'bg-yellow-50'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                item.status === 'Delivered'
                  ? 'text-green-600'
                  : item.status === 'In Transit'
                  ? 'text-blue-600'
                  : 'text-yellow-600'
              }`}
            >
              {item.status}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full mx-1 ${
        activeFilter === item.id ? 'bg-blue-500' : 'bg-gray-100'
      }`}
      onPress={() => setActiveFilter(item.id)}
    >
      <Text
        className={`text-sm ${
          activeFilter === item.id ? 'text-white' : 'text-gray-600'
        }`}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4">
        <Text className="text-2xl font-bold text-gray-800">My Orders</Text>
      </View>

      {/* Filters */}
      <View className="bg-white pb-3 border-b border-gray-200">
        <FlatList
          data={FILTERS}
          renderItem={renderFilterItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}
        />
      </View>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 15 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <ShoppingBag size={60} color="#ccc" />
          <Text className="text-lg font-bold text-gray-600 mt-4">
            No orders found
          </Text>
          <Text className="text-sm text-gray-500 mt-2 text-center">
            Orders matching your filter will appear here
          </Text>
        </View>
      )}
    </View>
  );
}
