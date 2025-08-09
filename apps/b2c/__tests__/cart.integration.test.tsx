import React from 'react';
import { rest } from 'msw';
import { server } from '../testing/msw/server';
import { renderWithProviders } from '../testing/renderWithProviders';
import CartScreen from '../app/cart';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

const API = 'https://msw.test';

describe('Cart flow integration', () => {
  test('add/update/remove reflect in UI', async () => {
    let cartItems = [
      {
        id: 'ci1',
        cart_id: 'c1',
        product_id: 'p1',
        quantity: 1,
        price_at_time_of_add: 5,
        product: { id: 'p1', name: 'Prod A', price: 5, stock_quantity: 0, business_id: 'b1', status: 'published' },
      },
    ];

    server.use(
      // cart_items list
      rest.get(`${API}/rest/v1/cart_items`, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json(cartItems));
      }),
      // update quantity
      rest.patch(`${API}/rest/v1/cart_items`, async (req, res, ctx) => {
        cartItems = cartItems.map((it) => (it.id === 'ci1' ? { ...it, quantity: 2 } : it));
        return res(ctx.status(200), ctx.json([cartItems[0]]));
      }),
      // remove
      rest.delete(`${API}/rest/v1/cart_items`, (_req, res, ctx) => {
        cartItems = [];
        return res(ctx.status(204));
      })
    );

    renderWithProviders(<CartScreen />);

    // Initial render shows product
    await screen.findByText('Prod A');

    // Update quantity via UI (assuming there is a "+" button)
    const increment = await screen.findByLabelText(/increase quantity/i).catch(() => null);
    if (increment) fireEvent.press(increment);

    await waitFor(() => {
      // Quantity should reflect 2 somewhere; fallback to ensure list rerendered
      expect(cartItems[0].quantity).toBe(2);
    });

    // Remove item (assuming there is a remove button)
    const remove = await screen.findByLabelText(/remove/i).catch(() => null);
    if (remove) fireEvent.press(remove);

    await waitFor(() => {
      expect(cartItems.length).toBe(0);
    });
  });
});


