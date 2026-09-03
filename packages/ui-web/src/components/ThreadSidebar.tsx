import { threads } from "@treasury/data";
import { Button } from "./Button";

export function ThreadSidebar() {
  return (
    <div
      className="web-sidebar-left"
      style={{
        padding: "16px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          font: "500 10px/1 Inter",
          letterSpacing: ".09em",
          textTransform: "uppercase",
          color: "rgba(233,233,237,.45)",
          marginBottom: 6,
        }}
      >
        Threads
      </div>
      {threads.map((t) => (
        <div
          key={t.title}
          style={{
            padding: "8px 10px",
            borderRadius: 6,
            font: "400 12px/1.4 Inter",
            background: t.active ? "#2b2741" : "transparent",
            border: t.active ? "1px solid #423a6a" : "1px solid transparent",
            color: t.active ? "var(--color-text)" : "rgba(233,233,237,.7)",
          }}
        >
          {t.title}
          <div style={{ fontSize: 10, color: "rgba(233,233,237,.4)", marginTop: 2 }}>{t.when}</div>
        </div>
      ))}
      <Button variant="secondary" block style={{ marginTop: "auto", fontSize: 12 }}>
        New thread
      </Button>
    </div>
  );
}
