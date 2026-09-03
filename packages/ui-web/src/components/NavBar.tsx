import { Tag } from "./Tag";

export type WebTab = "ask" | "positions" | "activity" | "alerts";

const TABS: { key: WebTab; label: string }[] = [
  { key: "ask", label: "Ask" },
  { key: "positions", label: "Positions" },
  { key: "activity", label: "Activity" },
  { key: "alerts", label: "Alerts" },
];

export function NavBar({
  tab,
  onTabChange,
  safeAddress,
}: {
  tab: WebTab;
  onTabChange: (tab: WebTab) => void;
  safeAddress: string;
}) {
  return (
    <div
      className="nav web-nav"
      style={{ borderBottom: "1px solid rgba(233,233,237,.1)", padding: "10px 18px" }}
    >
      <div className="nav-brand" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15 }}>
        <span style={{ color: "var(--color-accent)" }} className="ph ph-triangle" />
        Treasury Analyst
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            style={{
              background: "none",
              border: 0,
              cursor: "pointer",
              font: "400 14px/1 Inter",
              color: tab === t.key ? "var(--color-accent)" : "var(--color-text)",
            }}
          >
            {t.label}
          </button>
        ))}
        <Tag>
          {safeAddress}
          <span className="web-nav-tag-detail"> · read-only</span>
        </Tag>
      </div>
    </div>
  );
}
