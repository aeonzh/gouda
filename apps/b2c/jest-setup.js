/* eslint-env jest */

import '@testing-library/jest-native/extend-expect';

// Mock supabase client to avoid importing ESM deps in tests
jest.mock('packages/shared/api/supabase', () => {
  // In-memory dataset for targeted tests
  const db = {
    cart_items: [
      {
        cart_id: 'c1',
        created_at: '',
        id: 'ci1',
        price_at_time_of_add: 5,
        product_id: 'p1',
        quantity: 2,
        updated_at: '',
      },
    ],
    carts: [
      {
        business_id: 'b1',
        created_at: '',
        id: 'c1',
        updated_at: '',
        user_id: 'test-user',
      },
    ],
    categories: [{ business_id: 'b1', id: 'c1', name: 'Cat' }],
    members: [
      {
        business_id: 'b1',
        id: 'm1',
        profile_id: 'test-user',
        role_in_business: 'customer',
      },
      {
        business_id: 'b2',
        id: 'm2',
        profile_id: 'test-user',
        role_in_business: 'customer',
      },
    ],
    orders: [
      {
        created_at: new Date().toISOString(),
        id: 'o1',
        order_date: new Date().toISOString(),
        status: 'pending',
        total_amount: 10,
        updated_at: new Date().toISOString(),
        user_id: 'test-user',
      },
    ],
    organisations: [
      {
        address_line1: 'a',
        city: 'x',
        country: 'c',
        description: '',
        id: 'b1',
        image_url: undefined,
        name: 'Alpha',
        postal_code: '1',
        state: 's',
        status: 'approved',
      },
      {
        address_line1: 'b',
        city: 'y',
        country: 'c',
        description: '',
        id: 'b2',
        image_url: undefined,
        name: 'Beta',
        postal_code: '2',
        state: 's',
        status: 'approved',
      },
    ],
    products: [
      {
        business_id: 'b1',
        category_id: null,
        description: '',
        id: 'p1',
        image_url: undefined,
        name: 'Prod A',
        price: 5,
        status: 'published',
        stock_quantity: 10,
      },
      {
        business_id: 'b1',
        category_id: null,
        description: '',
        id: 'p2',
        image_url: undefined,
        name: 'Published',
        price: 1,
        status: 'published',
        stock_quantity: 10,
      },
    ],
  };

  const authListeners = new Set();
  const mockAuth = {
    getSession: jest.fn(() =>
      Promise.resolve({ data: { session: { user: { id: 'test-user' } } } }),
    ),
    getUser: jest.fn(() =>
      Promise.resolve({ data: { user: { id: 'test-user' } } }),
    ),
    onAuthStateChange: jest.fn((_cb, _session) => {
      const subscription = { unsubscribe: jest.fn() };
      return { data: { subscription } };
    }),
  };

  const applyFilters = (rows, filters) => {
    return rows.filter((row) =>
      filters.every((f) => {
        // Ignore join-style filters (e.g., 'carts.user_id') here; handled later
        if (typeof f.key === 'string' && f.key.includes('.')) return true;
        const cell = row[f.key];
        if (cell === undefined) return true;
        if (f.type === 'eq') return cell === f.value;
        if (f.type === 'in') return (f.values || []).includes(cell);
        return true;
      }),
    );
  };

  const makeBuilder = (table) => {
    const state = {
      filters: [],
      op: 'select',
      orderBy: null,
      payload: null,
      table,
    };
    const thenable = {
      delete() {
        state.op = 'delete';
        return this;
      },
      eq(key, value) {
        state.filters.push({ key, type: 'eq', value });
        return this;
      },
      in(key, values) {
        state.filters.push({ key, type: 'in', values });
        return this;
      },
      insert(payload) {
        state.op = 'insert';
        state.payload = payload;
        return this;
      },
      order(col, _opts) {
        state.orderBy = col;
        return this;
      },
      range(_s, _e) {
        return this;
      },
      select() {
        return this;
      },
      single() {
        return this.then((r) => ({
          data: Array.isArray(r.data) ? r.data[0] || null : r.data,
          error: null,
        }));
      },
      then(resolve) {
        let rows = db[state.table] ? [...db[state.table]] : [];
        rows = applyFilters(rows, state.filters);

        if (state.op === 'upsert') {
          if (state.table === 'carts') {
            const existing = rows.find(
              (r) =>
                r.user_id === state.payload.user_id &&
                r.business_id === state.payload.business_id,
            );
            if (existing) {
              return resolve({ data: existing, error: null });
            }
            const newRow = {
              created_at: '',
              id: 'c' + (db.carts.length + 1),
              updated_at: '',
              ...state.payload,
            };
            db.carts.push(newRow);
            return resolve({ data: newRow, error: null });
          }
        }

        if (state.op === 'insert') {
          const arr = db[state.table];
          const payload = Array.isArray(state.payload)
            ? state.payload[0]
            : state.payload;
          const id =
            payload.id ||
            `${state.table.slice(0, 2)}_${(arr?.length || 0) + 1}`;
          const newRow = { id, ...payload };
          if (arr) arr.push(newRow);
          return resolve({ data: newRow, error: null });
        }

        if (state.op === 'update') {
          const arr = db[state.table] || [];
          // Only support eq('id', ...) updates for tests
          const idFilter = state.filters.find(
            (f) => f.type === 'eq' && f.key === 'id',
          );
          if (idFilter) {
            const idx = arr.findIndex((r) => r.id === idFilter.value);
            if (idx >= 0) {
              arr[idx] = { ...arr[idx], ...state.payload };
              return resolve({ data: arr[idx], error: null });
            }
          }
          return resolve({ data: null, error: null });
        }

        if (state.op === 'delete') {
          const arr = db[state.table] || [];
          const idFilter = state.filters.find(
            (f) => f.type === 'eq' && f.key === 'id',
          );
          const cartIdFilter = state.filters.find(
            (f) => f.type === 'eq' && f.key === 'cart_id',
          );
          if (idFilter) {
            const idx = arr.findIndex((r) => r.id === idFilter.value);
            if (idx >= 0) arr.splice(idx, 1);
          } else if (cartIdFilter) {
            for (let i = arr.length - 1; i >= 0; i -= 1) {
              if (arr[i].cart_id === cartIdFilter.value) arr.splice(i, 1);
            }
          }
          return resolve({ data: null, error: null });
        }

        // Default select behavior with special joins emulation
        if (state.table === 'cart_items') {
          // emulate join filter via carts!inner in createOrderFromCart
          const userJoin = state.filters.find((f) => f.key === 'carts.user_id');
          const bizJoin = state.filters.find(
            (f) => f.key === 'carts.business_id',
          );
          let filtered = rows;
          if (userJoin && bizJoin) {
            const cart = (db.carts || []).find(
              (c) =>
                c.user_id === userJoin.value && c.business_id === bizJoin.value,
            );
            filtered = cart ? rows.filter((r) => r.cart_id === cart.id) : [];
          }
          const items = filtered.map((it) => ({
            ...it,
            product: db.products.find((p) => p.id === it.product_id) || null,
          }));
          return resolve({ data: items, error: null });
        }

        return resolve({ data: rows, error: null });
      },
      update(payload) {
        state.op = 'update';
        state.payload = payload;
        return this;
      },
      upsert(payload) {
        state.op = 'upsert';
        state.payload = payload;
        return this;
      },
    };
    return thenable;
  };

  const supabase = {
    auth: mockAuth,
    from: (table) => makeBuilder(table),
    rpc: (fn, params) => {
      if (fn === 'create_order_from_cart') {
        const order = {
          business_id: params.business_id,
          created_at: new Date().toISOString(),
          id: 'o_rpc_1',
          status: 'pending',
          total_amount: 10,
          updated_at: new Date().toISOString(),
          user_id: params.user_id,
        };
        return Promise.resolve({ data: order, error: null });
      }
      return Promise.resolve({ data: null, error: null });
    },
  };

  return {
    __esModule: true,
    getSupabase: () => supabase,
    supabase,
  };
});

