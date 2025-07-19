import { useRouter } from 'expo-router';
import { addAddress, Address } from 'packages/shared/api/profiles';
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

      const newAddress: Omit<Address, 'created_at' | 'id' | 'updated_at'> = {
        address_line1: addressLine1,
        address_line2: addressLine2 || null, // Change undefined to null
        city,
        country,
        is_default: isDefault,
        postal_code: postalCode,
        state,
        user_id: user.id,
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
          onChangeText={setAddressLine1}
          placeholder="Street address, P.O. Box, company name, c/o"
          value={addressLine1}
        />
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          Address Line 2 (Optional)
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          onChangeText={setAddressLine2}
          placeholder="Apartment, suite, unit, building, floor, etc."
          value={addressLine2}
        />
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2 text-gray-700">City</Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          onChangeText={setCity}
          placeholder="City"
          value={city}
        />
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          State/Province/Region
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          onChangeText={setState}
          placeholder="State/Province/Region"
          value={state}
        />
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          Postal Code
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          keyboardType="numeric"
          onChangeText={setPostalCode}
          placeholder="Postal Code"
          value={postalCode}
        />
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2 text-gray-700">
          Country
        </Text>
        <TextInput
          className="border border-gray-300 p-3 rounded-lg text-lg"
          onChangeText={setCountry}
          placeholder="Country"
          value={country}
        />
      </View>

      <View className="flex-row items-center justify-between mb-6 p-3 border border-gray-300 rounded-lg">
        <Text className="text-lg font-semibold text-gray-700">
          Set as Default Address
        </Text>
        <Switch
          ios_backgroundColor="#3e3e3e"
          onValueChange={setIsDefault}
          thumbColor={isDefault ? '#f5dd4b' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          value={isDefault}
        />
      </View>

      <TouchableOpacity
        className="bg-blue-600 py-3 px-5 rounded-lg self-center shadow-sm mb-8"
        disabled={loading}
        onPress={handleAddAddress}
      >
        <Text className="text-white font-semibold text-base">Add Address</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
