import { Text, View } from 'react-native';

import '../../global.css';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg font-bold">
        Welcome to the Customer App Home!
      </Text>
    </View>
  );
}
