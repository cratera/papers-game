module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@assets': './assets',
            '@components': './components',
            '@constants': './constants',
            '@screens': './screens',
            '@store': './store',
            '@theme': './constants/theme',
          },
        },
      ],
    ],
  };
};
