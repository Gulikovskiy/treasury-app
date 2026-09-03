/**
 * Nocturne design tokens — the single source of truth for color, type,
 * spacing, radius and elevation across apps/web and apps/mobile. Ported
 * from the Claude Design "Nocturne" system (project ae90da29-…, design
 * doc "Treasury Analyst.dc.html"). Keep apps/web/app/globals.css in sync
 * by hand if these values change — CSS can't import this module directly.
 */

export const color = {
  bg: "#161826",
  surface: "#1b1d2b",
  text: "#e9e9ed",
  accent: "#9184d9",
  accent2: "#a7a1db",
  divider: "rgba(233, 233, 237, 0.16)",

  neutral100: "#f3f5fe",
  neutral200: "#e4e7f5",
  neutral300: "#cfd3e5",
  neutral400: "#b2b6ca",
  neutral500: "#9397ab",
  neutral600: "#75798c",
  neutral700: "#595d6c",
  neutral800: "#3f424d",
  neutral900: "#292b31",

  accent100: "#f5f4ff",
  accent200: "#e7e5fe",
  accent300: "#d2cefd",
  accent400: "#b5abfc",
  accent500: "#968ae0",
  accent600: "#796cbf",
  accent700: "#5d5294",
  accent800: "#423a6a",
  accent900: "#2b2741",

  positive: "#b5abfc",
} as const;

export const space = {
  1: 2.8,
  2: 5.6,
  3: 8.4,
  4: 11.2,
  6: 16.8,
  8: 22.4,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 14,
} as const;

export const font = {
  heading: "Inter",
  body: "Inter",
  mono: "Menlo",
  headingWeight: "500" as const,
};

export const shadow = {
  sm: "0 0 0 1px #3f424d",
  md: "0 0 0 1px #595d6c, 0 6px 18px rgba(0,0,0,0.55)",
  lg: "0 0 0 1px #9397ab, 0 16px 40px rgba(0,0,0,0.65)",
};
