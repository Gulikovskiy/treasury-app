import "@treasury/ui-web/styles.css";
import "@phosphor-icons/web/regular/style.css";
import "@phosphor-icons/web/fill/style.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Treasury Analyst",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