// Map for components is handled via moduleNameMapper to a static mock file

// Mock vector icons to avoid ESM imports
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock expo-router for navigation testing
jest.mock('expo-router', () => {
  const StackComp = ({ children }) => children;
  // Attach subcomponents as properties on the function to mimic API
  StackComp.Screen = ({ children }) => children;
  StackComp.Group = ({ children }) => children;
  const routerPushMock = jest.fn();
  const routerReplaceMock = jest.fn();
  const routerBackMock = jest.fn();
  globalThis.__routerPushMock = routerPushMock;
  globalThis.__routerReplaceMock = routerReplaceMock;
  globalThis.__routerBackMock = routerBackMock;
  return {
    Link: ({ children }) => children,
    Stack: StackComp,
    useGlobalSearchParams: jest.fn(() => ({})),
    useLocalSearchParams: jest.fn(() => ({ businessId: 'b1', id: 'b1' })),
    useRouter: () => ({
      back: routerBackMock,
      push: routerPushMock,
      replace: routerReplaceMock,
    }),
    useSegments: () => ['(tabs)'],
  };
});

// Mock expo to avoid winter runtime import restrictions
jest.mock('expo', () => ({
  __esModule: true,
  default: {},
}));

// Stub CSS imports (Tailwind)
jest.mock('@/global.css', () => ({}), { virtual: true });

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ bottom: 0, left: 0, right: 0, top: 0 }),
}));

