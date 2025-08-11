import React from 'react';
import { renderWithProviders } from '../testing/renderWithProviders';
import InitialLayout from '../app/_layout';
import { act, waitFor } from '@testing-library/react-native';

describe('auth redirects', () => {
  test('unauthenticated user redirected to (auth)/login', async () => {
    // The jest-setup mocks getSession() to a session by default; override to null for this test
    const supabase = require('packages/shared/api/supabase');
    supabase
      .getSupabase()
      .auth.getSession.mockResolvedValueOnce({ data: { session: null } });

    renderWithProviders(<InitialLayout />);
    await waitFor(() =>
      expect(globalThis.__routerReplaceMock).toHaveBeenCalled(),
    );
    await waitFor(() =>
      expect(
        (globalThis.__routerReplaceMock as jest.Mock).mock.calls.some(
          (c) => c[0] === '/(auth)/login',
        ),
      ).toBe(true),
    );
  });

  test('authenticated user on (auth) redirected to (tabs)', async () => {
    const expoRouter = require('expo-router');
    jest.spyOn(expoRouter, 'useSegments').mockReturnValue(['(auth)']);
    renderWithProviders(<InitialLayout />);
    await waitFor(() =>
      expect(globalThis.__routerReplaceMock).toHaveBeenCalled(),
    );
    await waitFor(() =>
      expect(
        (globalThis.__routerReplaceMock as jest.Mock).mock.calls.some(
          (c) => c[0] === '/(tabs)',
        ),
      ).toBe(true),
    );
  });
});
