import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addMember, getMember, updateMemberRole } from 'shared/api/members';
import { getBusinessIdForUser } from 'shared/api/profiles';
import { Input } from 'shared/components/Input';
import { Button } from 'shared/components/Button';
import { useAuth } from 'shared/components/AuthProvider';

const ROLES = ['owner', 'sales_agent', 'customer'] as const;

export default function ManageMemberScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ profile_id?: string; business_id?: string }>();
  const isEditing = !!(params.profile_id && params.business_id);
  const { session } = useAuth();

  const [businessId, setBusinessId] = useState<string | null>(params.business_id ?? null);
  const [profileId, setProfileId] = useState<string>(params.profile_id ?? '');
  const [role, setRole] = useState<typeof ROLES[number]>('customer');
  const [loading, setLoading] = useState<boolean>(isEditing);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (!businessId && session?.user?.id) {
          const bId = await getBusinessIdForUser(session.user.id);
          setBusinessId(bId);
        }
        if (isEditing && params.profile_id && (businessId || params.business_id)) {
          setLoading(true);
          const data = await getMember(params.profile_id, (businessId || params.business_id)!);
          if (data) {
            setRole(data.role_in_business as typeof ROLES[number]);
          }
        }
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to load member');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  const handleSubmit = async () => {
    try {
      if (!businessId) {
        Alert.alert('Validation Error', 'Missing business context');
        return;
      }
      if (!isEditing) {
        if (!profileId || !/^\b[0-9a-fA-F-]{36}\b$/.test(profileId)) {
          Alert.alert('Validation Error', 'Provide a valid UUID for profile_id');
          return;
        }
      }
      setSubmitting(true);
      if (isEditing) {
        await updateMemberRole(params.profile_id!, businessId, role);
        Alert.alert('Success', 'Member updated');
      } else {
        await addMember({ profile_id: profileId, business_id: businessId, role_in_business: role });
        Alert.alert('Success', 'Member added');
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Stack.Screen options={{ title: isEditing ? 'Edit Member' : 'Add Member' }} />
      <ScrollView>
        {!isEditing && (
          <View className="mb-4">
            <Text className="text-base font-medium mb-1">Profile ID (UUID)</Text>
            <Input
              autoCapitalize="none"
              onChangeText={setProfileId}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={profileId}
            />
          </View>
        )}

        <View className="mb-4">
          <Text className="text-base font-medium mb-1">Role</Text>
          <Picker selectedValue={role} onValueChange={(v) => setRole(v)}>
            {ROLES.map((r) => (
              <Picker.Item key={r} label={r} value={r} />
            ))}
          </Picker>
        </View>

        <Button isLoading={submitting} onPress={handleSubmit}>
          <Text className="text-white text-lg font-semibold">
            {isEditing ? 'Save Changes' : 'Add Member'}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
}


