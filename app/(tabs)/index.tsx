import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';

import Store from '../../components/Store';
import STORES from '../../mock/stores.json';

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
