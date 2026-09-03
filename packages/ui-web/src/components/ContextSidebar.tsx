import { mandate, nav } from "@treasury/data";
import { CompositionBar } from "./CompositionBar";

export function ContextSidebar() {
  return (
    <div
      className="web-sidebar-right"
      style={{
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div>
        <div
          style={{
            font: "500 10px/1 Inter",
            letterSpacing: ".09em",
            textTransform: "uppercase",
            color: "rgba(233,233,237,.45)",
          }}
        >
          Net asset value
        </div>
        <div style={{ font: "500 26px/1.2 Inter", fontVariantNumeric: "tabular-nums", marginTop: 5 }}>
          {nav.value}
        </div>
        <div style={{ font: "500 12px/1.2 Inter", color: "#b5abfc", fontVariantNumeric: "tabular-nums" }}>
          {nav.change30d}
        </div>
        <CompositionBar style={{ marginTop: 12 }} />
      </div>
      <div>
        <div
          style={{
            font: "500 10px/1 Inter",
            letterSpacing: ".09em",
            textTransform: "uppercase",
            color: "rgba(233,233,237,.45)",
            marginBottom: 8,
          }}
        >
          Against mandate
        </div>
        {mandate.map((m, i) => (
          <div
            key={m.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "7px 0",
              borderBottom: i < mandate.length - 1 ? "1px solid rgba(233,233,237,.08)" : "none",
              font: "400 12px/1.4 Inter",
            }}
          >
            {m.label}
            <span
              style={{
                color: "warn" in m && m.warn ? "#d2cefd" : "#b5abfc",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>
      <div>
        <div
          style={{
            font: "500 10px/1 Inter",
            letterSpacing: ".09em",
            textTransform: "uppercase",
            color: "rgba(233,233,237,.45)",
            marginBottom: 8,
          }}
        >
          Pinned to brief
        </div>
        <div
          style={{
            border: "1px solid rgba(233,233,237,.14)",
            borderRadius: 8,
            padding: "10px 11px",
            font: "400 11.5px/1.45 Inter",
            color: "rgba(233,233,237,.72)",
          }}
        >
          Stablecoin composition · Sep 3
          <div style={{ fontSize: 10, color: "rgba(233,233,237,.4)", marginTop: 3 }}>
            3 blocks · committee packet
          </div>
        </div>
      </div>
    </div>
  );
}
