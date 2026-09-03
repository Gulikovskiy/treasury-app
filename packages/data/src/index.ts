// Platform fetch adapters are deliberately NOT re-exported from this barrel:
// nativeFetchAdapter imports "expo/fetch", which apps/web's bundler cannot
// resolve. Import each adapter from its own subpath instead:
//   "@treasury/data/webFetchAdapter"    (apps/web)
//   "@treasury/data/nativeFetchAdapter" (apps/mobile)
export { useAgentStream } from "./useAgentStream";
export type { AgentStreamFetch, StreamResponse, UseAgentStreamResult } from "./useAgentStream";
export * from "./mockTreasuryData";
