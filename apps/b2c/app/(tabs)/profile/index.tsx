import { getProfile, Profile } from '@api/profiles';
import { useAuth } from '@components/AuthProvider';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { ErrorComponent } from '../../../components/ErrorComponent';

export default function ProfileScreen() {
  const { session, supabase } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();

  const fetchProfile = useCallback(async (userId: string) => {
    setProfileLoading(true);
    setError(null);
    console.log('Fetching profile for user:', userId);
    try {
      const fetchedProfile = await getProfile(userId);
      setProfile(fetchedProfile);
      console.log('Profile fetched:', fetchedProfile);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error?.message || error);
      console.error('Error fetching profile:', error);
      setError(
        error instanceof Error ? error : new Error('Failed to fetch profile'),
      );
    } finally {
      setProfileLoading(false);
      console.log('Profile loading finished.');
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      console.log('Calling fetchProfile with userId:', session.user.id);
      fetchProfile(session.user.id);
    } else {
      setLoading(false);
    }
  }, [session, fetchProfile]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace('/login'); // Redirect to login screen
    } catch (error: any) {
      console.error('Logout error:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <ErrorComponent
        error={error.message || 'An unknown error occurred'}
        onRetry={() => {
          setError(null);
          if (session?.user?.id) {
            fetchProfile(session.user.id);
          }
        }}
        title='Failed to load profile'
      />
    );
  }

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
    <ErrorBoundary>
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

        {/* Addresses gated for now */}

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
    </ErrorBoundary>
  );
}
