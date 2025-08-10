import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Address,
  getAddresses,
  updateAddress,
} from 'packages/shared/api/profiles';
import { supabase } from 'packages/shared/api/supabase';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EditAddressScreen() {
  const { id } = useLocalSearchParams();
  const addressId = typeof id === 'string' ? id : undefined;
  const [loading, setLoading] = useState(true);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAddress = async () => {
      if (!addressId) return router.back();
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const fetchedAddresses = await getAddresses(user.id);
        const addressToEdit = fetchedAddresses?.find(
          (addr) => addr.id === addressId,
        );

        if (addressToEdit) {
          setAddressLine1(addressToEdit.address_line1);
          setAddressLine2(addressToEdit.address_line2 || '');
          setCity(addressToEdit.city);
          setState(addressToEdit.state);
          setPostalCode(addressToEdit.postal_code);
          setCountry(addressToEdit.country);
          setIsDefault(addressToEdit.is_default);
        } else {
          router.back();
        }
      } catch (error: any) {
        console.error('Failed to fetch address:', error?.message || error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [addressId, router]);

  const handleUpdateAddress = async () => {
    if (!addressId) return;

    setLoading(true);
    try {
      const updatedAddress: Partial<
        Omit<Address, 'created_at' | 'id' | 'updated_at'>
      > = {
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        country,
        is_default: isDefault,
        postal_code: postalCode,
        state,
      };

      await updateAddress(addressId, updatedAddress);
      router.back();
    } catch (error: any) {
      console.error('Failed to update address:', error?.message || error);
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
        <Text className='mt-4 text-lg text-gray-700'>Loading address...</Text>
      </View>
    );
  }

  return (
    <ScrollView className='flex-1 bg-white p-4'>
      <Text className='mb-6 text-center text-3xl font-extrabold text-gray-800'>
        Edit Address
      </Text>

      <View className='mb-4'>
        <Text className='mb-2 text-lg font-semibold text-gray-700'>
          Address Line 1
        </Text>
        <TextInput
          className='rounded-lg border border-gray-300 p-3 text-lg'
          onChangeText={setAddressLine1}
          placeholder='Street address, P.O. Box, company name, c/o'
          value={addressLine1}
        />
      </View>

      <View className='mb-4'>
        <Text className='mb-2 text-lg font-semibold text-gray-700'>
          Address Line 2 (Optional)
        </Text>
        <TextInput
          className='rounded-lg border border-gray-300 p-3 text-lg'
          onChangeText={setAddressLine2}
          placeholder='Apartment, suite, unit, building, floor, etc.'
          value={addressLine2}
        />
      </View>

      <View className='mb-4'>
        <Text className='mb-2 text-lg font-semibold text-gray-700'>City</Text>
        <TextInput
          className='rounded-lg border border-gray-300 p-3 text-lg'
          onChangeText={setCity}
          placeholder='City'
          value={city}
        />
      </View>

      <View className='mb-4'>
        <Text className='mb-2 text-lg font-semibold text-gray-700'>
          State/Province/Region
        </Text>
        <TextInput
          className='rounded-lg border border-gray-300 p-3 text-lg'
          onChangeText={setState}
          placeholder='State/Province/Region'
          value={state}
        />
      </View>

      <View className='mb-4'>
        <Text className='mb-2 text-lg font-semibold text-gray-700'>
          Postal Code
        </Text>
        <TextInput
          className='rounded-lg border border-gray-300 p-3 text-lg'
          keyboardType='numeric'
          onChangeText={setPostalCode}
          placeholder='Postal Code'
          value={postalCode}
        />
      </View>

      <View className='mb-6'>
        <Text className='mb-2 text-lg font-semibold text-gray-700'>
          Country
        </Text>
        <TextInput
          className='rounded-lg border border-gray-300 p-3 text-lg'
          onChangeText={setCountry}
          placeholder='Country'
          value={country}
        />
      </View>

      <View className='mb-6 flex-row items-center justify-between rounded-lg border border-gray-300 p-3'>
        <Text className='text-lg font-semibold text-gray-700'>
          Set as Default Address
        </Text>
        <Switch
          ios_backgroundColor='#3e3e3e'
          onValueChange={setIsDefault}
          thumbColor={isDefault ? '#f5dd4b' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          value={isDefault}
        />
      </View>

      <TouchableOpacity
        className='mb-8 self-center rounded-lg bg-blue-600 px-5 py-3 shadow-sm'
        disabled={loading}
        onPress={handleUpdateAddress}
      >
        <Text className='text-base font-semibold text-white'>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
