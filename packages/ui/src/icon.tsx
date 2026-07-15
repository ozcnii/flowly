import type { SVGProps } from "react";
import { cx } from "./utils";

// DEC-037: Konsta 5.2.0 has no bundled icon artwork; user approved the local Lucide sprite as the sole source.
export type IconProps = SVGProps<SVGSVGElement> & { name: string; spriteHref?: string };

export function Icon({ name, spriteHref = "/icons/lucide.svg", className, ...props }: IconProps) {
  return <svg className={cx("fl-icon", className)} aria-hidden="true" focusable="false" {...props}><use href={`${spriteHref}#icon-${name}`} /></svg>;
}
