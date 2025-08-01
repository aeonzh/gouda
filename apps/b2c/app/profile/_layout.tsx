import { Stack } from 'expo-router';
import { useEffect } from 'react';

export default function ProfileLayout() {
  useEffect(() => {
    console.log(
      'ProfileLayout: Rendering with screens: index, edit, addresses',
    );
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='edit'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='addresses'
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
