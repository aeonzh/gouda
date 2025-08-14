import { getProfile, Profile } from 'packages/shared/api/profiles';
import { useAuth } from 'packages/shared/components/AuthProvider';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { ErrorBoundary } from '../../components/ErrorBoundary';

export default function ProfileIndexScreen() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<null | Profile>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const fetchedProfile = await getProfile(userId);
      setProfile(fetchedProfile);
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id);
    } else {
      setLoading(false);
    }
  }, [session, fetchProfile]);

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator
          color='#0000ff'
          size='large'
        />
        <Text className='mt-4 text-lg text-gray-700'>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View className='flex-1 bg-white p-4'>
        <Text className='mb-6 text-center text-3xl font-extrabold text-gray-800'>
          My Profile
        </Text>

        <View className='mb-6 rounded-xl bg-gray-50 p-6 shadow-md'>
          <Text className='mb-4 text-xl font-semibold text-gray-700'>
            Profile Information
          </Text>
          <Text className='mb-2 text-lg text-gray-600'>
            <Text className='font-medium'>Email:</Text>{' '}
            {session?.user?.email || 'N/A'}
          </Text>
          <Text className='mb-2 text-lg text-gray-600'>
            <Text className='font-medium'>Username:</Text>{' '}
            {profile?.username || 'N/A'}
          </Text>
          <Text className='mb-4 text-lg text-gray-600'>
            <Text className='font-medium'>Full Name:</Text>{' '}
            {profile?.full_name || 'N/A'}
          </Text>
        </View>
      </View>
    </ErrorBoundary>
  );
}
