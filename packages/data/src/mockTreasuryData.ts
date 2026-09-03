/**
 * Placeholder treasury data for the Safe/Positions/Activity/Alerts surfaces.
 * These screens have no backing API yet — only the Ask transport (see
 * useAgentStream) is real. Figures are internally consistent (they all
 * derive from the same $79.08M NAV) but are illustrative, not live data.
 * Replace with a real data slice per docs/roadmap.md.
 */

export const safeMeta = {
  name: "Finance Committee Safe",
  address: "0x4750…c74f",
  signers: "5/9 signers",
  network: "Ethereum",
};

export const nav = {
  value: "$79.08M",
  change30d: "+1.62% 30d",
  sparkline: [
    58.7, 52.8, 56.5, 44.1, 46.4, 35.4, 39.1, 27.2, 21.3, 24.5, 18.1, 12.2,
  ],
};

export const overviewStats = [
  { label: "Stables", value: "60.4%", sub: "$47.74M · band 55–75%" },
  { label: "Yield / year", value: "$2.14M", sub: "2.70% on NAV" },
  { label: "Net burn", value: "$2.71M", sub: "per month, trailing 90d" },
  { label: "Runway", value: "29 mo", sub: "17 mo on stables alone" },
] as const;

export const runwayAlert = {
  title: "Stable-only runway is 17 months",
  detail:
    "Below the committee's 18-month floor. Total runway on NAV is unaffected at 29 months.",
};

export const holdings = [
  { label: "aEthUSDC", venue: "Aave V3", caption: "Aave V3 · 4.02% APY", apy: "4.02%", value: "$22.12M", share: "28.0%", change: "+2.4" },
  { label: "aEthUSDT", venue: "Aave V3", caption: "Aave V3 · 4.31% APY", apy: "4.31%", value: "$21.40M", share: "27.1%", change: "+0.7" },
  { label: "AAVE", venue: "Safe", caption: "Unstaked · governance", apy: "—", value: "$14.82M", share: "18.7%", change: "+3.4" },
  { label: "aEthwstETH", venue: "Aave V3", caption: "Aave V3 · 0.11% APY", apy: "0.11%", value: "$10.46M", share: "13.2%", change: "−1.2" },
  { label: "GHO", venue: "Safe", caption: "Held directly · no yield", apy: "—", value: "$4.22M", share: "5.3%", change: "+1.4" },
  { label: "14 smaller positions", venue: "mixed", caption: "each under $1.4M", apy: "—", value: "$6.06M", share: "7.7%", change: "+0.3" },
] as const;

export const venueExposure = [
  { label: "Aave V3 Ethereum · aTokens", share: 68.3 },
  { label: "Held directly by the Safe", share: 24.1 },
  { label: "Other venues", share: 7.6 },
] as const;

export const activity = [
  {
    group: "Today",
    items: [
      { icon: "swap", label: "Swap 1,100,000 USDT → GHO", time: "14:02 UTC", signers: "5/9", tx: "0x9c1a…4be2", amount: "−$1.10M" },
      { icon: "in", label: "Aave V3 revenue sweep", time: "09:31 UTC", signers: "auto", tx: "0x2f88…7d01", amount: "+$412K" },
    ],
  },
  {
    group: "Sep 1",
    items: [
      { icon: "out", label: "Merit rewards funding · round 34", time: "18:44 UTC", signers: "6/9", tx: "0xd407…1a95", amount: "−$1.35M" },
      { icon: "config", label: "Signer rotation · added 0x71ba…03fd", time: "11:07 UTC", signers: "7/9", tx: "0x55cc…9e10", amount: "config" },
    ],
  },
  {
    group: "Aug 28",
    items: [
      { icon: "in", label: "GHO stability-module fees", time: "06:12 UTC", signers: "auto", tx: "0x8ab3…c220", amount: "+$186K" },
    ],
  },
] as const;

export const alertRules = [
  { name: "Stablecoin share below 55%", detail: "now 60.4% · checked hourly", current: "60.4%", checked: "hourly", state: "on" },
  { name: "Single-venue exposure above 85%", detail: "now 68.3% Aave V3 · checked hourly", current: "68.3%", checked: "hourly", state: "on" },
  { name: "Stable-only runway under 18 months", detail: "now 17 months · triggered today", current: "17 mo", checked: "daily", state: "triggered" },
  { name: "Outgoing transfer above $1M", detail: "2 triggers in 30d · realtime", current: "2 in 30d", checked: "realtime", state: "off" },
] as const;

export const mandate = [
  { label: "Stables 55–75%", value: "60.4%" },
  { label: "Venue ≤ 85%", value: "68.3%" },
  { label: "Stable runway ≥ 18mo", value: "17 mo", warn: true },
  { label: "Asset drift ≤ 12%", value: "3.4 pts" },
] as const;

export const threads = [
  { title: "Stablecoin exposure vs band", when: "2 min ago", active: true },
  { title: "Stable-only runway floor", when: "Yesterday", active: false },
  { title: "Merit round 34 reconciliation", when: "Aug 29", active: false },
  { title: "wstETH drawdown scenarios", when: "Aug 22", active: false },
] as const;

export const quickPrompts = [
  { key: "stables", label: "Stablecoin exposure?", prompt: "What's our stablecoin exposure?" },
  { key: "runway", label: "Runway at current burn", prompt: "Runway at current burn" },
  { key: "unusual", label: "Anything unusual?", prompt: "Anything unusual in the last 30 days?" },
] as const;
