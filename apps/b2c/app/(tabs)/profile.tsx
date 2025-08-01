import { useRouter } from 'expo-router';
import { getProfile, Profile } from 'packages/shared/api/profiles';
import { useAuth } from 'packages/shared/components/AuthProvider';
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
  const { session, supabase } = useAuth();
  const [profile, setProfile] = useState<null | Profile>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();

  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    console.log('Fetching profile for user:', userId);
    try {
      const fetchedProfile = await getProfile(userId);
      setProfile(fetchedProfile);
      console.log('Profile fetched:', fetchedProfile);
    } catch (error: any) {
      Alert.alert('Error', `Failed to fetch profile: ${error.message}`);
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
      console.log('Profile loading finished.');
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      console.log('Calling fetchProfile with userId:', session.user.id);
      fetchProfile(session.user.id);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [session, fetchProfile]);

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
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator
          color='#0000ff'
          size='large'
        />
        <Text className='mt-4 text-lg text-gray-700'>
          {loading ? 'Loading session...' : 'Loading profile...'}
        </Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View className='flex-1 items-center justify-center bg-white p-4'>
        <Text className='mb-4 text-xl font-bold'>Not Logged In</Text>
        <Button
          onPress={() => router.push('/login')}
          title='Go to Login'
        />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-white p-4'>
      <Text className='mb-6 text-center text-3xl font-extrabold text-gray-800'>
        My Account
      </Text>

      <View className='mb-6 rounded-xl bg-gray-50 p-6 shadow-md'>
        <Text className='mb-4 text-xl font-semibold text-gray-700'>
          Profile Information
        </Text>
        <Text className='mb-2 text-lg text-gray-600'>
          <Text className='font-medium'>Email:</Text> {session.user?.email}
        </Text>
        <Text className='mb-2 text-lg text-gray-600'>
          <Text className='font-medium'>Username:</Text>{' '}
          {profile?.username || 'N/A'}
        </Text>
        <Text className='mb-4 text-lg text-gray-600'>
          <Text className='font-medium'>Full Name:</Text>{' '}
          {profile?.full_name || 'N/A'}
        </Text>
        <TouchableOpacity
          className='self-start rounded-lg bg-blue-600 px-5 py-3 shadow-sm'
          onPress={() => {
            console.log('Navigating to /profile/edit from tab profile');
            console.log('Current route:', router.canGoBack());
            console.log('Attempting to navigate to: /profile/edit');
            router.push('/profile/edit');
          }}
        >
          <Text className='text-base font-semibold text-white'>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

      <View className='mb-6 rounded-xl bg-gray-50 p-6 shadow-md'>
        <Text className='mb-4 text-xl font-semibold text-gray-700'>
          Shipping Addresses
        </Text>
        <TouchableOpacity
          className='self-start rounded-lg bg-blue-600 px-5 py-3 shadow-sm'
          onPress={() => {
            console.log('Navigating to /profile/addresses from tab profile');
            console.log('Current route:', router.canGoBack());
            console.log('Attempting to navigate to: /profile/addresses');
            router.push('/profile/addresses');
          }}
        >
          <Text className='text-base font-semibold text-white'>
            Manage Addresses
          </Text>
        </TouchableOpacity>
      </View>

      <View className='mt-auto border-t border-gray-200 pt-6'>
        <TouchableOpacity
          className='self-center rounded-lg bg-red-500 px-5 py-3 shadow-sm'
          disabled={loading}
          onPress={handleLogout}
        >
          <Text className='text-base font-semibold text-white'>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
