import { isAllowedAuthedRoute, isAuthRoute } from '../app/utils/routeGuards';

describe('routeGuards', () => {
  test('isAuthRoute', () => {
    expect(isAuthRoute(['(auth)'])).toBe(true);
    expect(isAuthRoute(['(tabs)'])).toBe(false);
    expect(isAuthRoute([] as any)).toBe(false);
  });

  test('isAllowedAuthedRoute', () => {
    expect(isAllowedAuthedRoute(['(tabs)'])).toBe(true);
    expect(isAllowedAuthedRoute(['storefront', '[id]'])).toBe(true);
    expect(isAllowedAuthedRoute(['orders'])).toBe(true);
    expect(isAllowedAuthedRoute(['profile'])).toBe(true);
    expect(isAllowedAuthedRoute(['cart'])).toBe(true);
    expect(isAllowedAuthedRoute(['order-confirmation'])).toBe(true);
    expect(isAllowedAuthedRoute(['products', '[id]'])).toBe(true);
    expect(isAllowedAuthedRoute(['products'])).toBe(false);
    expect(isAllowedAuthedRoute(['unknown'])).toBe(false);
  });
});


