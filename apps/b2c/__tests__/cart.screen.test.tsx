import {
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';
import { http } from 'msw';
import React from 'react';

import CartScreen from '../app/cart';
import { server } from '../testing/msw/server';
import { renderWithProviders } from '../testing/renderWithProviders';

const API = 'https://msw.test';

describe('Cart screen', () => {
  test('renders cart items and total', async () => {
    server.use(
      http.get(`${API}/rest/v1/cart_items`, (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json([
            {
              cart_id: 'c1',
              id: 'ci1',
              price_at_time_of_add: 5,
              product: {
                id: 'p1',
                name: 'Prod A',
                price: 5,
                stock_quantity: 0,
              },
              product_id: 'p1',
              quantity: 2,
            },
          ]),
        ),
      ),
    );

    renderWithProviders(<CartScreen />);

    // Wait for loading state to disappear before asserting
    await waitForElementToBeRemoved(() =>
      screen.queryByText('Loading cart...'),
    );
    await screen.findByText('Prod A');
    await screen.findByText('Total: $10.00');
  });
});
