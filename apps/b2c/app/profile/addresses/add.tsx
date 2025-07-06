import { useRouter } from 'expo-router';
import { Address, addAddress } from 'packages/shared/api/profiles';
import { supabase } from 'packages/shared/api/supabase';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddAddressScreen() {
  const [loading, setLoading] = useState(false);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const router = useRouter();

  const handleAddAddress = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not logged in.');
        return;
      }

      const newAddress: Omit<Address, 'id' | 'created_at' | 'updated_at'> = {
        user_id: user.id,
        address_line1: addressLine1,
        address_line2: addressLine2 || null, // Change undefined to null
        city,
        state,
        postal_code: postalCode,
        country,
        is_default: isDefault,
      };

      await addAddress(newAddress);
      Alert.alert('Success', 'Address added successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', `Failed to add address: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-3xl font-extrabold mb-6 text-center text-gray-800">
        Add New Address
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
        onPress={handleAddAddress}
        disabled={loading}
        className="bg-blue-600 py-3 px-5 rounded-lg self-center shadow-sm mb-8"
      >
        <Text className="text-white font-semibold text-base">Add Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
