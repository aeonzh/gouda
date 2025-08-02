import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Button } from './Button';

interface QuantitySelectorProps {
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  maxQuantity: number;
  onQuantityChange: (newQuantity: number) => void;
  quantity: number;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  className = '',
  disabled = false,
  loading = false,
  maxQuantity,
  onQuantityChange,
  quantity,
}) => {
  const [inputValue, setInputValue] = useState(quantity.toString());

  console.log('=== DEBUG: QuantitySelector rendered ===', {
    disabled,
    inputValue,
    loading,
    maxQuantity,
    quantity,
  });

  const handleIncrement = () => {
    console.log('=== DEBUG: handleIncrement called ===', {
      currentQuantity: quantity,
      disabled,
      loading,
      maxQuantity,
    });

    if (loading || disabled) return;
    const newQuantity = Math.min(quantity + 1, maxQuantity);
    console.log('Incrementing to:', newQuantity);
    setInputValue(newQuantity.toString());
    onQuantityChange(newQuantity);
  };

  const handleDecrement = () => {
    console.log('=== DEBUG: handleDecrement called ===', {
      currentQuantity: quantity,
      disabled,
      loading,
    });

    if (loading || disabled) return;
    const newQuantity = Math.max(quantity - 1, 1);
    console.log('Decrementing to:', newQuantity);
    setInputValue(newQuantity.toString());
    onQuantityChange(newQuantity);
  };

  const handleInputChange = (text: string) => {
    console.log('=== DEBUG: handleInputChange called ===', {
      currentQuantity: quantity,
      disabled,
      loading,
      maxQuantity,
      text,
    });

    if (loading || disabled) return;

    // Only allow numbers
    if (/^\d*$/.test(text)) {
      setInputValue(text);

      if (text === '') {
        return;
      }

      const newQuantity = parseInt(text, 10);
      if (!isNaN(newQuantity)) {
        const validatedQuantity = Math.max(
          1,
          Math.min(newQuantity, maxQuantity),
        );
        console.log('Input validated to:', validatedQuantity);
        setInputValue(validatedQuantity.toString());
        onQuantityChange(validatedQuantity);
      }
    }
  };

  return (
    <View className={`flex-row items-center space-x-2 ${className}`}>
      <Button
        className='h-10 w-10 p-0'
        disabled={disabled || quantity <= 1}
        isLoading={loading}
        onPress={handleDecrement}
        size='sm'
        variant='secondary'
      >
        <Text className='text-lg'>-</Text>
      </Button>

      <TextInput
        className='w-16 rounded-lg border border-gray-300 text-center'
        editable={!loading && !disabled}
        keyboardType='numeric'
        onChangeText={handleInputChange}
        style={styles.input}
        value={inputValue}
      />

      <Button
        className='h-10 w-10 p-0'
        disabled={disabled || quantity >= maxQuantity}
        isLoading={loading}
        onPress={handleIncrement}
        size='sm'
        variant='secondary'
      >
        <Text className='text-lg'>+</Text>
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    height: 40,
  },
});
