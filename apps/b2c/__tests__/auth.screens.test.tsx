import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import LoginScreen from '../app/(auth)/login';
import { renderWithProviders } from '../testing/renderWithProviders';

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

  test('login error handling: shows error message when authentication fails', async () => {
    const errorMessage = 'Invalid credentials';
    jest
      .mocked(require('packages/shared/api/supabase').signInWithEmail)
      .mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(<LoginScreen />);
    const email = await screen.findByPlaceholderText('Email');
    const password = await screen.findByPlaceholderText('Password');
    fireEvent.changeText(email, 'user@example.com');
    fireEvent.changeText(password, 'wrongpassword');

    const button = await screen.findByText('Login');
    fireEvent.press(button);

    await screen.findByText(errorMessage);
  });

  test('login error handling: shows generic error when network error occurs', async () => {
    const errorMessage = 'Network error';
    jest
      .mocked(require('packages/shared/api/supabase').signInWithEmail)
      .mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(<LoginScreen />);
    const email = await screen.findByPlaceholderText('Email');
    const password = await screen.findByPlaceholderText('Password');
    fireEvent.changeText(email, 'user@example.com');
    fireEvent.changeText(password, 'secret');

    const button = await screen.findByText('Login');
    fireEvent.press(button);

    await screen.findByText('Something went wrong');
  });

  test('login validation: shows validation error for empty email', async () => {
    renderWithProviders(<LoginScreen />);
    const email = await screen.findByPlaceholderText('Email');
    const password = await screen.findByPlaceholderText('Password');
    fireEvent.changeText(email, '');
    fireEvent.changeText(password, 'secret');

    const button = await screen.findByText('Login');
    fireEvent.press(button);

    await screen.findByText('Email is required');
  });

  test('login validation: shows validation error for invalid email format', async () => {
    renderWithProviders(<LoginScreen />);
    const email = await screen.findByPlaceholderText('Email');
    const password = await screen.findByPlaceholderText('Password');
    fireEvent.changeText(email, 'invalid-email');
    fireEvent.changeText(password, 'secret');

    const button = await screen.findByText('Login');
    fireEvent.press(button);

    await screen.findByText('Please enter a valid email address');
  });

  test('login validation: shows validation error for empty password', async () => {
    renderWithProviders(<LoginScreen />);
    const email = await screen.findByPlaceholderText('Email');
    const password = await screen.findByPlaceholderText('Password');
    fireEvent.changeText(email, 'user@example.com');
    fireEvent.changeText(password, '');

    const button = await screen.findByText('Login');
    fireEvent.press(button);

    await screen.findByText('Password is required');
  });

  test('login validation: shows validation error for short password', async () => {
    renderWithProviders(<LoginScreen />);
    const email = await screen.findByPlaceholderText('Email');
    const password = await screen.findByPlaceholderText('Password');
    fireEvent.changeText(email, 'user@example.com');
    fireEvent.changeText(password, '123');

    const button = await screen.findByText('Login');
    fireEvent.press(button);

    await screen.findByText('Password must be at least 6 characters');
  });
});
