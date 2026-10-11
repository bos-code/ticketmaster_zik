const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;
const rewriteExpoRequestUrl = config.server?.rewriteRequestUrl;

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
    // Metro runs web modules as script factories. Zustand's ESM middleware
    // contains import.meta, which fails to parse inside a development factory.
    // Use its equivalent CommonJS entry for this dependency on web.
    if (moduleName === "zustand/middleware" && platform === "web") {
      return {
        type: "sourceFile",
        filePath: require.resolve("zustand/middleware"),
      };
    }

    if (moduleName === "i18n-iso-countries" && platform === "web") {
      return {
        type: "sourceFile",
        filePath: require.resolve("i18n-iso-countries/index"),
      };
    }

    if (moduleName === "react-easy-crop" && platform === "web") {
      return {
        type: "sourceFile",
        filePath: require.resolve("react-easy-crop"),
      };
    }

    if (moduleName === "expo-router/head" && platform !== "web") {
      return {
        type: "sourceFile",
        filePath: require.resolve("./src/lib/native-head.tsx"),
      };
    }

    if (moduleName === "punycode") {
      return {
        type: "sourceFile",
        filePath: require.resolve("punycode/punycode.js"),
      };
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    const rewritten = rewriteExpoRequestUrl ? rewriteExpoRequestUrl(url) : url;

    return rewritten
      .replace(/\.%252Fassets%252Ftabicon/gi, "assets%2Ftabicon")
      .replace(/\.%2Fassets%2Ftabicon/gi, "assets%2Ftabicon");
  },
};

module.exports = withNativewind(config);
