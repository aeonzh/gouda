import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { Button } from '../Button'; // Adjust path as needed

describe('Button', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button
        onPress={() => {}}
        title='Test Button'
      />,
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('renders correctly with children', () => {
    const { getByText } = render(
      <Button onPress={() => {}}>Child Button</Button>,
    );
    expect(getByText('Child Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button
        onPress={mockOnPress}
        title='Press Me'
      />,
    );
    fireEvent.press(getByText('Press Me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button
        disabled
        onPress={mockOnPress}
        title='Disabled Button'
      />,
    );
    fireEvent.press(getByText('Disabled Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when isLoading is true', () => {
    const { getByTestId, queryByText } = render(
      <Button
        isLoading
        onPress={() => {}}
        title='Loading Button'
      />,
    );
    expect(getByTestId('activity-indicator')).toBeTruthy();
    expect(queryByText('Loading Button')).toBeNull();
  });

  // Add more tests for different variants, sizes, and disabled states
});
