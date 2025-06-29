import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, ActivityIndicator } from "react-native";
import { supabase } from "packages/shared/api/supabase"; // Adjust path as needed
import { Session } from "@supabase/supabase-js";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      Alert.alert("Logged out", "You have been successfully logged out.");
      router.replace("/login"); // Redirect to login screen
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-lg text-gray-700">Loading profile...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-xl font-bold mb-4">Not Logged In</Text>
        <Button title="Go to Login" onPress={() => router.push("/login")} />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Profile</Text>
      <Text className="text-lg mb-2">Email: {session.user?.email}</Text>
      {/* Add more profile details here if available in session.user.user_metadata or a separate profile table */}
      <Button title="Logout" onPress={handleLogout} disabled={loading} />
    </View>
  );
}
