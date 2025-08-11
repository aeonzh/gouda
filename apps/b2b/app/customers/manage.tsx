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
  createCustomer,
  getCustomerById,
  Profile,
  updateCustomer,
} from 'shared/api/profiles';
import { Button } from 'shared/components/Button';
import { Input } from 'shared/components/Input';
import { TabBarIcon } from 'shared/components/TabBarIcon';

export default function ManageCustomerScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoadLoading, setInitialLoadLoading] = useState(isEditing);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (isEditing) {
      fetchCustomerDetails(id as string);
    }
  }, [id]);

  const fetchCustomerDetails = async (customerId: string) => {
    try {
      setInitialLoadLoading(true);
      const data = await getCustomerById(customerId);
      if (data) {
        setUsername(data.username);
        setFullName(data.full_name || '');
      } else {
        Alert.alert('Error', 'Customer not found.');
        router.back();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load customer details.');
      router.back();
    } finally {
      setInitialLoadLoading(false);
    }
  };

  const handleSaveCustomer = async () => {
    setError(null);
    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    setLoading(true);
    try {
      const customerData: Partial<Profile> = {
        full_name: fullName.trim() || undefined,
        username: username.trim(),
      };

      if (isEditing) {
        await updateCustomer(id as string, customerData);
        Alert.alert('Success', 'Customer updated successfully!');
      } else {
        // For new customers, we need to ensure the role is 'customer'
        // The createCustomer function already sets the role to 'customer'
        await createCustomer({ ...customerData, role: 'customer' } as Omit<
          Profile,
          'created_at' | 'id' | 'updated_at'
        >);
        Alert.alert('Success', 'Customer created successfully!');
      }
      router.back();
    } catch (err: any) {
      setError(
        err.message || `Failed to ${isEditing ? 'update' : 'create'} customer.`,
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoadLoading) {
    return (
      <View className='flex-1 items-center justify-center'>
        <ActivityIndicator
          color='#0000ff'
          size='large'
        />
      </View>
    );
  }

  return (
    <View className='flex-1 bg-white p-4'>
      <Stack.Screen
        options={{ title: isEditing ? 'Edit Customer' : 'Add Customer' }}
      />
      <ScrollView className='flex-1'>
        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold'>Username</Text>
          <Input
            autoCapitalize='none'
            className='rounded-md border border-gray-300 p-3'
            onChangeText={setUsername}
            placeholder='Enter username'
            value={username}
          />
        </View>

        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold'>
            Full Name (Optional)
          </Text>
          <Input
            className='rounded-md border border-gray-300 p-3'
            onChangeText={setFullName}
            placeholder='Enter full name'
            value={fullName}
          />
        </View>

        {error && <Text className='mb-4 text-red-500'>{error}</Text>}

        <Button
          isLoading={loading}
          onPress={handleSaveCustomer}
        >
          <Text className='text-lg font-semibold text-white'>
            {isEditing ? 'Save Changes' : 'Add Customer'}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
}
