import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../Button'; // Adjust path as needed

describe('Button', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(<Button title="Test Button" onPress={() => {}} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('renders correctly with children', () => {
    const { getByText } = render(<Button onPress={() => {}}>Child Button</Button>);
    expect(getByText('Child Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<Button title="Press Me" onPress={mockOnPress} />);
    fireEvent.press(getByText('Press Me'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(<Button title="Disabled Button" onPress={mockOnPress} disabled />);
    fireEvent.press(getByText('Disabled Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows ActivityIndicator when isLoading is true', () => {
    const { getByTestId, queryByText } = render(<Button title="Loading Button" onPress={() => {}} isLoading />);
    expect(getByTestId('activity-indicator')).toBeTruthy();
    expect(queryByText('Loading Button')).toBeNull();
  });

  // Add more tests for different variants, sizes, and disabled states
});