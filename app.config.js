const { expo: baseConfig } = require("./app.json");

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

module.exports = ({ config }) => ({
  ...config,
  ...baseConfig,
  android: {
    ...baseConfig.android,
    config: googleMapsApiKey
      ? {
          ...(baseConfig.android?.config ?? {}),
          googleMaps: {
            apiKey: googleMapsApiKey,
          },
        }
      : baseConfig.android?.config,
  },
  ios: {
    ...baseConfig.ios,
    config: googleMapsApiKey
      ? {
          ...(baseConfig.ios?.config ?? {}),
          googleMapsApiKey,
        }
      : baseConfig.ios?.config,
  },
});
