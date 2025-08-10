import React from 'react';
import { renderWithProviders } from '../testing/renderWithProviders';
import InitialLayout from '../app/_layout';
import { waitFor } from '@testing-library/react-native';

// Utility to set segments and reset router mocks
function setSegments(segments: string[]) {
  const expoRouter = require('expo-router');
  jest.spyOn(expoRouter, 'useSegments').mockReturnValue(segments as any);
  (globalThis.__routerReplaceMock as jest.Mock).mockClear();
}

describe('auth routing deep-link matrix', () => {
  test('unauthenticated: any protected route redirects to (auth)/login', async () => {
    const supabase = require('packages/shared/api/supabase');
    // Force unauth session for all iterations
    supabase
      .getSupabase()
      .auth.getSession.mockImplementation(() =>
        Promise.resolve({ data: { session: null } }),
      );

    const protectedRoots: Array<string[] | [string, string]> = [
      ['(tabs)'],
      ['storefront'],
      ['orders'],
      ['products', '[id]'],
      ['profile'],
      ['cart'],
      ['order-confirmation'],
    ];

    for (const seg of protectedRoots) {
      setSegments(seg as any);
      renderWithProviders(<InitialLayout />);
      await waitFor(() =>
        expect(globalThis.__routerReplaceMock).toHaveBeenCalled(),
      );
      expect(
        (globalThis.__routerReplaceMock as jest.Mock).mock.calls.some(
          (c) => c[0] === '/(auth)/login',
        ),
      ).toBe(true);
    }
  });

  test('authenticated: (auth) redirects to (tabs); allowed routes do not redirect', async () => {
    // Ensure authed session for this test
    const supabase = require('packages/shared/api/supabase');
    supabase
      .getSupabase()
      .auth.getSession.mockImplementation(() =>
        Promise.resolve({ data: { session: { user: { id: 'test-user' } } } }),
      );
    // (auth) → (tabs)
    setSegments(['(auth)']);
    renderWithProviders(<InitialLayout />);
    await waitFor(() =>
      expect(globalThis.__routerReplaceMock).toHaveBeenCalled(),
    );
    expect(
      (globalThis.__routerReplaceMock as jest.Mock).mock.calls.some(
        (c) => c[0] === '/(tabs)',
      ),
    ).toBe(true);

    // allowed routes → no redirect
    const allowed: Array<string[] | [string, string]> = [
      ['(tabs)'],
      ['storefront'],
      ['orders'],
      ['products', '[id]'],
      ['profile'],
      ['cart'],
      ['order-confirmation'],
    ];

    for (const seg of allowed) {
      setSegments(seg as any);
      renderWithProviders(<InitialLayout />);
      // give time for effect; ensure no replace happened
      await waitFor(() => true);
      expect(globalThis.__routerReplaceMock).not.toHaveBeenCalled();
    }
  });
});