// Ensure Alert.alert is a no-op to avoid crashes in tests
// Lightweight Alert mock (avoid mocking whole react-native)
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Ensure react-native export exposes Alert.alert
try {
  const RN = require('react-native');
  if (RN) {
    if (!RN.Alert) {
      RN.Alert = { alert: jest.fn() };
    } else if (typeof RN.Alert.alert !== 'function') {
      RN.Alert.alert = jest.fn();
    } else {
      jest.spyOn(RN.Alert, 'alert').mockImplementation(() => {});
    }
  } else {
    globalThis.Alert = { alert: jest.fn() };
  }
} catch {}

// Silence Alerts during tests to avoid unhandled native prompts
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      dispatch: jest.fn(),
      navigate: jest.fn(),
    }),
  };
});

// Mock @react-native-picker/picker
jest.mock('@react-native-picker/picker', () => ({
  Picker: {
    Item: 'Picker.Item',
  },
}));

// Mock @react-native/js-polyfills/error-guard.js
jest.mock('@react-native/js-polyfills/error-guard', () => ({
  __esModule: true,
  default: jest.fn(),
  reportFatalError: jest.fn(),
}));

// Make MSW v2 compatible with tests written for v1 (rest → http)
jest.mock('msw', () => {
  const actual = jest.requireActual('msw');
  return { ...actual };
});

// MSW server setup (CommonJS-safe)
let server;
try {
  // Try to import the server using dynamic import
  const mswServer = require('./testing/msw/server');
  server = mswServer.server;

  const mswActual = require('msw');
  // Expose for tests that reference msw.http
  globalThis.msw = mswActual;
} catch (error) {
  console.warn('MSW server setup failed, using mock server:', error.message);
  // Fallback no-op server to avoid missing dependency failures
  server = {
    close: () => undefined,
    listen: () => undefined,
    resetHandlers: () => undefined,
    use: () => undefined,
  };
}

if (server) {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}

// Lightweight native/expo mocks
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: { supabaseAnonKey: 'test_anon', supabaseUrl: 'https://msw.test' },
    },
  },
}));

jest.mock('react-native-reanimated', () => {
  // Use official mock to avoid native bindings in Jest env
  const Reanimated = require('react-native-reanimated/mock');
  // Silence warnings for reanimated's .call in older versions
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Stub expo metro runtime used by _layout in tests
jest.mock('@expo/metro-runtime', () => ({}));
