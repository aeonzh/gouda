import '@global.css';
import { Session } from '@supabase/supabase-js';
import { SplashScreen, Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { supabase } from 'shared/api/supabase';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

/**
 * InitialLayout component handles user session management and redirection based on authentication status and user roles.
 * It displays a loading screen until the session is determined and then redirects the user to the appropriate route.
 */
export default function InitialLayout() {
  const [session, setSession] = useState<Session | null>(null);
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
        if (!loading) {
          SplashScreen.hideAsync();
        }
      },
    );

    // Cleanup function to unsubscribe from the auth listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Effect to handle redirection based on session status and user roles
  useEffect(() => {
    if (!loading) {
      // Check if the current route is within the authentication group
      const inAuthGroup = segments[0] === '(auth)';

      if (session && !inAuthGroup) {
        // User is logged in, redirect to tabs if not already there
        // Fetch user role for role-based redirection
        const fetchUserRole = async () => {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error fetching user role:', error.message);
            // Default to a safe route if role cannot be fetched
            router.replace('/(tabs)');
            return;
          }

          // Basic role-based redirection: Admins and sales agents go to tabs
          const inTabsGroup = segments[0] === '(tabs)';
          if (profile?.role === 'admin' || profile?.role === 'sales_agent') {
            if (!inTabsGroup) {
              router.replace('/(tabs)');
            }
          } else {
            // If not an admin or sales_agent, log them out or redirect to a generic error page
            console.warn('Unauthorized role detected. Logging out.');
            supabase.auth.signOut(); // Sign out the unauthorized user
            router.replace('/(auth)/login'); // Redirect to login page
          }
        };
        fetchUserRole(); // Execute the role fetching and redirection logic
      } else if (!session && !inAuthGroup) {
        // User is not logged in and not in auth group, redirect to login
        router.replace('/(auth)/login');
      } else if (session && inAuthGroup) {
        // User is logged in and in auth group, redirect to tabs
        router.replace('/(tabs)');
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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name='(tabs)'
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='products/manage'
        options={{ headerShown: false }}
      />
      {/* Add other admin routes here if needed */}
    </Stack>
  );
}
