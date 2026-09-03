# Implementation Plan: Agent Transport / SSE Streaming

**Branch**: `001-agent-sse-transport` | **Date**: 2026-09-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-agent-sse-transport/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Prove the streaming transport mechanism for the treasury agent chat: a Next.js route handler
streams a stubbed assistant response as Server-Sent Events; a transport-agnostic parser and
cancellation state machine in `packages/agent` consume it; a shared hook in `packages/data`
injects a web `fetch` adapter or a native `expo/fetch` adapter depending on caller. No monorepo
scaffolding exists yet, so this plan also stands up the minimal pnpm/Turborepo skeleton and the
two app shells needed to exercise the transport end to end.

## Technical Context

**Language/Version**: TypeScript 5.x throughout; Node.js 20 LTS runtime for the Next.js server.

**Primary Dependencies**: Next.js (App Router, hosts both the web UI and the SSE route handler);
Expo + React Native (native shell); pnpm workspaces + Turborepo (monorepo tooling, per
Constitution II); `eventsource-parser` (SSE chunk parsing in `packages/agent`, see
[research.md](research.md) and ADR
[0002](../../docs/adr/0002-sse-transport-on-react-native.md)).

**Storage**: N/A. No package under `packages/db` is touched by this feature — the "server-recorded
partial message" in FR-005 is in-memory for the lifetime of one stream request, not persisted (see
Non-Goals: persisted conversation state belongs to the offline cache/sync slice).

**Testing**: vitest, per the project's mandated test runner — unit tests for the
`packages/agent` parser and state machine, an adapter test per fetch implementation, and a
render-batching test for SC-003. End-to-end verification is manual (see
[quickstart.md](quickstart.md)); Maestro automation is reserved for the release-engineering slice.

**Target Platform**: Web (evergreen browsers) via Next.js; Android (physical device or emulator)
via an Expo development build, per the project's Android-first constraint. iOS is explicitly out
of scope for verification.

**Project Type**: Two-surface monorepo feature (web + mobile) plus the shared packages that back
them.

**Performance Goals**: Token-render UI updates batched on a fixed 50ms flush interval (FR-006,
SC-003). No absolute time-to-first-token threshold is set for this slice (deferred; see spec
Coverage Summary from `/speckit-clarify`).

**Constraints**: Native streaming MUST use `expo/fetch`, never the global `fetch` (FR-003). Only
one Stream Session is active per conversation at a time; no client-facing session ID (per
Clarifications). Cancellation must leave server and client with byte-for-byte identical partial
state (FR-005, SC-002).

**Scale/Scope**: Single authenticated user per session; no concurrent-session or multi-tenant load
in scope for this slice.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Result |
|---|---|---|
| I. TypeScript Only | Next.js server, Expo client, all shared packages are TypeScript; no Python/sidecar | Pass |
| II. Monorepo, Not Microfrontends | Single pnpm+Turborepo monorepo; no Module Federation/Re.Pack; Metro untouched | Pass |
| III. No react-native-web | apps/web and apps/mobile each render their own minimal view directly; no shared rendering package introduced by this feature | Pass |
| IV. Shared Code Stops At The Hook Layer | `packages/data` exposes one hook (`useAgentStream`); no component/screen code is shared | Pass |
| V. Android-First Buildability | Native verification targets Android only (Non-Goal excludes iOS); nothing here touches native config | Pass |
| VI. A Spec Is Only A Spec If It Can Fail | Every FR/SC in spec.md is test- or measurement-backed; Non-Goals and Kill Criteria present | Pass |
| VII. Tests Before Implementation | Enforced at `/speckit-implement` time, not a plan-time gate; noted in Testing above | N/A at plan stage |
| VIII. Typed, Bounded Conventions | No `bigint` financial values touched (stubbed content only); errors are typed results per FR-007; parser/state-machine will carry a fixture-backed test | Pass |
| Package boundaries | `packages/agent` imports nothing above it and stays fetch-agnostic (FR-002); `packages/data` imports `agent` only, not `db`/`core` (neither is needed here) | Pass |

No violations. Complexity Tracking table is not needed.

**Post-Phase 1 re-check**: Phase 1 design (data-model.md, contracts/agent-stream.md) introduced no
new package, no new boundary crossing, and no persistence — the table above still holds unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/001-agent-sse-transport/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
package.json                # workspace root; pnpm workspaces + Turborepo scripts
pnpm-workspace.yaml
turbo.json
tsconfig.base.json

