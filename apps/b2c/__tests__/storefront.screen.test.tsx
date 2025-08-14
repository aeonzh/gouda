import { screen } from '@testing-library/react-native';
import { http } from 'msw';
import React from 'react';

import StorefrontPage from '../app/storefront/[id]';
import { server } from '../testing/msw/server';
import { renderWithProviders } from '../testing/renderWithProviders';

const API = 'https://msw.test';

describe('Storefront screen', () => {
  test('lists categories and published products for store', async () => {
    server.use(
      http.get(`${API}/rest/v1/organisations`, (_req, res, ctx) =>
        res(ctx.status(200), ctx.json([{ id: 'b1', name: 'Store' }])),
      ),
      http.get(`${API}/rest/v1/categories`, (_req, res, ctx) =>
        res(ctx.status(200), ctx.json([{ id: 'c1', name: 'Cat' }])),
      ),
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
          ]),
        ),
      ),
    );

    renderWithProviders(<StorefrontPage />);
    await screen.findByText('Published');
    await screen.findByText('Cat');
  });
});
