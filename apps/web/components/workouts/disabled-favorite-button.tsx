import { Button } from "konsta/react";
import { Icon } from "@flowly/ui";

export function DisabledFavoriteButton({ title, className }: { title: string; className?: string }) {
  const label = `Добавить «${title}» в избранное — скоро`;
  return <Button inline className={className} clear rounded disabled aria-label={label} title={label}><Icon name="bookmark" /></Button>;
}
