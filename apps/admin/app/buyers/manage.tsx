import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Profile,
  createBuyer,
  getBuyerById,
  updateBuyer,
} from 'shared/api/profiles';
import { Button } from 'shared/components/Button';
import { Input } from 'shared/components/Input';
import { TabBarIcon } from 'shared/components/TabBarIcon';

export default function ManageBuyerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoadLoading, setInitialLoadLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing) {
      fetchBuyerDetails(id as string);
    }
  }, [id]);

  const fetchBuyerDetails = async (buyerId: string) => {
    try {
      setInitialLoadLoading(true);
      const data = await getBuyerById(buyerId);
      if (data) {
        setUsername(data.username);
        setFullName(data.full_name || '');
      } else {
        Alert.alert('Error', 'Buyer not found.');
        router.back();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load buyer details.');
      router.back();
    } finally {
      setInitialLoadLoading(false);
    }
  };

  const handleSaveBuyer = async () => {
    setError(null);
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    setLoading(true);
    try {
      const buyerData: Partial<Profile> = {
        username: username.trim(),
        full_name: fullName.trim() || null,
      };

      if (isEditing) {
        await updateBuyer(id as string, buyerData);
        Alert.alert('Success', 'Buyer updated successfully!');
      } else {
        // For new buyers, we need to ensure the role is 'buyer'
        // The createBuyer function already sets the role to 'buyer'
        await createBuyer({ ...buyerData, role: 'buyer' } as Omit<
          Profile,
          'id' | 'created_at' | 'updated_at'
        >);
        Alert.alert('Success', 'Buyer created successfully!');
      }
      router.back();
    } catch (err: any) {
      setError(
        err.message || `Failed to ${isEditing ? 'update' : 'create'} buyer.`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoadLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Stack.Screen
        options={{ title: isEditing ? 'Edit Buyer' : 'Add Buyer' }}
      />
      <ScrollView className="flex-1">
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Username</Text>
          <Input
            placeholder="Enter username"
            value={username}
            onChangeText={setUsername}
            className="border border-gray-300 p-3 rounded-md"
            autoCapitalize="none"
          />
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">
            Full Name (Optional)
          </Text>
          <Input
            placeholder="Enter full name"
            value={fullName}
            onChangeText={setFullName}
            className="border border-gray-300 p-3 rounded-md"
          />
        </View>

        {error && <Text className="text-red-500 mb-4">{error}</Text>}

        <Button onPress={handleSaveBuyer} isLoading={loading}>
          <Text className="text-white text-lg font-semibold">
            {isEditing ? 'Save Changes' : 'Add Buyer'}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
}
