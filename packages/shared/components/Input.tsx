import { Text, TextInput, View } from 'react-native';

interface InputProps {
  autoCapitalize?: 'characters' | 'none' | 'sentences' | 'words';
  className?: string;
  inputClassName?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  label?: string;
  labelClassName?: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  value: string;
}

export const Input = ({
  autoCapitalize = 'sentences', // Default to 'sentences' for general input
  className = '',
  inputClassName = '',
  keyboardType = 'default',
  label,
  labelClassName = '',
  onChangeText,
  placeholder,
  secureTextEntry = false,
  value,
}: InputProps) => {
  return (
    <View className={`w-full ${className}`}>
      {label && (
        <Text
          className={`text-base font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
        </Text>
      )}
      <TextInput
        autoCapitalize={autoCapitalize}
        className={`border border-gray-300 rounded-md px-4 py-2 text-base text-gray-800 focus:border-blue-500 ${inputClassName}`}
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        secureTextEntry={secureTextEntry}
        value={value}
      />
    </View>
  );
};
