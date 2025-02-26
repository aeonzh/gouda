import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-xl font-semibold">
          404 This screen doesn't exist.
        </Text>
        <Link href="/" className="mt-4 py-4 text-blue-500 font-bold">
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
