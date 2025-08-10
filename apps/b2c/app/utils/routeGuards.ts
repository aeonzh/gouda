export function isAuthRoute(segments: string[]): boolean {
  if (!segments || segments.length === 0) return false;
  return segments[0] === '(auth)';
}

export function isAllowedAuthedRoute(segments: string[]): boolean {
  if (!segments || segments.length === 0) return false;
  const root = segments[0];

  // Allowed top-level groups for authenticated users
  const allowedRoots = new Set<
    '(tabs)' | 'storefront' | 'orders' | 'profile' | 'cart' | 'order-confirmation' | 'products'
  >(['(tabs)', 'storefront', 'orders', 'profile', 'cart', 'order-confirmation', 'products']);

  if (!allowedRoots.has(root)) return false;

  // products detail must be [id]
  if (root === 'products') {
    return segments[1] === '[id]';
  }

  // Other allowed roots are fine regardless of deeper segments
  return true;
}