apps/web/                   # Next.js (App Router)
├── app/
│   ├── page.tsx            # minimal chat page (Non-Goal: no UI polish)
│   └── api/agent/stream/route.ts   # SSE route handler, stubbed canned response
└── package.json

apps/mobile/                 # Expo (React Native)
├── App.tsx                 # minimal screen, same prompt/response/cancel flow
└── package.json

packages/agent/             # transport-agnostic parser + cancellation state machine
├── src/
│   ├── parseStream.ts       # wraps eventsource-parser
│   ├── streamSession.ts     # session lifecycle + partial-message accumulation
│   └── types.ts
└── src/__tests__/

packages/data/               # shared data-fetching hook layer (Principle IV)
├── src/
│   ├── useAgentStream.ts     # the one shared hook; fetch impl injected
│   ├── webFetchAdapter.ts    # global fetch + AbortController
│   └── nativeFetchAdapter.ts # expo/fetch + AbortController
└── src/__tests__/
```

**Structure Decision**: Two-surface monorepo per the constitution's package-boundary diagram.
This feature only needs `apps/web`, `apps/mobile`, `packages/agent`, and `packages/data` —
`packages/core`, `packages/db`, `packages/ui-tokens`, `packages/ui-web`, and `packages/ui-native`
are not created here since nothing in this slice needs them (no domain math, no persistence, no
production-styled components). They get scaffolded when the feature that actually needs them is
planned. The backend lives inside `apps/web` as a Next.js route handler rather than a separate
`apps/api` package, since the constitution's package diagram has no such package and apps may
import anything below them.

## Step Plan

<!--
  The order you'll implement this in, and where to look after each step to see it working.
  Keep this table scannable — under ~15 rows. If it doesn't fit, the feature is too big; split it
  into a separate spec instead of letting this section sprawl.
-->

| # | File(s) | Reason | Where to look after | Satisfies |
|---|---------|--------|----------------------|-----------|
| 1 | `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json` | Nothing exists yet; foundational monorepo scaffold | `pnpm install` succeeds at repo root | Constitution II |
| 2 | `packages/agent/src/parseStream.ts` | SSE chunk parsing, transport-agnostic | `pnpm --filter agent test` (fixture SSE payloads incl. split chunks) | FR-001, FR-002, FR-007 |
| 3 | `packages/agent/src/streamSession.ts` | Session lifecycle + partial-message accumulation | Unit tests cover streaming/complete/cancelled/errored transitions | FR-004, FR-005, Key Entities |
| 4 | `packages/data/src/useAgentStream.ts` | Shared hook, fetch impl injected | Hook test with a mocked fetch adapter | FR-002, FR-008 |
| 5 | `packages/data/src/webFetchAdapter.ts` | Web transport (global `fetch` + `AbortController`) | Adapter test against a fake SSE response | FR-001 |
| 6 | `packages/data/src/nativeFetchAdapter.ts` | Native transport (`expo/fetch` + `AbortController`) | Adapter test; SC-004 check confirms no global `fetch` | FR-003 |
| 7 | `apps/web/app/api/agent/stream/route.ts` | Stubbed SSE-emitting route handler | `pnpm dev:web`, submit a prompt, see incremental text | US1, SC-001 |
| 8 | `apps/web/app/page.tsx` | Minimal chat page: submit + cancel | Cancel mid-stream, confirm partial message shown | US2, SC-002 |
| 9 | `packages/data` render-batch wiring | Batch UI updates at the 50ms interval | Render-count assertion test | FR-006, SC-003 |
| 10 | `apps/mobile/App.tsx` | Minimal Expo screen reusing `useAgentStream` | `pnpm dev:mobile` on Android, submit + cancel a prompt | US3, SC-004, SC-005 |
| 11 | `docs/adr/0001-monorepo-not-microfrontends.md`, `docs/adr/0002-sse-transport-on-react-native.md` | Record the two decisions this plan depends on | Files exist and match the decision made in research.md | Governance |

## New Dependencies

| Dependency | Why it's needed | What it replaces |
|------------|------------------|-------------------|
| `eventsource-parser` | Parses `text/event-stream` bytes into events inside `packages/agent`, correctly handling chunk-boundary splits and multi-line `data:` fields (see [research.md](research.md)) | A hand-rolled line-splitting parser, rejected per the user's explicit choice during planning — reimplementing SSE chunk-boundary edge cases is unnecessary risk for a well-tested, dependency-free library |

## Complexity Tracking

*No Constitution Check violations — table not needed.*
