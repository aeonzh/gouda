import { AuthProvider, useAuth } from '@components/AuthProvider';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { isAllowedAuthedRoute, isAuthRoute } from './utils/routeGuards';

/**
 * Handles user redirection based on authentication status.
 * It displays a loading screen until the authentication state is determined and then redirects the user to the appropriate route.
 */
export default function InitialLayout() {
  const { loading, session } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Effect to handle redirection based on session status
  useEffect(() => {
    console.log('Session:', session);
    console.log('Loading:', loading);
    console.log('Segments:', segments);

    if (!loading) {
      const inAuth = isAuthRoute(segments);
      if (session) {
        if (inAuth) {
          router.replace('/(tabs)');
        } else if (!isAllowedAuthedRoute(segments)) {
          router.replace('/(tabs)');
        }
      } else if (!inAuth) {
        router.replace('/(auth)/login');
      }
    }
  }, [session, segments, loading]); // Dependencies for this effect: session, segments, and loading state

  // Render a loading screen while the app is loading
  // TODO: use react-native ActivityIndicator instead of static text
  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50'>
        <Text className='text-xl text-gray-700'>Loading app...</Text>
      </View>
    );
  }

  // Render the main app stack once loading is complete
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='(tabs)' />
            <Stack.Screen name='(auth)' />
            <Stack.Screen name='order-confirmation' />
            <Stack.Screen name='storefront' />
            <Stack.Screen name='cart' />
          </Stack>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
