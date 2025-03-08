import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, MapPin, Star } from 'lucide-react-native';

// Mock data for stores
const STORES = [
  {
    id: '1',
    name: 'Fashion Boutique',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2xvdGhpbmclMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D',
    rating: 4.8,
    location: 'Downtown',
    category: 'Clothing',
    distance: '0.8 mi',
  },
  {
    id: '2',
    name: 'Tech Haven',
    image:
      'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWxlY3Ryb25pY3MlMjBzdG9yZXxlbnwwfHwwfHx8MA%3D%3D',
    rating: 4.6,
    location: 'Tech District',
    category: 'Electronics',
    distance: '1.2 mi',
  },
  {
    id: '3',
    name: 'Gourmet Delights',
    image:
      'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z3JvY2VyeSUyMHN0b3JlfGVufDB8fDB8fHww',
    rating: 4.9,
    location: 'Food Court',
    category: 'Grocery',
    distance: '0.5 mi',
  },
  {
    id: '4',
    name: 'Home Essentials',
    image:
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZnVybml0dXJlJTIwc3RvcmV8ZW58MHx8MHx8fDA%3D',
    rating: 4.5,
    location: 'Shopping Mall',
    category: 'Home Goods',
    distance: '1.5 mi',
  },
  {
    id: '5',
    name: 'Sports World',
    image:
      'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BvcnRzJTIwc3RvcmV8ZW58MHx8MHx8fDA%3D',
    rating: 4.7,
    location: 'Sports Complex',
    category: 'Sports',
    distance: '2.0 mi',
  },
];

// Categories for horizontal scrolling
const CATEGORIES = [
  { id: '1', name: 'All' },
  { id: '2', name: 'Clothing' },
  { id: '3', name: 'Electronics' },
  { id: '4', name: 'Grocery' },
  { id: '5', name: 'Home Goods' },
  { id: '6', name: 'Sports' },
];

export default function ShopsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStores = STORES.filter((store) => {
    return store.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <View className="flex-1 bg-gray-50 pt-14">
      {/* Header */}
      <View className="px-5 mb-5">
        <Text className="text-2xl font-bold text-gray-800">Discover Shops</Text>
        <Text className="text-base text-gray-600 mt-1">
          Find the best stores near you
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white mx-5 p-3 rounded-lg shadow-sm mb-5">
        <Search size={20} color="#999" />
        <TextInput
          className="flex-1 ml-2 text-base"
          placeholder="Search stores..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stores List */}
      <FlatList
        data={filteredStores}
        renderItem={({ item }) => (
          <Store
            item={item}
            onPress={() => router.push(`/stores/${item.id}`)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
      />
    </View>
  );
}
