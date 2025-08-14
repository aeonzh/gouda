import { render } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from 'shared/components';

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Parameters<typeof render>[1],
) {
  return render(
    <SafeAreaProvider>
      <AuthProvider>{ui}</AuthProvider>
    </SafeAreaProvider>,
    options,
  );
}
