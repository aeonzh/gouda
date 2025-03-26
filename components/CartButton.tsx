import { View, Text, TouchableOpacity } from 'react-native';
import { ShoppingCart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type CartButtonProps = {
  itemCount: number;
  onPress?: () => void;
};

export default function CartButton({ itemCount }: CartButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="absolute bottom-10 right-10 w-16 h-16 bg-blue-500 rounded-full justify-center items-center shadow-lg"
      onPress={() => {
        router.push('/cart');
      }}
    >
      <ShoppingCart size={24} color="#fff" />
      {itemCount > 0 && (
        <View className="w-6 h-6 bg-red-500 justify-center items-center">
          <Text className="text-white text-xs">{itemCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
