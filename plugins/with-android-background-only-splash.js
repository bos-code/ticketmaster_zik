const fs = require("fs");
const path = require("path");

const { withFinalizedMod } = require("expo/config-plugins");

function withAndroidBackgroundOnlySplash(config) {
  return withFinalizedMod(config, [
    "android",
    async (config) => {
      const stylesPath = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "values",
        "styles.xml",
      );

      if (!fs.existsSync(stylesPath)) {
        return config;
      }

      const styles = fs
        .readFileSync(stylesPath, "utf8")
        .replace(
          /\s*<item name="windowSplashScreenAnimatedIcon">[^<]+<\/item>/g,
          "",
        )
        .replace(
          /\s*<item name="android:windowSplashScreenBehavior">[^<]+<\/item>/g,
          "",
        );

      fs.writeFileSync(stylesPath, styles);

      return config;
    },
  ]);
}

module.exports = withAndroidBackgroundOnlySplash;
