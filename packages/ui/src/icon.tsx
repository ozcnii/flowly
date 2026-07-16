import type { SVGProps } from "react";
import { cx } from "./utils";

// DEC-037: Konsta 5.2.0 has no bundled icon artwork; user approved the local Lucide sprite as the sole source.
export type IconProps = SVGProps<SVGSVGElement> & { name: string };

export function Icon({ name, className, ...props }: IconProps) {
  return <svg className={cx("fl-icon", className)} aria-hidden="true" focusable="false" {...props}><use href={`#icon-${name}`} /></svg>;
}
