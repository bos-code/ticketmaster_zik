const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;
const firebaseModules = new Set([
  "firebase/app",
  "firebase/firestore",
  "firebase/storage",
]);

// SVG Support
// Added react-native-svg-transformer to support .svg files as components
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  resolverMainFields: ["react-native", "browser", "module", "main"],
  sourceExts: [...resolver.sourceExts, "svg"],
  unstable_enablePackageExports: true,
  resolveRequest: (context, moduleName, platform) => {
    if (firebaseModules.has(moduleName)) {
      return {
        type: "sourceFile",
        filePath: require.resolve(moduleName),
      };
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativewind(config);
