import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  children?: React.ReactNode; // Add children prop
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onPress: () => void;
  size?: 'default' | 'icon' | 'lg' | 'sm';
  title?: string; // Make title optional
  variant?: 'ghost' | 'outline' | 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  disabled = false,
  isLoading = false,
  onPress,
  size = 'default',
  title,
  variant = 'primary',
}) => {
  const baseClasses = 'flex-row items-center justify-center rounded-md';
  let variantClasses = '';
  let textClasses = 'font-semibold';
  let sizeClasses = '';

  switch (variant) {
    case 'ghost':
      variantClasses = '';
      textClasses += ' text-blue-600';
      break;
    case 'outline':
      variantClasses = 'border border-blue-600';
      textClasses += ' text-blue-600';
      break;
    case 'primary':
      variantClasses = 'bg-blue-600 active:bg-blue-700';
      textClasses += ' text-white';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-200 active:bg-gray-300';
      textClasses += ' text-gray-800';
      break;
  }

  switch (size) {
    case 'default':
      sizeClasses = 'h-10 px-4 py-2';
      textClasses += ' text-base';
      break;
    case 'icon':
      sizeClasses = 'h-10 w-10';
      break;
    case 'lg':
      sizeClasses = 'h-11 px-8';
      textClasses += ' text-lg';
      break;
    case 'sm':
      sizeClasses = 'h-9 px-3';
      textClasses += ' text-sm';
      break;
  }

  return (
    <TouchableOpacity
      accessibilityRole='button'
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className} ${
        disabled || isLoading ? 'opacity-50' : ''
      }`}
      disabled={disabled || isLoading}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : 'gray'} />
      ) : (
        children || <Text className={`${textClasses}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
