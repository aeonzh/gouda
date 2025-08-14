import React from 'react';

import Home from '../app/(tabs)/index';
import InitialLayout from '../app/_layout';
import { renderWithProviders } from '../testing/renderWithProviders';

describe('B2C smoke', () => {
  it('renders Home screen without crashing', () => {
    const { getByPlaceholderText } = renderWithProviders(<Home />);
    expect(getByPlaceholderText('Search vendors...')).toBeTruthy();
  });

  it('renders InitialLayout loading UI without crashing', () => {
    const { getByText } = renderWithProviders(<InitialLayout />);
    expect(getByText('Loading app...')).toBeTruthy();
  });
});
