import { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
} from 'lucide-react-native';

// Mock data for cart items
const INITIAL_CART_ITEMS = [
  {
    id: '101',
    name: 'Designer T-Shirt',
    price: 49.99,
    quantity: 1,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHNoaXJ0fGVufDB8fDB8fHww',
    storeName: 'Fashion Boutique',
  },
  {
    id: '202',
    name: 'Smart Watch',
    price: 249.99,
    quantity: 1,
    image:
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c21hcnQlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D',
    storeName: 'Tech Haven',
  },
  {
    id: '302',
    name: 'Artisan Cheese',
    price: 12.99,
    quantity: 2,
    image:
      'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hlZXNlfGVufDB8fDB8fHww',
    storeName: 'Gourmet Delights',
  },
];

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);

  const updateQuantity = (id, change) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.08; // 8% tax
  const shipping = 5.99;
  const total = subtotal + tax + shipping;

  const renderCartItem = ({ item }) => (
    <View className="flex-row bg-white p-4 rounded-xl mb-3 shadow-sm">
      <Image source={{ uri: item.image }} className="w-20 h-20 rounded-lg" />

      <View className="flex-1 ml-3">
        <View className="flex-row justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-base font-bold text-gray-800 mb-1">
              {item.name}
            </Text>
            <Text className="text-xs text-gray-500 mb-2">{item.storeName}</Text>
          </View>
          <Pressable onPress={() => removeItem(item.id)}>
            <Trash2 size={18} color="#e74c3c" />
          </Pressable>
        </View>

        <View className="flex-row justify-between items-center">
          <Text className="text-base font-bold text-blue-500">
            ${item.price.toFixed(2)}
          </Text>

          <View className="flex-row items-center">
            <Pressable
              className="w-7 h-7 rounded-full bg-gray-100 justify-center items-center"
              onPress={() => updateQuantity(item.id, -1)}
            >
              <Minus size={14} color="#666" />
            </Pressable>
            <Text className="mx-3 font-bold">{item.quantity}</Text>
            <Pressable
              className="w-7 h-7 rounded-full bg-gray-100 justify-center items-center"
              onPress={() => updateQuantity(item.id, 1)}
            >
              <Plus size={14} color="#666" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between pt-14 px-5 pb-4 bg-white">
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={24} color="#333" />
        </Pressable>
        <Text className="text-xl font-bold text-gray-800">Shopping Cart</Text>
        <View className="w-6" />
      </View>

      {cartItems.length > 0 ? (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            contentContainerClassName="p-4"
          />

          <View className="bg-white p-5 rounded-t-3xl shadow-sm">
            <View className="mb-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-base text-gray-600">Subtotal</Text>
                <Text className="text-base text-gray-800">
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-base text-gray-600">Tax</Text>
                <Text className="text-base text-gray-800">
                  ${tax.toFixed(2)}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-base text-gray-600">Shipping</Text>
                <Text className="text-base text-gray-800">
                  ${shipping.toFixed(2)}
                </Text>
              </View>
              <View className="border-t border-gray-200 my-2" />
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-800">Total</Text>
                <Text className="text-lg font-bold text-blue-500">
                  ${total.toFixed(2)}
                </Text>
              </View>
            </View>

            <Pressable
              className="bg-blue-500 py-4 rounded-xl flex-row justify-center items-center"
              onPress={() => router.push('/orders/1')}
            >
              <ShoppingBag size={20} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">
                Checkout
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View className="flex-1 justify-center items-center p-5">
          <ShoppingBag size={60} color="#ccc" />
          <Text className="text-xl font-bold text-gray-600 mt-5">
            Your cart is empty
          </Text>
          <Text className="text-base text-gray-500 mt-2 text-center">
            Add items from shops to start shopping
          </Text>
          <Pressable
            className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
            onPress={() => router.push('/shops')}
          >
            <Text className="text-white font-bold">Browse Shops</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
