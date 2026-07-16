import { Button, Glass } from "konsta/react";
import type { ComponentProps } from "react";
import { Icon } from "@flowly/ui";

type Props = Omit<ComponentProps<typeof Button>, "children"> & { icon: string; glassClassName?: string };

// Exact reusable Konsta Navbar action composition with native Glass highlight/pressed behavior.
export function GlassIconButton({ icon, glassClassName = "", className = "", ...props }: Props) {
  return <Glass className={`rounded-full ${glassClassName}`}>
    <Button inline clear rounded className={`h-11 w-11 min-w-11 p-0 ${className}`} {...props}>
      <Icon name={icon} />
    </Button>
  </Glass>;
}
