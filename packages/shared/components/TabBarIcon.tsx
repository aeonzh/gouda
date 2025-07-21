import { Ionicons } from '@expo/vector-icons';
import { StyleProp, ViewStyle } from 'react-native';

interface TabBarIconProps {
  color: string;
  name: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export function TabBarIcon(props: TabBarIconProps) {
  return (
    <Ionicons
      size={28}
      style={[{ marginBottom: -3 }, props.style]}
      {...props}
    />
  );
}
