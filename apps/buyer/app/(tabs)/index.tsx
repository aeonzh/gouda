import '../../global.css';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold">Welcome to the Buyer App Home!</Text>
    </View>
  );
}
