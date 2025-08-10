import { useRouter } from 'expo-router';
import {
  getProfile,
  Profile,
  updateProfile,
} from 'packages/shared/api/profiles';
import { supabase } from 'packages/shared/api/supabase';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<null | Profile>(null);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const router = useRouter();

  useEffect(() => {
    console.log('EditProfileScreen: Component mounted');
  }, []);

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const fetchedProfile = await getProfile(user.id);
          if (fetchedProfile) {
            setProfile(fetchedProfile);
            setUsername(fetchedProfile.username || '');
            setFullName(fetchedProfile.full_name || '');
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch profile:', error?.message || error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      const updatedData: Partial<Profile> = {
        full_name: fullName,
        username,
      };
      await updateProfile(profile.id, updatedData);
      router.back();
    } catch (error: any) {
      console.error('Failed to update profile:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator
          color='#0000ff'
          size='large'
        />
        <Text className='mt-4 text-lg text-gray-700'>
          Loading profile data...
        </Text>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-white p-4'>
      <Text className='mb-6 text-center text-3xl font-extrabold text-gray-800'>
        Edit Profile
      </Text>

      <View className='mb-4'>
        <Text className='mb-2 text-lg font-semibold text-gray-700'>
          Username
        </Text>
        <TextInput
          className='rounded-lg border border-gray-300 p-3 text-lg'
          onChangeText={setUsername}
          placeholder='Enter username'
          value={username}
        />
      </View>

      <View className='mb-6'>
        <Text className='mb-2 text-lg font-semibold text-gray-700'>
          Full Name
        </Text>
        <TextInput
          className='rounded-lg border border-gray-300 p-3 text-lg'
          onChangeText={setFullName}
          placeholder='Enter full name'
          value={fullName}
        />
      </View>

      <TouchableOpacity
        className='self-center rounded-lg bg-blue-600 px-5 py-3 shadow-sm'
        disabled={loading}
        onPress={handleUpdateProfile}
      >
        <Text className='text-base font-semibold text-white'>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}
