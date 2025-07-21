import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

interface CartIconProps {
  color?: string;
  size?: number;
}

export function ShoppingCartIcon({
  color = 'black',
  size = 24,
}: CartIconProps) {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push('/cart')}>
      <Ionicons
        color={color}
        name='cart-outline'
        size={size}
      />
    </TouchableOpacity>
  );
}
