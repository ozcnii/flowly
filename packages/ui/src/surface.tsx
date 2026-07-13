import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils";

export type CardProps = HTMLAttributes<HTMLElement> & { as?: "article" | "section" | "div"; tone?: "default" | "subtle" | "accent"; interactive?: boolean };
export function Card({ as: Element = "article", tone = "default", interactive = false, className, ...props }: CardProps) { return <Element className={cx("fl-card", `fl-card--${tone}`, interactive && "fl-card--interactive", className)} {...props} />; }

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "success" | "warning" | "danger" | "info"; icon?: ReactNode };
export function Badge({ tone = "neutral", icon, className, children, ...props }: BadgeProps) { return <span className={cx("fl-badge", `fl-badge--${tone}`, className)} {...props}>{icon}{children}</span>; }

export type ProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & { value: number; max?: number; label: string; showValue?: boolean };
export function Progress({ value, max = 100, label, showValue = false, className, ...props }: ProgressProps) { const safe = Math.min(max, Math.max(0, value)); return <div className={cx("fl-progress-wrap", className)} {...props}><div className="fl-progress-row"><span>{label}</span>{showValue && <strong>{Math.round(safe / max * 100)}%</strong>}</div><div className="fl-progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={safe}><i style={{ width: `${safe / max * 100}%` }} /></div></div>; }
