import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "./utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leadingIcon?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = "primary", size = "md", loading = false, leadingIcon, className, children, disabled, ...props }, ref) {
  return <button ref={ref} className={cx("fl-button", `fl-button--${variant}`, `fl-button--${size}`, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>{loading ? <span className="fl-spinner" aria-hidden="true" /> : leadingIcon}<span>{children}</span></button>;
});

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & { label: string; icon: ReactNode; variant?: "secondary" | "ghost" | "danger" };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton({ label, icon, variant = "ghost", className, ...props }, ref) {
  return <button ref={ref} type="button" aria-label={label} title={label} className={cx("fl-icon-button", `fl-icon-button--${variant}`, className)} {...props}>{icon}</button>;
});
