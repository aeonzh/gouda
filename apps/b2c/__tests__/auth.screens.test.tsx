import React from 'react';
import { renderWithProviders } from '../testing/renderWithProviders';
import LoginScreen from '../app/(auth)/login';
import { fireEvent, screen } from '@testing-library/react-native';

jest.mock('packages/shared/api/supabase', () => ({
  signInWithEmail: jest.fn().mockResolvedValue({}),
}));

// Stub Alert to no-op
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

describe('Auth screens', () => {
  test('login happy path: submits credentials and shows loading state', async () => {
    renderWithProviders(<LoginScreen />);
    const email = await screen.findByPlaceholderText('Email');
    const password = await screen.findByPlaceholderText('Password');
    fireEvent.changeText(email, 'user@example.com');
    fireEvent.changeText(password, 'secret');

    const button = await screen.findByText('Login');
    fireEvent.press(button);

    await screen.findByText('Logging In...');
  });
});
