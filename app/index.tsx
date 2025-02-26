import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import '../global.css';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    // In a real app, you would validate and authenticate here
    router.replace('/shops');
  };

  return (
    <ScrollView className="flex-grow bg-white p-20">
      <View className="items-center">
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHN0b3JlfGVufDB8fDB8fHww',
          }}
          className="w-24 h-24 rounded-full"
        />
        <Text className="text-2xl font-bold mt-4 text-gray-900">Gouda</Text>
        <Text className="text-base text-gray-600 mt-2">Order and receive</Text>
      </View>

      <View className="mt-5">
        <TouchableOpacity
          className="bg-blue-500 py-4 rounded-lg items-center mb-5"
          onPress={handleLogin}
        >
          <Text className="text-white text-lg font-bold">
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
