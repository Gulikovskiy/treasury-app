import { holdings, nav } from "@treasury/data";
import { Button } from "../components/Button";
import { Sparkline } from "../components/Sparkline";

export function PositionsPanel({ onAskAbout }: { onAskAbout: () => void }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <div style={{ font: "500 26px/1.2 Inter", fontVariantNumeric: "tabular-nums" }}>{nav.value}</div>
        <div style={{ font: "500 12px/1.2 Inter", color: "#b5abfc", fontVariantNumeric: "tabular-nums" }}>
          {nav.change30d}
        </div>
        <div className="seg" style={{ marginLeft: "auto" }}>
          <label className="seg-opt">
            <input type="radio" name="wrange" />
            <span>30d</span>
          </label>
          <label className="seg-opt">
            <input type="radio" name="wrange" defaultChecked />
            <span>12m</span>
          </label>
          <label className="seg-opt">
            <input type="radio" name="wrange" />
            <span>All</span>
          </label>
        </div>
      </div>
      <Sparkline height={120} />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          font: "400 10.5px/1.4 Inter",
          color: "rgba(233,233,237,.4)",
        }}
      >
        <span>Oct 2025</span>
        <span>Mar 2026</span>
        <span>Sep 3, 2026</span>
      </div>

      <div className="table-scroll">
        <table className="table" style={{ fontSize: 13, marginTop: 26 }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: 0 }}>Asset</th>
              <th>Venue</th>
              <th>Value</th>
              <th>Share</th>
              <th>APY</th>
              <th style={{ textAlign: "right", paddingRight: 0 }}>30d</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.label}>
                <td style={{ paddingLeft: 0 }}>{h.label}</td>
                <td style={{ color: "rgba(233,233,237,.6)" }}>{h.venue}</td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{h.value}</td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{h.share}</td>
                <td style={{ color: h.apy === "—" ? "rgba(233,233,237,.45)" : undefined, fontVariantNumeric: "tabular-nums" }}>
                  {h.apy}
                </td>
                <td style={{ textAlign: "right", paddingRight: 0, fontVariantNumeric: "tabular-nums" }}>{h.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="secondary" onClick={onAskAbout} style={{ marginTop: 20, fontSize: 12 }}>
        Ask about this book
      </Button>
    </div>
  );
}
