"use client";

import { createWebFetchAdapter } from "@treasury/data/webFetchAdapter";
import {
  ActivityPanel,
  AlertsPanel,
  AskPanel,
  ContextSidebar,
  NavBar,
  PositionsPanel,
  ThreadSidebar,
  type WebTab,
} from "@treasury/ui-web";
import { useMemo, useState } from "react";

const fetchImpl = createWebFetchAdapter();
const SAFE_ADDRESS = "0x4750…c74f";

export default function Page() {
  const [tab, setTab] = useState<WebTab>("ask");
  const goAsk = useMemo(() => () => setTab("ask"), []);

  return (
    <main style={{ minHeight: "100vh" }}>
      <NavBar tab={tab} onTabChange={setTab} safeAddress={SAFE_ADDRESS} />
      <div className="web-shell-grid">
        <ThreadSidebar />
        <div
          className="web-main-panel"
          style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 18, minWidth: 0, minHeight: 0 }}
        >
          {tab === "ask" && <AskPanel fetchImpl={fetchImpl} />}
          {tab === "positions" && <PositionsPanel onAskAbout={goAsk} />}
          {tab === "activity" && <ActivityPanel />}
          {tab === "alerts" && <AlertsPanel onAskAbout={goAsk} />}
        </div>
        <ContextSidebar />
      </div>
    </main>
  );
}
