import { createStreamSession, parseStream, type StreamSessionSnapshot } from "@treasury/agent";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The subset of `Response` this hook actually needs. Deliberately narrower
 * than the full DOM `Response` type: Expo's `expo/fetch` returns its own
 * `FetchResponse` type (missing newer methods like `.bytes()`), and both it
 * and the standard global `Response` satisfy this structurally — letting
 * `AgentStreamFetch` work with either adapter without a cast.
 */
export interface StreamResponse {
  body: ReadableStream<Uint8Array> | null;
}

/**
 * Fetch implementation injected by the caller (Principle: packages/agent is
 * transport-agnostic; the fetch call itself is the only thing that differs
 * between web and native — FR-002).
 */
export type AgentStreamFetch = (
  request: { conversationId: string; prompt: string },
  signal: AbortSignal,
) => Promise<StreamResponse>;

export interface UseAgentStreamResult {
  snapshot: StreamSessionSnapshot | null;
  submit(prompt: string): void;
  cancel(): void;
}

/** Fixed render-batch flush interval (FR-006, SC-003). */
const BATCH_INTERVAL_MS = 50;

type ActiveStream = {
  controller: AbortController;
  session: ReturnType<typeof createStreamSession>;
};

export function useAgentStream(
  conversationId: string,
  fetchImpl: AgentStreamFetch,
): UseAgentStreamResult {
  const [snapshot, setSnapshot] = useState<StreamSessionSnapshot | null>(null);
  const activeRef = useRef<ActiveStream | null>(null);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopFlushing();
      activeRef.current?.controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopFlushing() {
    if (flushTimerRef.current !== null) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }

  function startFlushing(session: ActiveStream["session"]) {
    stopFlushing();
    flushTimerRef.current = setInterval(() => {
      if (!mountedRef.current) return;
      const current = session.getSnapshot();
      setSnapshot(current);
      if (current.status !== "streaming") {
        stopFlushing();
      }
    }, BATCH_INTERVAL_MS);
  }

  const cancel = useCallback(() => {
    activeRef.current?.controller.abort();
  }, []);

  const submit = useCallback(
    (prompt: string) => {
      // At most one active Stream Session per conversation (Clarifications):
      // a new prompt implicitly supersedes any in-flight one, with no
      // client-facing session ID involved.
      activeRef.current?.controller.abort();

      const controller = new AbortController();
      const session = createStreamSession(conversationId);
      activeRef.current = { controller, session };
      setSnapshot(session.getSnapshot());
      startFlushing(session);

      controller.signal.addEventListener("abort", () => {
        session.cancel();
        if (mountedRef.current) setSnapshot(session.getSnapshot());
        stopFlushing();
      });

      fetchImpl({ conversationId, prompt }, controller.signal)
        .then((response) => {
          if (!response.body) {
            session.handleFrame({ type: "error", message: "response had no body" });
            return;
          }
          return parseStream(response.body, (frame) => session.handleFrame(frame));
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            // Expected: cancellation already handled by the abort listener above.
            return;
          }
          session.handleFrame({
            type: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        })
        .finally(() => {
          if (mountedRef.current) setSnapshot(session.getSnapshot());
          stopFlushing();
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversationId, fetchImpl],
  );

  return { snapshot, submit, cancel };
}
