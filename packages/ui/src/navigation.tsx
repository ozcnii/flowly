import type { ReactNode } from "react";
import { cx } from "./utils";

export type AppHeaderProps = { eyebrow?: string; title: string; subtitle?: string; leading?: ReactNode; trailing?: ReactNode; className?: string };
export function AppHeader({ eyebrow, title, subtitle, leading, trailing, className }: AppHeaderProps) { return <header className={cx("fl-app-header", className)}>{leading}<div className="fl-app-header__copy">{eyebrow && <span>{eyebrow}</span>}<h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{trailing}</header>; }

export type NavigationItem = { id: string; href: string; label: string; icon: ReactNode; badge?: string };
export type BottomNavigationProps = { items: NavigationItem[]; activeId: string; label?: string; className?: string; onNavigate?: (id: string) => void };
export function BottomNavigation({ items, activeId, label = "Основная навигация", className, onNavigate }: BottomNavigationProps) { return <nav className={cx("fl-bottom-nav", className)} aria-label={label}>{items.map(item => <a key={item.id} href={item.href} onClick={onNavigate ? event => { event.preventDefault(); onNavigate(item.id); } : undefined} aria-current={item.id === activeId ? "page" : undefined}><span className="fl-bottom-nav__icon">{item.icon}{item.badge && <b>{item.badge}</b>}</span><span>{item.label}</span></a>)}</nav>; }
