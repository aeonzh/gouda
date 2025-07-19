import { Session } from '@supabase/supabase-js';
import { useFocusEffect, useRouter } from 'expo-router';
import { getProfile, Profile } from 'packages/shared/api/profiles';
import { supabase } from 'packages/shared/api/supabase';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const [session, setSession] = useState<null | Session>(null);
  const [profile, setProfile] = useState<null | Profile>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();

  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    try {
      const fetchedProfile = await getProfile(userId);
      setProfile(fetchedProfile);
    } catch (error: any) {
      Alert.alert('Error', `Failed to fetch profile: ${error.message}`);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user?.id) {
          await fetchProfile(session.user.id);
        }
        setLoading(false);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      Alert.alert('Logged out', 'You have been successfully logged out.');
      router.replace('/login'); // Redirect to login screen
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#0000ff" size="large" />
        <Text className="mt-4 text-lg text-gray-700">
          {loading ? 'Loading session...' : 'Loading profile...'}
        </Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-xl font-bold mb-4">Not Logged In</Text>
        <Button onPress={() => router.push('/login')} title="Go to Login" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-3xl font-extrabold mb-6 text-center text-gray-800">
        My Account
      </Text>

      <View className="bg-gray-50 p-6 rounded-xl shadow-md mb-6">
        <Text className="text-xl font-semibold mb-4 text-gray-700">
          Profile Information
        </Text>
        <Text className="text-lg mb-2 text-gray-600">
          <Text className="font-medium">Email:</Text> {session.user?.email}
        </Text>
        <Text className="text-lg mb-2 text-gray-600">
          <Text className="font-medium">Username:</Text>{' '}
          {profile?.username || 'N/A'}
        </Text>
        <Text className="text-lg mb-4 text-gray-600">
          <Text className="font-medium">Full Name:</Text>{' '}
          {profile?.full_name || 'N/A'}
        </Text>
        <TouchableOpacity
          className="bg-blue-600 py-3 px-5 rounded-lg self-start shadow-sm"
          onPress={() => router.push('/profile/edit')}
        >
          <Text className="text-white font-semibold text-base">
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <View className="bg-gray-50 p-6 rounded-xl shadow-md mb-6">
        <Text className="text-xl font-semibold mb-4 text-gray-700">
          Shipping Addresses
        </Text>
        <TouchableOpacity
          className="bg-blue-600 py-3 px-5 rounded-lg self-start shadow-sm"
          onPress={() => router.push('/profile/addresses')}
        >
          <Text className="text-white font-semibold text-base">
            Manage Addresses
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mt-auto border-t border-gray-200 pt-6">
        <TouchableOpacity
          className="bg-red-500 py-3 px-5 rounded-lg self-center shadow-sm"
          disabled={loading}
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold text-base">Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
