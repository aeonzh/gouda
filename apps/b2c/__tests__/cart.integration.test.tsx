import { fireEvent, screen } from '@testing-library/react-native';
import React from 'react';

import CartScreen from '../app/cart';
import { renderWithProviders } from '../testing/renderWithProviders';

const API = 'https://msw.test';

describe('Cart flow integration', () => {
  test('add/update/remove reflect in UI', async () => {
    renderWithProviders(<CartScreen />);

    // Initial state from supabase mock: 1 item, quantity 2, total $10
    await screen.findByText('Prod A');
    await screen.findByText('Total: $10.00');

    // Update quantity via UI (press +)
    const increment = await screen.findByText('+');
    fireEvent.press(increment);

    // After increment, quantity becomes 3 -> total $15
    await screen.findByText('Total: $15.00');

    // Remove item
    const remove = await screen.findByText('Remove');
    fireEvent.press(remove);

    await screen.findByText('Your cart is empty.');
  });
});
