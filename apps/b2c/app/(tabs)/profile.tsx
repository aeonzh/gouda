import { Stack } from 'expo-router';

export default function ProfileStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="addresses" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
