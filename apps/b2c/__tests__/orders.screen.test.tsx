import React from 'react';
import { rest } from 'msw';
import { server } from '../testing/msw/server';
import { renderWithProviders } from '../testing/renderWithProviders';
import OrdersScreen from '../app/(tabs)/orders';
import {
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react-native';

const API = 'https://msw.test';

describe('Orders screen', () => {
  test('shows order list with totals and status', async () => {
    server.use(
      rest.get(`${API}/rest/v1/orders`, (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json([
            {
              id: 'o1',
              total_amount: 10,
              status: 'pending',
              created_at: new Date().toISOString(),
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
