import { Image, Text, TouchableOpacity, View } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StoreType } from '@/types';

export default function Store({ store }: { store: StoreType }) {
    const router = useRouter();

    return (
        <TouchableOpacity
            className="flex-row bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
            onPress={() => {
                router.push(`/stores/${store.id}`);
            }}
        >
            <Image source={{ uri: store.image }} className="w-20 h-20" />
            <View className="flex-1 p-3 justify-between">
                <Text className="text-base font-bold text-gray-800 mb-1">
                    {store.name}
                </Text>
                <View className="flex-row items-center mb-2">
                    <View className="flex-row items-center mr-3">
                        <Star size={16} color="#FFD700" fill="#FFD700" />
                        <Text className="text-sm text-gray-600 ml-1">{store.rating}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <MapPin size={16} color="#666" />
                        <Text className="text-sm text-gray-600 ml-1">{store.location}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
