const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: googleMapsApiKey
      ? {
          ...(config.android?.config ?? {}),
          googleMaps: {
            apiKey: googleMapsApiKey,
          },
        }
      : config.android?.config,
  },
  ios: {
    ...config.ios,
    config: googleMapsApiKey
      ? {
          ...(config.ios?.config ?? {}),
          googleMapsApiKey,
        }
      : config.ios?.config,
  },
});
