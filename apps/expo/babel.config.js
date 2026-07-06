// https://docs.expo.dev/guides/using-babel/
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
