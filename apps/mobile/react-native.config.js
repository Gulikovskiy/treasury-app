// Works around an upstream bug in expo@52.0.49: its android/build.gradle
// declares `namespace "expo.core"`, but its actual ExpoModulesPackage class
// lives in package `expo.modules`. React Native's autolinking infers the
// import path from the Gradle namespace, so it generates
// `import expo.core.ExpoModulesPackage;`, which doesn't exist and fails the
// build. This override tells autolinking the correct, real import path.
module.exports = {
  dependencies: {
    expo: {
      platforms: {
        android: {
          packageImportPath: "import expo.modules.ExpoModulesPackage;",
          packageInstance: "new ExpoModulesPackage()",
        },
      },
    },
  },
};
