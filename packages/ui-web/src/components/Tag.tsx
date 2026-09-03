import type { ReactNode } from "react";

export function Tag({ children, variant = "neutral" }: { children: ReactNode; variant?: "neutral" | "accent" }) {
  return <span className={`tag tag-${variant}`}>{children}</span>;
}
