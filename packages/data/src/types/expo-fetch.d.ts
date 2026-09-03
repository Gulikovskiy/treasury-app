/**
 * Ambient type declaration for `expo/fetch` (FR-003; research.md §5, ADR 0002).
 * `expo` is an optional peer dependency of this package — only apps that
 * actually bundle through Metro (apps/mobile) need it installed; this
 * declaration lets typecheck/tests resolve the import everywhere else
 * without pulling in the real (large, native-oriented) `expo` package.
 */
declare module "expo/fetch" {
  export function fetch(input: RequestInfo | string, init?: RequestInit): Promise<Response>;
}
