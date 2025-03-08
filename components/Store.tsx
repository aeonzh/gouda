import { Image, Text, TouchableOpacity, View } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';

// Component to display individual store items
const Store = ({ item, onPress }) => (
  <TouchableOpacity
    className="flex-row bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
    onPress={onPress}
  >
    <Image source={{ uri: item.image }} className="w-24 h-24" />
    <View className="flex-1 p-3 justify-between">
      <Text className="text-base font-bold text-gray-800 mb-1">
        {item.name}
      </Text>
      <View className="flex-row items-center mb-2">
        <View className="flex-row items-center mr-3">
          <Star size={16} color="#FFD700" fill="#FFD700" />
          <Text className="text-sm text-gray-600 ml-1">{item.rating}</Text>
        </View>
        <View className="flex-row items-center">
          <MapPin size={16} color="#666" />
          <Text className="text-sm text-gray-600 ml-1">{item.location}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default Store;
