// Jest mock for React Native's error-guard polyfill used in the RN test setup
module.exports = {
  __esModule: true,
  default: function noop() {},
  reportFatalError: function noop() {},
};
