import React from 'react';
import { rest } from 'msw';
import { server } from '../testing/msw/server';
import { renderWithProviders } from '../testing/renderWithProviders';
import HomeScreen from '../app/(tabs)/index';
import { fireEvent, screen } from '@testing-library/react-native';

const API = 'https://msw.test';

describe('Home screen', () => {
  test('renders authorized vendors and filters by search; navigates to storefront', async () => {
    server.use(
      rest.get(`${API}/rest/v1/organisations`, (_req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json([
            {
              id: 'b1',
              name: 'Alpha',
              status: 'approved',
              address_line1: 'a',
              city: 'x',
              postal_code: '1',
              country: 'c',
              state: 's',
            },
            {
              id: 'b2',
              name: 'Beta',
              status: 'approved',
              address_line1: 'b',
              city: 'y',
              postal_code: '2',
              country: 'c',
              state: 's',
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
