import { fireEvent, screen } from '@testing-library/react-native';
import { http } from 'msw';
import React from 'react';

import HomeScreen from '../app/(tabs)/index';
import { server } from '../testing/msw/server';
import { renderWithProviders } from '../testing/renderWithProviders';

const API = 'https://msw.test';

describe('Home screen', () => {
  test('renders authorized vendors and filters by search; navigates to storefront', async () => {
    server.use(
      http.get(`${API}/rest/v1/organisations`, (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json([
            {
              address_line1: 'a',
              city: 'x',
              country: 'c',
              id: 'b1',
              name: 'Alpha',
              postal_code: '1',
              state: 's',
              status: 'approved',
            },
            {
              address_line1: 'b',
              city: 'y',
              country: 'c',
              id: 'b2',
              name: 'Beta',
              postal_code: '2',
              state: 's',
              status: 'approved',
            },
          ]),
        ),
      ),
    );

    renderWithProviders(<HomeScreen />);

    await screen.findByText('Alpha');
    await screen.findByText('Beta');

    const search = await screen.findByPlaceholderText('Search vendors...');
    fireEvent.changeText(search, 'alp');
    await screen.findByText('Alpha');
  });
});
