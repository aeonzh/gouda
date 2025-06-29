import React from "react";
import { TextInput, View, Text } from "react-native";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  className = "",
  labelClassName = "",
  inputClassName = "",
}) => {
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
        className={`border border-gray-300 rounded-md px-4 py-2 text-base text-gray-800 focus:border-blue-500 ${inputClassName}`}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );
};
