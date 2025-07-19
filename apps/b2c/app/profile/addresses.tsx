import { Session } from '@supabase/supabase-js';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Address,
  deleteAddress,
  getAddresses,
} from 'packages/shared/api/profiles';
import { supabase } from 'packages/shared/api/supabase';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddressesScreen() {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [userId, setUserId] = useState<null | string>(null);
  const router = useRouter();

  const fetchAddresses = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const fetchedAddresses = await getAddresses(id);
      if (fetchedAddresses) {
        setAddresses(fetchedAddresses);
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to fetch addresses: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        setUserId(session.user.id);
        fetchAddresses(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user?.id) {
          setUserId(session.user.id);
          fetchAddresses(session.user.id);
        } else {
          setUserId(null);
          setAddresses([]);
          setLoading(false);
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchAddresses]);

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        fetchAddresses(userId);
      }
    }, [userId, fetchAddresses]),
  );

  const handleDeleteAddress = async (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAddress(addressId);
              Alert.alert('Success', 'Address deleted successfully!');
              if (userId) {
                fetchAddresses(userId);
              }
            } catch (error: any) {
              Alert.alert(
                'Error',
                `Failed to delete address: ${error.message}`,
              );
            } finally {
              setLoading(false);
            }
          },
          text: 'Delete',
        },
      ],
    );
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <View className="bg-white p-4 rounded-lg shadow-md mb-4 border border-gray-200">
      <Text className="text-lg font-semibold text-gray-800 mb-1">
        {item.address_line1}
      </Text>
      {item.address_line2 && (
        <Text className="text-base text-gray-600 mb-1">
          {item.address_line2}
        </Text>
      )}
      <Text className="text-base text-gray-600 mb-1">
        {item.city}, {item.state} {item.postal_code}
      </Text>
      <Text className="text-base text-gray-600 mb-2">{item.country}</Text>
      {item.is_default && (
        <View className="bg-blue-100 px-3 py-1 rounded-full self-start mb-2">
          <Text className="text-blue-700 text-xs font-bold">Default</Text>
        </View>
      )}
      <View className="flex-row justify-end mt-2">
        <TouchableOpacity
          className="bg-yellow-500 px-4 py-2 rounded-lg mr-2 shadow-sm"
          onPress={() => router.push(`/profile/addresses/edit?id=${item.id}`)}
        >
          <Text className="text-white font-semibold text-sm">Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-red-500 px-4 py-2 rounded-lg shadow-sm"
          onPress={() => handleDeleteAddress(item.id)}
        >
          <Text className="text-white font-semibold text-sm">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator color="#0000ff" size="large" />
        <Text className="mt-4 text-lg text-gray-700">Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-3xl font-extrabold mb-6 text-center text-gray-800">
        My Addresses
      </Text>

      {addresses.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl text-gray-600 mb-4">
            No addresses found.
          </Text>
          <TouchableOpacity
            className="bg-blue-600 py-3 px-5 rounded-lg shadow-sm"
            onPress={() => router.push('/profile/addresses/add')}
          >
            <Text className="text-white font-semibold text-base">
              Add New Address
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            contentContainerStyle={{ paddingBottom: 20 }}
            data={addresses}
            keyExtractor={(item) => item.id}
            renderItem={renderAddressItem}
          />
          <TouchableOpacity
            className="bg-blue-600 py-3 px-5 rounded-lg self-center shadow-sm mt-4"
            onPress={() => router.push('/profile/addresses/add')}
          >
            <Text className="text-white font-semibold text-base">
              Add New Address
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
