import { useEffect, useState } from "react";
import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { supabase } from "packages/shared/api/supabase";
import { Session } from "@supabase/supabase-js";
import { Stack } from "expo-router";
import { View } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack>
        {session && session.user ? (
          // Authenticated user
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          // Unauthenticated user
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
      </Stack>
    </View>
  );
}
