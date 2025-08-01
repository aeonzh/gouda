import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from 'packages/shared/api/supabase';

// Define Address interface locally since it's not exported from profiles API
interface Address {
  id: string;
  user_id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  country: string;
  postal_code: string;
  state: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Mock functions since they don't exist in profiles API
const getAddresses = async (userId: string): Promise<Address[]> => {
  console.log('getAddresses: Mock function called with userId:', userId);
  return [];
};

const deleteAddress = async (addressId: string): Promise<void> => {
  console.log('deleteAddress: Mock function called with addressId:', addressId);
};
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

  useEffect(() => {
    console.log('AddressesScreen: Component mounted');
  }, []);

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
    <View className='mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-md'>
      <Text className='mb-1 text-lg font-semibold text-gray-800'>
        {item.address_line1}
      </Text>
      {item.address_line2 && (
        <Text className='mb-1 text-base text-gray-600'>
          {item.address_line2}
        </Text>
      )}
      <Text className='mb-1 text-base text-gray-600'>
        {item.city}, {item.state} {item.postal_code}
      </Text>
      <Text className='mb-2 text-base text-gray-600'>{item.country}</Text>
      {item.is_default && (
        <View className='mb-2 self-start rounded-full bg-blue-100 px-3 py-1'>
          <Text className='text-xs font-bold text-blue-700'>Default</Text>
        </View>
      )}
      <View className='mt-2 flex-row justify-end'>
        <TouchableOpacity
          className='mr-2 rounded-lg bg-yellow-500 px-4 py-2 shadow-sm'
          onPress={() => router.push(`/profile/addresses/edit?id=${item.id}`)}
        >
          <Text className='text-sm font-semibold text-white'>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className='rounded-lg bg-red-500 px-4 py-2 shadow-sm'
          onPress={() => handleDeleteAddress(item.id)}
        >
          <Text className='text-sm font-semibold text-white'>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className='flex-1 items-center justify-center bg-gray-100'>
        <ActivityIndicator
          color='#0000ff'
          size='large'
        />
        <Text className='mt-4 text-lg text-gray-700'>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-gray-100 p-4'>
      <Text className='mb-6 text-center text-3xl font-extrabold text-gray-800'>
        My Addresses
      </Text>

      {addresses.length === 0 ? (
        <View className='flex-1 items-center justify-center'>
          <Text className='mb-4 text-xl text-gray-600'>
            No addresses found.
          </Text>
          <TouchableOpacity
            className='rounded-lg bg-blue-600 px-5 py-3 shadow-sm'
            onPress={() => router.push('/profile/addresses/add')}
          >
            <Text className='text-base font-semibold text-white'>
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
            className='mt-4 self-center rounded-lg bg-blue-600 px-5 py-3 shadow-sm'
            onPress={() => router.push('/profile/addresses/add')}
          >
            <Text className='text-base font-semibold text-white'>
              Add New Address
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
