import { Stack } from 'expo-router';

export default function BuyersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="manage" options={{ headerShown: false }} />
    </Stack>
  );
}
