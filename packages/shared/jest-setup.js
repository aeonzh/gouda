import '@testing-library/jest-native/extend-expect';

// Minimal mocks for RN environment when testing shared components
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { extra: {} },
  },
}));
try {
  // Optional in some environments; wrap to avoid resolution errors under pnpm
  // and RN 0.79 directory structure changes
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('react-native/Libraries/Animated/NativeAnimatedHelper');
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch (e) {
  // ignore if not resolvable
}

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
}));
