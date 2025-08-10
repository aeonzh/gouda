import { Link, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { deleteMember, listMembers, Member } from 'shared/api/members';
import { getBusinessIdForUser } from 'shared/api/profiles';
import { useAuth } from 'shared/components/AuthProvider';

export default function MembersListScreen() {
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (!userId) return;
        const bId = await getBusinessIdForUser(userId);
        setBusinessId(bId);
        if (bId) {
          const data = await listMembers(bId);
          setMembers(data || []);
        }
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          title: 'Members',
          headerRight: () => (
            <Link
              asChild
              href={{ pathname: '/members/manage' as any }}
            >
              <TouchableOpacity className="p-2">
                <Text className="text-blue-600">Add</Text>
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      {(!businessId || members.length === 0) ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-500">No members found.</Text>
          <Link asChild href={{ pathname: '/members/manage' as any }}>
            <TouchableOpacity className="mt-4 p-2 bg-blue-500 rounded">
              <Text className="text-white">Add Member</Text>
            </TouchableOpacity>
          </Link>
        </View>
      ) : (
        <FlatList
          data={members}
          keyExtractor={(m) => `${m.profile_id}-${m.business_id}`}
          renderItem={({ item }) => (
            <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
              <Link
                asChild
                href={{ pathname: '/members/manage' as any, params: { profile_id: item.profile_id, business_id: item.business_id } }}
              >
                <TouchableOpacity className="flex-1 mr-4">
                  <Text className="text-base font-semibold" numberOfLines={1}>
                    {item.profile_id}
                  </Text>
                  <Text className="text-gray-600">Role: {item.role_in_business}</Text>
                </TouchableOpacity>
              </Link>
              <TouchableOpacity
                accessibilityLabel="Delete member"
                className="px-3 py-2 rounded bg-red-100"
                onPress={() => {
                  if (!businessId) return;
                  Alert.alert(
                    'Remove member',
                    'Are you sure you want to remove this member? This action cannot be undone.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await deleteMember(item.profile_id, businessId);
                            const refreshed = await listMembers(businessId);
                            setMembers(refreshed || []);
                          } catch (e: any) {
                            Alert.alert('Error', e.message || 'Failed to remove member');
                          }
                        },
                      },
                    ],
                  );
                }}
              >
                <Text className="text-red-600 font-semibold">Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}


