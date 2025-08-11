import '@testing-library/jest-native/extend-expect';

// Mock supabase client to avoid importing ESM deps in tests
jest.mock('packages/shared/api/supabase', () => {
  // In-memory dataset for targeted tests
  const db = {
    members: [
      { id: 'm1', profile_id: 'test-user', business_id: 'b1', role_in_business: 'customer' },
      { id: 'm2', profile_id: 'test-user', business_id: 'b2', role_in_business: 'customer' },
    ],
    organisations: [
      { id: 'b1', name: 'Alpha', status: 'approved', address_line1: 'a', city: 'x', postal_code: '1', country: 'c', state: 's', description: '', image_url: undefined },
      { id: 'b2', name: 'Beta', status: 'approved', address_line1: 'b', city: 'y', postal_code: '2', country: 'c', state: 's', description: '', image_url: undefined },
    ],
    carts: [
      { id: 'c1', user_id: 'test-user', business_id: 'b1', created_at: '', updated_at: '' },
    ],
    products: [
      { id: 'p1', business_id: 'b1', category_id: null, name: 'Prod A', description: '', image_url: undefined, price: 5, stock_quantity: 10, status: 'published' },
      { id: 'p2', business_id: 'b1', category_id: null, name: 'Published', description: '', image_url: undefined, price: 1, stock_quantity: 10, status: 'published' },
    ],
    categories: [
      { id: 'c1', name: 'Cat', business_id: 'b1' },
    ],
    cart_items: [
      { id: 'ci1', cart_id: 'c1', product_id: 'p1', quantity: 2, price_at_time_of_add: 5, created_at: '', updated_at: '' },
    ],
    orders: [
      { id: 'o1', user_id: 'test-user', order_date: new Date().toISOString(), status: 'pending', total_amount: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ],
  };

  const authListeners = new Set();
  const mockAuth = {
    getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user' } } } })),
    getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'test-user' } } })),
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
      })
    );
  };

  const makeBuilder = (table) => {
    const state = { table, filters: [], orderBy: null, op: 'select', payload: null };
    const thenable = {
      select() { return this; },
      eq(key, value) { state.filters.push({ type: 'eq', key, value }); return this; },
      in(key, values) { state.filters.push({ type: 'in', key, values }); return this; },
      order(col, _opts) { state.orderBy = col; return this; },
      range(_s, _e) { return this; },
      single() { return this.then((r) => ({ data: Array.isArray(r.data) ? r.data[0] || null : r.data, error: null })); },
      upsert(payload) { state.op = 'upsert'; state.payload = payload; return this; },
      insert(payload) { state.op = 'insert'; state.payload = payload; return this; },
      update(payload) { state.op = 'update'; state.payload = payload; return this; },
      delete() { state.op = 'delete'; return this; },
      then(resolve) {
        let rows = db[state.table] ? [...db[state.table]] : [];
        rows = applyFilters(rows, state.filters);

        if (state.op === 'upsert') {
          if (state.table === 'carts') {
            const existing = rows.find((r) => r.user_id === state.payload.user_id && r.business_id === state.payload.business_id);
            if (existing) {
              return resolve({ data: existing, error: null });
            }
            const newRow = { id: 'c' + (db.carts.length + 1), created_at: '', updated_at: '', ...state.payload };
            db.carts.push(newRow);
            return resolve({ data: newRow, error: null });
          }
        }

        if (state.op === 'insert') {
          const arr = db[state.table];
          const payload = Array.isArray(state.payload) ? state.payload[0] : state.payload;
          const id = payload.id || `${state.table.slice(0,2)}_${(arr?.length || 0) + 1}`;
          const newRow = { id, ...payload };
          if (arr) arr.push(newRow);
          return resolve({ data: newRow, error: null });
        }

        if (state.op === 'update') {
          const arr = db[state.table] || [];
          // Only support eq('id', ...) updates for tests
          const idFilter = state.filters.find((f) => f.type === 'eq' && f.key === 'id');
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
          const idFilter = state.filters.find((f) => f.type === 'eq' && f.key === 'id');
          const cartIdFilter = state.filters.find((f) => f.type === 'eq' && f.key === 'cart_id');
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
          const bizJoin = state.filters.find((f) => f.key === 'carts.business_id');
          let filtered = rows;
          if (userJoin && bizJoin) {
            const cart = (db.carts || []).find(
              (c) => c.user_id === userJoin.value && c.business_id === bizJoin.value,
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
    };
    return thenable;
  };

  const supabase = {
    auth: mockAuth,
    from: (table) => makeBuilder(table),
    rpc: (fn, params) => {
      if (fn === 'create_order_from_cart') {
        const order = {
          id: 'o_rpc_1',
          user_id: params.user_id,
          business_id: params.business_id,
          total_amount: 10,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
    useRouter: () => ({
      push: routerPushMock,
      replace: routerReplaceMock,
      back: routerBackMock,
    }),
    useSegments: () => ['(tabs)'],
    useLocalSearchParams: jest.fn(() => ({ id: 'b1', businessId: 'b1' })),
    useGlobalSearchParams: jest.fn(() => ({})),
    Stack: StackComp,
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
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
}));

// Ensure Alert.alert is a no-op to avoid crashes in tests
// Lightweight Alert mock (avoid mocking whole react-native)
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Ensure react-native export exposes Alert.alert
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
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
      navigate: jest.fn(),
      dispatch: jest.fn(),
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
  const http = actual.http || {};
  const compatRest = actual.rest || {
    get: http.get,
    post: http.post,
    put: http.put,
    patch: http.patch,
    delete: http.delete,
    options: http.options,
    head: http.head,
  };
  return { ...actual, rest: compatRest };
});

// MSW server setup (CommonJS-safe)
const { server } = require('./testing/msw/server');
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { rest } = require('msw');
  // Expose for tests that reference msw.rest
  globalThis.msw = { rest };
} catch {}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Lightweight native/expo mocks
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: { supabaseUrl: 'https://msw.test', supabaseAnonKey: 'test_anon' } },
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