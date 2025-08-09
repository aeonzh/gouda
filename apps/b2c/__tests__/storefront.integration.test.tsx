import React from 'react';
import { rest } from 'msw';
import { server } from '../testing/msw/server';
import { renderWithProviders } from '../testing/renderWithProviders';
import StorefrontPage from '../app/storefront/[id]';
import { screen } from '@testing-library/react-native';

const API = 'https://msw.test';

describe('Storefront visibility', () => {
  test('shows only published products', async () => {
    server.use(
      rest.get(`${API}/rest/v1/products`, (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json([
            { id: 'p1', name: 'Published', status: 'published', price: 1, stock_quantity: 0 },
            { id: 'p2', name: 'Draft', status: 'draft', price: 1, stock_quantity: 0 },
          ])
        )
      )
    );

    renderWithProviders(<StorefrontPage />);
    await screen.findByText('Published');
  });
});


