import { Image, View, Text, TouchableOpacity } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { StoreItemType } from '@/types';

export default function storeCatalogItem({ item }: { item: StoreItemType }) {
  return (
    <View className="w-1/2 p-2">
      <TouchableOpacity className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Image source={{ uri: item.image }} className="w-full h-32" />
        <View className="p-3">
          <Text className="text-sm font-medium text-gray-800 mb-1">
            {item.name}
          </Text>
          <Text className="text-lg font-bold text-blue-500">
            €{item.price.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center justify-center bg-blue-500 py-2"
          // onPress={() => onAddToCart(item)}
        >
          <ShoppingBag size={16} color="#fff" />
          <Text className="text-white font-medium ml-1">Add</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
}
