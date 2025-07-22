import '@expo/metro-runtime';
import { Session } from '@supabase/supabase-js';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from 'packages/shared/api/supabase';
import { AuthProvider } from 'packages/shared/components';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * InitialLayout component handles user session management and redirection based on authentication status.
 * It displays a loading screen until the session is determined and then redirects the user to the appropriate route.
 */
export default function InitialLayout() {
  const [session, setSession] = useState<null | Session>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  // Effect to handle initial session fetching and real-time authentication state changes
  useEffect(() => {
    // Fetch the current session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      SplashScreen.hideAsync();
    });

    // Subscribe to authentication state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
      },
    );

    // Cleanup function to unsubscribe from the auth listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Effect to handle redirection based on session status
  useEffect(() => {
    console.log('Session:', session);
    console.log('Loading:', loading);
    console.log('Segments:', segments);

    if (!loading) {
      // Check if the current route is within the authentication group
      const inAuthGroup = segments[0] === '(auth)';
      const inTabsGroup = segments[0] === '(tabs)';
      const inStorefrontGroup = segments[0] === 'storefront';
      const inProductsDetailGroup = segments[0] === 'products' && segments[1] === '[id]'; // Check for products/[id]

      if (session) {
        if (inAuthGroup) {
          router.replace('/(tabs)');
        } else if (!inTabsGroup && !inStorefrontGroup && !inProductsDetailGroup) {
          // If not in auth, tabs, storefront, or products detail, redirect to tabs
          router.replace('/(tabs)');
        }
      } else if (!inAuthGroup) {
        // User is not logged in and not in auth group, redirect to login
        router.replace('/(auth)/login');
      }
    }
  }, [session, segments, loading]); // Dependencies for this effect: session, segments, and loading state

  // Render a loading screen while the app is loading
  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-50'>
        <Text className='text-xl text-gray-700'>Loading app...</Text>
      </View>
    );
  }

  // Render the main app stack once loading is complete
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name='(tabs)'
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='(auth)'
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='order-confirmation'
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='products/[id]'
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='storefront/[id]'
          options={{ headerShown: false }}
        />
        {/* Add other b2c routes here if needed */}
      </Stack>
    </AuthProvider>
  );
}
