const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Monorepo (pnpm workspace): watch the whole repo so Metro can see
// @treasury/agent and @treasury/data's source. pnpm's node_modules are
// symlinks into its content-addressed store, which Metro's default resolver
// doesn't follow without unstable_enableSymlinks. Deliberately NOT setting
// nodeModulesPaths/disableHierarchicalLookup: pnpm gives each package its
// own local node_modules scope (e.g. expo's own node_modules/expo-modules-core
// symlink) that normal per-file hierarchical lookup depends on — overriding
// the search paths breaks resolution for those nested packages.
config.watchFolders = [workspaceRoot];
config.resolver.unstable_enableSymlinks = true;
// packages/data uses package.json "exports" subpaths (webFetchAdapter vs.
// nativeFetchAdapter) so apps/web's bundler never has to resolve expo/fetch.
// Metro doesn't honor "exports" by default.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
