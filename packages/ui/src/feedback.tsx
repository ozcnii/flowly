import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "./button";
import { cx } from "./utils";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & { height?: "line" | "card" | "hero" };
export function Skeleton({ height = "line", className, ...props }: SkeletonProps) { return <div className={cx("fl-skeleton", `fl-skeleton--${height}`, className)} aria-hidden="true" {...props} />; }

export type EmptyStateProps = { icon: ReactNode; title: string; description: string; actionLabel?: string; onAction?: () => void };
export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) { return <section className="fl-state fl-state--empty"><span className="fl-state__icon">{icon}</span><h3>{title}</h3><p>{description}</p>{actionLabel && <Button variant="secondary" onClick={onAction}>{actionLabel}</Button>}</section>; }

export type InlineErrorProps = { title?: string; description: string; retryLabel?: string; onRetry?: () => void; icon?: ReactNode };
export function InlineError({ title = "Не удалось загрузить", description, retryLabel = "Повторить", onRetry, icon }: InlineErrorProps) { return <section className="fl-inline-error" role="alert">{icon}<div><strong>{title}</strong><p>{description}</p>{onRetry && <button type="button" onClick={onRetry}>{retryLabel}</button>}</div></section>; }

export type OfflineBannerProps = { children?: ReactNode; actionLabel?: string; onAction?: () => void; icon?: ReactNode };
export function OfflineBanner({ children = "Офлайн: изменения сохранятся локально", actionLabel, onAction, icon }: OfflineBannerProps) { return <aside className="fl-offline" role="status">{icon}<span>{children}</span>{actionLabel && <button type="button" onClick={onAction}>{actionLabel}</button>}</aside>; }
