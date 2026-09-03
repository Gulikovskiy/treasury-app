#!/usr/bin/env bash
set -euo pipefail

# SC-004 / FR-003: native code must never call the global `fetch` for
# streaming — it exposes no readable response.body. `expo/fetch` is always
# imported and invoked as `expoFetch(...)` (see nativeFetchAdapter.ts), so a
# literal `fetch(` call (not preceded by a word character, e.g. "expo") under
# apps/mobile/ or packages/data/src/nativeFetchAdapter.ts is exactly the
# violation this guards against.

cd "$(dirname "$0")/.."

MATCHES=$(grep -rnE '(^|[^a-zA-Z.])fetch\(' \
  --include="*.ts" --include="*.tsx" \
  apps/mobile packages/data/src/nativeFetchAdapter.ts \
  | grep -v 'expoFetch(' \
  || true)

if [ -n "$MATCHES" ]; then
  echo "Found forbidden global fetch() usage in native code (violates FR-003, SC-004):"
  echo "$MATCHES"
  exit 1
fi

echo "OK: no global fetch() usage found in native code."
