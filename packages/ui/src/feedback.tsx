import { Button, Card } from "konsta/react";
import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./utils";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & { height?: "line" | "card" | "hero" };
export function Skeleton({ height = "line", className, ...props }: SkeletonProps) { return <div className={cx("fl-skeleton", `fl-skeleton--${height}`, className)} aria-hidden="true" {...props} />; }

export type EmptyStateProps = { icon: ReactNode; title: string; description: string; actionLabel?: string; onAction?: () => void };
export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) { return <Card component="section" contentWrap={false} className="fl-state fl-state--empty"><span className="fl-state__icon">{icon}</span><h3>{title}</h3><p>{description}</p>{actionLabel && <Button tonal rounded onClick={onAction}>{actionLabel}</Button>}</Card>; }

export type InlineErrorProps = { title?: string; description: string; retryLabel?: string; onRetry?: () => void; icon?: ReactNode };
export function InlineError({ title = "Не удалось загрузить", description, retryLabel = "Повторить", onRetry, icon }: InlineErrorProps) { return <Card component="section" contentWrap={false} className="fl-inline-error" role="alert">{icon}<div><strong>{title}</strong><p>{description}</p>{onRetry && <Button clear small onClick={onRetry}>{retryLabel}</Button>}</div></Card>; }

export type OfflineBannerProps = { children?: ReactNode; actionLabel?: string; onAction?: () => void; icon?: ReactNode };
export function OfflineBanner({ children = "Офлайн: изменения сохранятся локально", actionLabel, onAction, icon }: OfflineBannerProps) { return <Card component="aside" contentWrap={false} className="fl-offline" role="status">{icon}<span>{children}</span>{actionLabel && <Button clear small onClick={onAction}>{actionLabel}</Button>}</Card>; }
