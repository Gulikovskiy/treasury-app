import { activity } from "@treasury/data";
import { Button } from "../components/Button";

export function ActivityPanel() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
        <div style={{ font: "500 20px/1.2 Inter" }}>Activity</div>
        <div style={{ font: "400 12px/1.2 Inter", color: "rgba(233,233,237,.45)" }}>Last 30 days · 47 transactions</div>
        <div className="seg" style={{ marginLeft: "auto" }}>
          <label className="seg-opt">
            <input type="radio" name="wfilter" defaultChecked />
            <span>All</span>
          </label>
          <label className="seg-opt">
            <input type="radio" name="wfilter" />
            <span>Transfers</span>
          </label>
          <label className="seg-opt">
            <input type="radio" name="wfilter" />
            <span>Config</span>
          </label>
        </div>
      </div>
      <div className="table-scroll">
        <table className="table" style={{ fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: 0 }}>When</th>
              <th>Event</th>
              <th>Signers</th>
              <th>Tx</th>
              <th style={{ textAlign: "right", paddingRight: 0 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {activity.flatMap((group) =>
              group.items.map((item) => (
                <tr key={item.tx}>
                  <td style={{ paddingLeft: 0, color: "rgba(233,233,237,.6)" }}>
                    {group.group} {item.time}
                  </td>
                  <td>{item.label}</td>
                  <td
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      color: item.signers === "auto" ? "rgba(233,233,237,.45)" : undefined,
                    }}
                  >
                    {item.signers}
                  </td>
                  <td style={{ fontFamily: "ui-monospace,Menlo,monospace", fontSize: 11.5, color: "rgba(233,233,237,.6)" }}>
                    {item.tx}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      paddingRight: 0,
                      fontVariantNumeric: "tabular-nums",
                      color: item.amount === "config" ? "rgba(233,233,237,.45)" : undefined,
                    }}
                  >
                    {item.amount}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
      <Button variant="ghost" style={{ marginTop: 16, fontSize: 12 }}>
        Load earlier activity
      </Button>
    </div>
  );
}
