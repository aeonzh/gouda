import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title?: string; // Make title optional
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode; // Add children prop
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  size = 'default',
  className = '',
}) => {
  const baseClasses = 'flex-row items-center justify-center rounded-md';
  let variantClasses = '';
  let textClasses = 'font-semibold';
  let sizeClasses = '';

  switch (variant) {
    case 'primary':
      variantClasses = 'bg-blue-600 active:bg-blue-700';
      textClasses += ' text-white';
      break;
    case 'secondary':
      variantClasses = 'bg-gray-200 active:bg-gray-300';
      textClasses += ' text-gray-800';
      break;
    case 'outline':
      variantClasses = 'border border-blue-600';
      textClasses += ' text-blue-600';
      break;
    case 'ghost':
      variantClasses = '';
      textClasses += ' text-blue-600';
      break;
  }

  switch (size) {
    case 'default':
      sizeClasses = 'h-10 px-4 py-2';
      textClasses += ' text-base';
      break;
    case 'sm':
      sizeClasses = 'h-9 px-3';
      textClasses += ' text-sm';
      break;
    case 'lg':
      sizeClasses = 'h-11 px-8';
      textClasses += ' text-lg';
      break;
    case 'icon':
      sizeClasses = 'h-10 w-10';
      break;
  }

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className} ${
        disabled || isLoading ? 'opacity-50' : ''
      }`}
      onPress={onPress}
      disabled={disabled || isLoading}
      accessibilityRole="button"
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? 'white' : 'gray'} />
      ) : (
        children || <Text className={`${textClasses}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
