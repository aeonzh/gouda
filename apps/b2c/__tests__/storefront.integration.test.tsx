import { screen } from '@testing-library/react-native';
import { http } from 'msw';
import React from 'react';

import StorefrontPage from '../app/storefront/[id]';
import { server } from '../testing/msw/server';
import { renderWithProviders } from '../testing/renderWithProviders';

const API = 'https://msw.test';

describe('Storefront visibility', () => {
  test('shows only published products', async () => {
    server.use(
      http.get(`${API}/rest/v1/products`, (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json([
            {
              id: 'p1',
              name: 'Published',
              price: 1,
              status: 'published',
              stock_quantity: 0,
            },
            {
              id: 'p2',
              name: 'Draft',
              price: 1,
              status: 'draft',
              stock_quantity: 0,
            },
          ]),
        ),
      ),
    );

    renderWithProviders(<StorefrontPage />);
    await screen.findByText('Published');
  });
});
