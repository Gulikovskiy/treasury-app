---

description: "Task list template for feature implementation"
---

# Tasks: Agent Transport / SSE Streaming

**Input**: Design documents from `/specs/001-agent-sse-transport/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/agent-stream.md, quickstart.md

**Tests**: Tests are MANDATORY for every user story in this project (constitution: tests before
implementation, derived from the spec). Each test task's description cites the FR-/SC- id (or
Acceptance Scenario number) it verifies.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Two-surface monorepo per plan.md's Project Structure: `apps/web/`, `apps/mobile/`,
`packages/agent/`, `packages/data/`. No `packages/core`, `packages/db`, or `packages/ui-*` — this
feature doesn't need them (see plan.md's Structure Decision).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Nothing exists in this repo yet — stand up the minimal monorepo scaffold.

- [X] T001 Create root monorepo scaffold: `package.json`, `pnpm-workspace.yaml` (listing `apps/*`
      and `packages/*`), `turbo.json` (dev/build/test/lint pipelines), `tsconfig.base.json`
- [X] T002 [P] Scaffold `apps/web/package.json` and `apps/web/tsconfig.json` (Next.js App Router,
      extends `tsconfig.base.json`)
- [X] T003 [P] Scaffold `apps/mobile/package.json` and `apps/mobile/tsconfig.json` (Expo, extends
      `tsconfig.base.json`)
- [X] T004 [P] Scaffold `packages/agent/package.json` and `packages/agent/tsconfig.json`, adding
      the `eventsource-parser` dependency (plan.md New Dependencies)
- [X] T005 [P] Scaffold `packages/data/package.json` and `packages/data/tsconfig.json`, depending
      on `packages/agent`
- [X] T006 [P] Configure a shared vitest config at the workspace root used by `pnpm test` in every
      package (CLAUDE.md: `pnpm test # vitest, all packages`)

**Checkpoint**: `pnpm install` succeeds at the repo root.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The transport core and stub backend every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational infrastructure ⚠️ write first, confirm they FAIL, only then implement

- [X] T007 [P] Unit test: `parseStream` correctly reassembles SSE frames split across chunk
      boundaries (a `data:` line and the blank-line delimiter each arriving in separate chunks) in
      `packages/agent/src/__tests__/parseStream.test.ts` (verifies FR-002, FR-007)
- [X] T008 [P] Unit test: `streamSession` lifecycle transitions
      (streaming→complete/cancelled/errored) and partial-message accumulation in
      `packages/agent/src/__tests__/streamSession.test.ts` (verifies FR-004, FR-005, data-model.md
      Stream Session)
- [X] T009 [P] Unit test: `useAgentStream` flushes accumulated state on a fixed 50ms interval —
      render count stays decoupled from token count even when tokens arrive faster than the
      interval — in `packages/data/src/__tests__/useAgentStream.batch.test.ts` (verifies FR-006,
      SC-003)

### Implementation

- [X] T010 Define shared event/session/message types in `packages/agent/src/types.ts`
      (data-model.md entities; contracts/agent-stream.md frame shapes: `chunk`/`done`/`error`)
- [X] T011 Implement `packages/agent/src/parseStream.ts` wrapping `eventsource-parser` to make
      T007 pass (verifies FR-002, FR-007; depends on T010)
- [X] T012 Implement `packages/agent/src/streamSession.ts` state machine to make T008 pass
      (verifies FR-004, FR-005; depends on T010)
- [X] T013 Implement `apps/web/app/api/agent/stream/route.ts` per contracts/agent-stream.md: emits
      a multi-chunk canned response (Assumptions: stubbed content) and stops writing frames when
      `request.signal` fires abort (verifies FR-001, FR-005; research.md §6)
- [X] T014 Implement `packages/data/src/useAgentStream.ts` hook skeleton: accepts an injected fetch
      implementation, feeds it through `parseStream`/`streamSession`, and batches state updates on
      a fixed 50ms interval to make T009 pass (verifies FR-002, FR-006, FR-008; depends on T011,
      T012)

**Checkpoint**: Foundation ready — user story implementation can now begin.

---

## Phase 3: User Story 1 - Ask a question and watch the answer stream in on web (Priority: P1) 🎯 MVP

**Goal**: A working streaming Q&A loop on web, proving the transport mechanism end to end.

**Independent Test**: Send a single prompt from the web app; the response text appears in
multiple incremental updates rather than one atomic update at the end.

### Tests for User Story 1 ⚠️ MANDATORY — write first, confirm they FAIL, only then implement

- [X] T015 [P] [US1] Integration test: `useAgentStream(createWebFetchAdapter())` against the
      *real* route handler (bridged in-process via a stubbed global `fetch` that calls the
      exported `POST` directly — no mock) renders more than one incremental update before
      completion, and the final text matches the server's content exactly, in
      `apps/web/tests/agentStream.integration.test.ts` (verifies FR-001, SC-001, Acceptance
      Scenario 1-2). *Relocated from packages/data to apps/web during implementation — the real
      route handler lives in apps/web, and packages/data must not import upward across the
      package boundary.*
- [X] T016 [P] [US1] Integration test: a mid-stream `error` frame (from a fake SSE response — the
      real stub handler has no error path to exercise) surfaces as a typed error result (never a
      thrown/uncaught exception), with the partial message preserved and marked incomplete, in
      `packages/data/src/__tests__/useAgentStream.web.test.ts` (verifies FR-007, Acceptance
      Scenario 3)

### Implementation for User Story 1

- [X] T017 [US1] Implement `packages/data/src/webFetchAdapter.ts` using the global `fetch` +
      `AbortController` to make T015/T016 pass (verifies FR-001; depends on T014)
- [X] T018 [US1] Implement `apps/web/app/page.tsx` minimal chat page (Non-Goal: no UI polish):
      prompt input, submit action, response text rendered incrementally (verifies Acceptance
      Scenario 1-2, SC-001; depends on T017)
- [X] T019 [US1] Render the error/incomplete state distinctly in `apps/web/app/page.tsx`
      (verifies Acceptance Scenario 3, FR-007; depends on T018)

**Checkpoint**: User Story 1 is fully functional and testable independently — MVP.

---

## Phase 4: User Story 2 - Cancel a response mid-stream (Priority: P2)

**Goal**: Cancellation leaves server and client agreeing on the exact partial message.

**Independent Test**: Start a prompt, cancel it partway through, then compare the server's
in-memory partial content against the client's cached partial content — they must be identical.

### Tests for User Story 2 ⚠️ MANDATORY — write first, confirm they FAIL, only then implement

- [X] T020 [P] [US2] Integration test: cancelling mid-stream leaves the route handler's own
      in-memory partial content and the client's cached content byte-for-byte identical, in
      `packages/data/src/__tests__/useAgentStream.cancel.test.ts` (verifies FR-005, SC-002,
      Acceptance Scenario 2). *Uses a deterministic gated fake server (send-one-frame-then-pause)
      rather than real delays — an earlier wall-clock-timing version of this test was flaky
      against Node's real-timer coalescing and was replaced.*
- [X] T021 [P] [US2] Integration test: submitting a second prompt for the same `conversationId`
      while one is streaming implicitly cancels the first, with no session ID exchanged, in
      `packages/data/src/__tests__/useAgentStream.cancel.test.ts` (verifies the Clarifications
      session-correlation decision, Edge Cases, SC-002)
- [X] T022 [P] [US2] Integration test: aborting the underlying connection without an explicit
      cancel action still ends in the same cancelled/incomplete terminal state, in
      `packages/data/src/__tests__/useAgentStream.cancel.test.ts` (verifies the Clarifications
      dropped-connection decision, Edge Cases, Kill Criteria)

### Implementation for User Story 2

- [X] T023 [US2] Add a cancel action to `apps/web/app/page.tsx` wired to `useAgentStream`'s abort,
      stopping rendering immediately (verifies Acceptance Scenario 1; depends on T018)
- [X] T024 [US2] Implement auto-supersede-on-new-prompt in `packages/data/src/useAgentStream.ts`:
      abort any active session for the same `conversationId` before starting a new one to make
      T020-T022 pass (verifies the Clarifications decision, FR-005; depends on T014)
- [X] T025 [US2] Mark cancelled/incomplete messages distinctly (not as a normal finished answer)
      in `apps/web/app/page.tsx` (verifies Acceptance Scenario 3; depends on T023)

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Same chat, ported to native (Priority: P3)

**Goal**: The same transport-agnostic parser/state machine, reused on native via `expo/fetch`.

**Independent Test**: Send the same prompt used in Story 1's test from the native app; confirm
incremental rendering and correct cancellation using the same `packages/agent` code, only the
fetch implementation swapped.

### Tests for User Story 3 ⚠️ MANDATORY — write first, confirm they FAIL, only then implement

- [X] T026 [P] [US3] Unit test: `nativeFetchAdapter` always calls `expo/fetch` and never the
      global `fetch`, asserted via a mock/spy, in
      `packages/data/src/__tests__/nativeFetchAdapter.test.ts` (verifies FR-003, SC-004)
- [X] T027 [P] [US3] Integration test: `useAgentStream(nativeFetchAdapter)` against a mocked
      `expo/fetch` streaming response reproduces the same incremental-render and cancellation
      guarantees as the web adapter, in
      `packages/data/src/__tests__/useAgentStream.native.test.ts` (verifies Acceptance Scenario 1
      & 3, FR-008)

### Implementation for User Story 3

- [X] T028 [US3] Implement `packages/data/src/nativeFetchAdapter.ts` using `expo/fetch` +
      `AbortController` to make T026/T027 pass (verifies FR-003; depends on T014). *Required a
      package.json `exports` map subpath split (`@treasury/data/webFetchAdapter` vs.
      `@treasury/data/nativeFetchAdapter`) discovered during implementation — barrel-exporting
      both from the main entry would force apps/web's bundler to resolve `expo/fetch`, which isn't
      installed there. `expo` is declared as an optional peer dependency; an ambient
      `expo-fetch.d.ts` covers typecheck without needing the real package installed.*
- [X] T029 [US3] Implement `apps/mobile/App.tsx` minimal screen: prompt input, submit, cancel,
      incremental text using `useAgentStream(nativeFetchAdapter)` (verifies Acceptance Scenario 1
      & 3; depends on T028)
- [X] T030 [US3] Diff `packages/agent/src/parseStream.ts` and `packages/agent/src/streamSession.ts`
      against their pre-native-port versions and confirm zero changes were needed — only
      `nativeFetchAdapter.ts` was added (verifies SC-005; depends on T028). *No prior commit
      exists to `git diff` against (first implementation of this feature); confirmed instead by
      implementation history — both files were written once during the Foundational phase (T011,
      T012) and never edited again. The native port touched only
      `packages/data/src/nativeFetchAdapter.ts` (new) and `useAgentStream.ts`'s cast site.*

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification and gap-closing across all three stories.

- [X] T031 [P] Add a lint rule or grep-based CI check forbidding global `fetch` usage under
      `apps/mobile/` and `packages/data/src/nativeFetchAdapter.ts`, automating SC-004. Implemented
      as `scripts/check-no-global-fetch-native.sh`, wired into the root `pnpm lint`. *Also had to
      add a minimal `apps/web/.eslintrc.json` plus `eslint`/`eslint-config-next` — `next lint` had
      no config and was blocking on an interactive setup prompt, unrelated to this feature but
      required to make `pnpm lint` runnable at all.*
- [X] T032 [P] Run quickstart.md's web verification steps manually and record the outcome.
      *Outcome: ran the real `next dev` server on :3100. `curl -sN POST /api/agent/stream` returned
      3 chunk frames + a done frame over a real HTTP connection, exact content matching the canned
      fragments (US1, SC-001). Cutting the client connection short with `curl --max-time`
      delivered exactly 2 of 3 chunks before the cut, and the server logged the request as
      completed and stayed healthy afterward (GET / still 200) — confirming the abort-handling
      path works against a real dropped connection, not just the in-process test bridge (US2).
      GET / rendered the page with the correct title and prompt input.*
- [X] T033 Run quickstart.md's native verification steps on an Android device/emulator with an
      Expo development build (not Expo Go) and record the outcome, per the project's
      Android-first constraint. *Outcome: built and ran on a real Android Studio emulator
      (`sdk_gphone16k_arm64`). Fixed three pre-existing, unrelated build/runtime issues found along
      the way (Kotlin/Compose classpath version pin, a stale `expo` autolinking import needing a
      `react-native.config.js` override, and Metro monorepo config for pnpm symlinks + package
      exports — see research notes below). Submitted a prompt on-device: the exact canned response
      streamed in from the real `next dev` backend over `expo/fetch` through
      `nativeFetchAdapter` → `parseStream` → `streamSession` → rendered in `App.tsx`, and the
      Cancel button correctly greyed out once the stream completed (Acceptance Scenario 1 & 3).*
- [X] T034 Walk every FR-001…FR-008 and SC-001…SC-005 in spec.md and confirm a task or test above
      covers it; list any gap in the completion report. *All 8 FRs and 5 SCs have at least one
      task/test; see the completion report's coverage table. `pnpm typecheck`, `pnpm lint`, and
      `pnpm test` all pass repo-wide (4/4 packages each).*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1) has no dependency on Stories 2 or 3
  - User Story 2 (P2) reuses US1's page (`apps/web/app/page.tsx`) and the shared hook, but its
    own tests (T020-T022) exercise cancellation behavior independently of US1's page existing
  - User Story 3 (P3) depends only on the Foundational phase, not on US1/US2's code — but per
    plan.md's rationale, building it after US1/US2 gives higher confidence the shared parser is
    genuinely transport-agnostic
- **Polish (Phase 6)**: Depends on all three user stories being complete

### Within Each User Story

- Tests MUST be written and confirmed FAILING before implementation begins (Constitution
  Principle VII)
- Types/state machine before adapters; adapters before UI wiring
- Story complete before moving to the next priority (recommended order: US1 → US2 → US3, matching
  spec.md's stated priorities and risk rationale)

### Parallel Opportunities

- T002-T006 (Setup) can all run in parallel
- T007-T009 (Foundational tests) can run in parallel
- T015-T016 (US1 tests) can run in parallel
- T020-T022 (US2 tests) can run in parallel
- T026-T027 (US3 tests) can run in parallel
- T031-T032 (Polish) can run in parallel
- Once Foundational (Phase 2) completes, US1, US2, and US3 implementation could in principle
  proceed in parallel if staffed — but US2 and US3 both build on US1's page/hook wiring in
  practice, so sequential delivery (US1 → US2 → US3) is the realistic path for a single
  implementer

---

## Parallel Example: Foundational Tests

```bash
# Launch all three foundational tests together:
Task: "Unit test: parseStream reassembles chunk-boundary-split SSE frames in packages/agent/src/__tests__/parseStream.test.ts"
Task: "Unit test: streamSession lifecycle transitions in packages/agent/src/__tests__/streamSession.test.ts"
Task: "Unit test: useAgentStream flushes state on a fixed 50ms interval, decoupled from token count in packages/data/src/__tests__/useAgentStream.batch.test.ts"
```

## Parallel Example: User Story 2 Tests

```bash
Task: "Integration test: cancellation leaves server/client partial content identical (FR-005, SC-002)"
Task: "Integration test: new prompt implicitly supersedes prior stream (Clarifications, SC-002)"
Task: "Integration test: dropped connection ends in cancelled/incomplete state (Clarifications, Kill Criteria)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: run quickstart.md's US1 section
5. Demo: a prompt on the web page visibly streams in

### Incremental Delivery

1. Complete Setup + Foundational → transport core and stub backend exist
2. Add User Story 1 → validate independently → MVP demo-able
3. Add User Story 2 → validate independently → cancellation demo-able
4. Add User Story 3 → validate independently → native parity demo-able
5. Polish: automate SC-004, run both quickstart platforms, confirm full FR-/SC- coverage

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Verify tests fail before implementing — if a test doesn't fail for the right reason, stop and
  fix the test before writing implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- If a test needs to change after implementation has started, stop: update the spec first, then
  the test, in separate steps. Do not silently adjust a test to make it pass.
