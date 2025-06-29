module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      [
        'nativewind/babel',
        {
          input: './global.css',
          // Add shared package to the input for NativeWind processing
          // This ensures that shared components' classNames are transformed
          // correctly by NativeWind's Babel plugin.
          // The path is relative to the monorepo root.
          // This is a common pattern for monorepo setups with NativeWind.
          allowModule: true, // Allow processing of modules, including shared package
        },
      ],
    ],
  };
};
