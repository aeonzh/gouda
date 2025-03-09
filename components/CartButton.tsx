import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type CartButtonProps = {
  itemCount: number;
  onPress?: () => void;
};

export default function CartButton({ itemCount, onPress }: CartButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/cart');
    }
  };

  return (
    <TouchableOpacity
      className="w-16 h-16 bg-blue-500 rounded-full justify-center items-center shadow-lg"
      onPress={handlePress}
    >
      <ShoppingCart size={24} color="#fff" />
      {itemCount > 0 && (
        <View className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full justify-center items-center">
          <Text className="text-white text-xs">{itemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
