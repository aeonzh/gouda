import '@testing-library/jest-native/extend-expect';

// Mock expo-router for navigation testing
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(() => ({})),
  useGlobalSearchParams: jest.fn(() => ({})),
  Stack: {
    Screen: ({ children }) => children,
    Group: ({ children }) => children,
  },
}));

// Mock expo to avoid winter runtime import restrictions
jest.mock('expo', () => ({
  __esModule: true,
  default: {},
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
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

// MSW server setup
import { server } from './testing/msw/server';

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