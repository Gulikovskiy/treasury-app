import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  children?: ReactNode;
}

export function Button({ variant = "secondary", block, className, children, ...rest }: ButtonProps) {
  const classes = ["btn", `btn-${variant}`, block ? "btn-block" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
