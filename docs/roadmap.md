# Roadmap

The feature/slice list for this project, ordered so the riskiest technical unknowns are proven
earliest. Each row becomes one `/speckit-specify` invocation (and one `specs/NNN-*/` directory)
when its turn comes.

| # | Feature | One-line goal | Runnable at the end | Riskiest unknown |
|---|---------|----------------|----------------------|-------------------|
| 1 | [Agent transport / SSE](../specs/001-agent-sse-transport/spec.md) | Prove streaming transport (SSE parsing, cancellation, batched render) end-to-end on web, then port to native | Web chat streams a stubbed response and cancels cleanly; native port reuses the same `packages/agent` parser via `expo/fetch` | React Native's global `fetch` has no readable response body, and cancellation must leave server/client state in agreement |

## Notes

- Order by risk, not by dependency-graph convenience — an easy feature that hides no unknowns can
  wait.
- If a row's "riskiest unknown" reads as "none," that's a sign it's not actually the next row to
  build — something riskier is still unscheduled.
- When a feature turns out to be two features (its `/speckit-plan` output won't stay scannable, or
  its acceptance criteria split into two unrelated clusters), split the row here before splitting
  the spec.
