import {
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';
import { http } from 'msw';
import React from 'react';

import OrdersScreen from '../app/(tabs)/orders';
import { server } from '../testing/msw/server';
import { renderWithProviders } from '../testing/renderWithProviders';

const API = 'https://msw.test';

describe('Orders screen', () => {
  test('shows order list with totals and status', async () => {
    server.use(
      http.get(`${API}/rest/v1/orders`, (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json([
            {
              created_at: new Date().toISOString(),
              id: 'o1',
              status: 'pending',
              total_amount: 10,
            },
          ]),
        ),
      ),
    );

    renderWithProviders(<OrdersScreen />);
    await waitForElementToBeRemoved(() =>
      screen.queryByText('Loading orders...'),
    );
    await screen.findByText(/Order #o1/);
    await screen.findByText(/Total: \$10.00/);
  });
});
