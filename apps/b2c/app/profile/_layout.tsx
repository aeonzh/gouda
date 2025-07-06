import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="edit" options={{ headerShown: false }} />
      <Stack.Screen name="addresses" options={{ headerShown: false }} />
    </Stack>
  );
}
