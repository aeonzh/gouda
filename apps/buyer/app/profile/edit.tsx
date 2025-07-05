import { useRouter } from 'expo-router';
import {
  Profile,
  getProfile,
  updateProfile,
} from 'packages/shared/api/profiles';
import { supabase } from 'packages/shared/api/supabase';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const router = useRouter();

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
        Alert.alert('Error', `Failed to fetch profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentProfile();
  }, []);

  const handleUpdateProfile = async () => {
    if (!profile) {
      Alert.alert('Error', 'Profile data not loaded.');
      return;
    }

    setLoading(true);
    try {
      const updatedData: Partial<Profile> = {
        username,
        full_name: fullName,
      };
      await updateProfile(profile.id, updatedData);
      Alert.alert('Success', 'Profile updated successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', `Failed to update profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-lg text-gray-700">
          Loading profile data...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-3xl font-extrabold mb-6 text-center text-gray-800">
        Edit Profile
      </Text>

      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          Username
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          value={username}
          onChangeText={setUsername}
          placeholder="Enter username"
        />
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          Full Name
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter full name"
        />
      </View>

      <TouchableOpacity
        onPress={handleUpdateProfile}
        disabled={loading}
        className="bg-blue-600 py-3 px-5 rounded-lg self-center shadow-sm"
      >
        <Text className="text-white font-semibold text-base">Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}
