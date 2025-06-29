import "./global.css";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "shared/api/supabase";
import { Slot, useRouter, useSegments } from "expo-router";
import { View, Text } from "react-native";

export default function AppLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (profile?.role === "admin" || profile?.role === "seller_agent") {
            setSession(session);
          } else {
            // Not an admin, sign them out
            await supabase.auth.signOut();
            setSession(null);
          }
        } else {
          setSession(null);
        }
        setLoading(false);
      }
    );

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (session && !inAuthGroup) {
      router.replace("/(tabs)");
    } else if (!session) {
      router.replace("/(auth)/login");
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return <Slot />;
}
