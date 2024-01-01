import classnames from "classnames";
import React from "react";

type Variant = "primary" | "secondary" | "danger";

const BASE = "font-semibold rounded-lg text-sm px-5 py-2.5 text-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const BUTTON_VARIANTS: Record<Variant, string> = {
  primary: "text-backgroundColor bg-primary hover:bg-amber-300",
  secondary: "text-ink border border-line hover:border-ink",
  danger: "text-backgroundColor bg-error hover:bg-red-300",
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = ({ className, variant = "primary", ...props }: Props): JSX.Element => {
  return <button type="button" className={classnames(BASE, BUTTON_VARIANTS[variant], className)} {...props} />;
};
