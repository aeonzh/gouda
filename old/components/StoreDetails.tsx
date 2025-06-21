import React from 'react';
import { View, Text } from 'react-native';
import { Star, MapPin, Clock, Phone } from 'lucide-react-native';

type StoreDetailsProps = {
  store: {
    name: string;
    rating: number;
    location: string;
    hours?: string;
    phone?: string;
    description?: string;
  };
};

export default function StoreDetails({ store }: StoreDetailsProps) {
  return (
    <View>
      <Text className="text-2xl font-bold text-gray-800 mb-2">
        {store.name}
      </Text>

      <View className="flex-row items-center mb-5">
        <Star size={18} color="#FFD700" fill="#FFD700" />
        <Text className="text-base text-gray-600 ml-1 mr-4">
          {store.rating}
        </Text>
      </View>

      <View className="bg-gray-50 rounded-xl p-4 mb-6">
        <View className="flex-row items-center mb-3">
          <MapPin size={18} color="#666" />
          <Text className="text-base text-gray-600 ml-2">{store.location}</Text>
        </View>

        {store.hours && (
          <View className="flex-row items-center mb-3">
            <Clock size={18} color="#666" />
            <Text className="text-base text-gray-600 ml-2">{store.hours}</Text>
          </View>
        )}

        {store.phone && (
          <View className="flex-row items-center">
            <Phone size={18} color="#666" />
            <Text className="text-base text-gray-600 ml-2">{store.phone}</Text>
          </View>
        )}
      </View>

      {store.description && (
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-2">About</Text>
          <Text className="text-base text-gray-600 leading-6">
            {store.description}
          </Text>
        </View>
      )}
    </View>
  );
}
