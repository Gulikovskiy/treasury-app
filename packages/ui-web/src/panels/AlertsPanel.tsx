import { alertRules, runwayAlert } from "@treasury/data";
import { Button } from "../components/Button";

export function AlertsPanel({ onAskAbout }: { onAskAbout: () => void }) {
  return (
    <div>
      <div style={{ font: "500 20px/1.2 Inter", marginBottom: 14 }}>Alerts</div>
      <div
        style={{
          border: "1px solid #5d5294",
          borderRadius: 8,
          background: "#2b2741",
          padding: "13px 14px",
          display: "flex",
          gap: 10,
          maxWidth: 640,
        }}
      >
        <i className="ph-fill ph-warning-diamond" style={{ fontSize: 16, color: "#b5abfc", marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ font: "500 13px/1.35 Inter" }}>{runwayAlert.title}</div>
          <div style={{ font: "400 12px/1.5 Inter", color: "rgba(233,233,237,.6)", marginTop: 4 }}>
            Below the 18-month floor since today&rsquo;s USDT→GHO swap. Runway on full NAV is unaffected at 29 months.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Button variant="primary" onClick={onAskAbout} style={{ fontSize: 12 }}>
              Ask the analyst
            </Button>
            <Button variant="secondary" style={{ fontSize: 12 }}>
              Mute 7d
            </Button>
          </div>
        </div>
      </div>

      <div
        style={{
          font: "500 10px/1 Inter",
          letterSpacing: ".09em",
          textTransform: "uppercase",
          color: "rgba(233,233,237,.45)",
          margin: "24px 0 4px",
        }}
      >
        Rules
      </div>
      <div className="table-scroll" style={{ maxWidth: 640 }}>
        <table className="table" style={{ fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: 0 }}>Rule</th>
              <th>Current</th>
              <th>Checked</th>
              <th style={{ textAlign: "right", paddingRight: 0 }}>State</th>
            </tr>
          </thead>
          <tbody>
            {alertRules.map((r) => (
              <tr key={r.name}>
                <td style={{ paddingLeft: 0 }}>{r.name}</td>
                <td style={{ fontVariantNumeric: "tabular-nums" }}>{r.current}</td>
                <td style={{ color: "rgba(233,233,237,.6)" }}>{r.checked}</td>
                <td
                  style={{
                    textAlign: "right",
                    paddingRight: 0,
                    color: r.state === "off" ? "rgba(233,233,237,.45)" : "#b5abfc",
                  }}
                >
                  {r.state}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button variant="secondary" style={{ marginTop: 18, fontSize: 12 }}>
        New rule
      </Button>
    </div>
  );
}
