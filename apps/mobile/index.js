// Standalone entry point, bypassing expo/AppEntry.js: its relative import
// (`../../App`) is resolved against the physical realpath of the symlinked
// `expo` package inside pnpm's content-addressed store, not this app's
// directory — breaking under a pnpm workspace. `./App` here is a plain
// same-directory import with no symlink involved.
import registerRootComponent from "expo/src/launch/registerRootComponent";

import App from "./App";

registerRootComponent(App);
