const { expo: baseConfig } = require("./app.json");

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

function isReactNativeMapsPlugin(plugin) {
  return Array.isArray(plugin)
    ? plugin[0] === "react-native-maps"
    : plugin === "react-native-maps";
}

function withReactNativeMapsPlugin(plugins, apiKey) {
  const nextPlugins = [...plugins];

  if (!apiKey) {
    return nextPlugins.filter((plugin) => !isReactNativeMapsPlugin(plugin));
  }

  const pluginEntry = [
    "react-native-maps",
    { androidGoogleMapsApiKey: apiKey },
  ];
  const existingIndex = nextPlugins.findIndex((plugin) =>
    isReactNativeMapsPlugin(plugin),
  );

  if (existingIndex === -1) {
    nextPlugins.push(pluginEntry);
    return nextPlugins;
  }

  const existingPlugin = nextPlugins[existingIndex];
  const existingOptions = Array.isArray(existingPlugin)
    ? (existingPlugin[1] ?? {})
    : {};

  nextPlugins[existingIndex] = [
    "react-native-maps",
    {
      ...existingOptions,
      androidGoogleMapsApiKey: apiKey,
    },
  ];

  return nextPlugins;
}

module.exports = ({ config }) => {
  const nextConfig = {
    ...config,
    ...baseConfig,
    android: {
      ...baseConfig.android,
    },
    plugins: withReactNativeMapsPlugin(
      baseConfig.plugins ?? [],
      googleMapsApiKey,
    ),
  };

  if (nextConfig.android?.config?.googleMaps) {
    const { googleMaps, ...restAndroidConfig } = nextConfig.android.config;

    nextConfig.android.config =
      Object.keys(restAndroidConfig).length > 0 ? restAndroidConfig : undefined;
  }
  return nextConfig;
};
