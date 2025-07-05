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
  Alert,
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
      if (!addressId) {
        Alert.alert('Error', 'Address ID is missing.');
        router.back();
        return;
      }
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          Alert.alert('Error', 'User not logged in.');
          return;
        }

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
          Alert.alert('Error', 'Address not found.');
          router.back();
        }
      } catch (error: any) {
        Alert.alert('Error', `Failed to fetch address: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [addressId, router]);

  const handleUpdateAddress = async () => {
    if (!addressId) {
      Alert.alert('Error', 'Address ID is missing.');
      return;
    }

    setLoading(true);
    try {
      const updatedAddress: Partial<
        Omit<Address, 'id' | 'created_at' | 'updated_at'>
      > = {
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        state,
        postal_code: postalCode,
        country,
        is_default: isDefault,
      };

      await updateAddress(addressId, updatedAddress);
      Alert.alert('Success', 'Address updated successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', `Failed to update address: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-lg text-gray-700">Loading address...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-3xl font-extrabold mb-6 text-center text-gray-800">
        Edit Address
      </Text>

      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          Address Line 1
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          value={addressLine1}
          onChangeText={setAddressLine1}
          placeholder="Street address, P.O. Box, company name, c/o"
        />
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          Address Line 2 (Optional)
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          value={addressLine2}
          onChangeText={setAddressLine2}
          placeholder="Apartment, suite, unit, building, floor, etc."
        />
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2 text-gray-700">City</Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          value={city}
          onChangeText={setCity}
          placeholder="City"
        />
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          State/Province/Region
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          value={state}
          onChangeText={setState}
          placeholder="State/Province/Region"
        />
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          Postal Code
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          value={postalCode}
          onChangeText={setPostalCode}
          placeholder="Postal Code"
          keyboardType="numeric"
        />
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          Country
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          value={country}
          onChangeText={setCountry}
          placeholder="Country"
        />
      </View>

      <View className="flex-row items-center justify-between mb-6 p-3 border border-gray-300 rounded-lg">
        <Text className="text-lg font-semibold text-gray-700">
          Set as Default Address
        </Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDefault ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={setIsDefault}
          value={isDefault}
        />
      </View>

      <TouchableOpacity
        onPress={handleUpdateAddress}
        disabled={loading}
        className="bg-blue-600 py-3 px-5 rounded-lg self-center shadow-sm mb-8"
      >
        <Text className="text-white font-semibold text-base">Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
