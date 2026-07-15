import { Icon, IconButton } from "@flowly/ui";

export function DisabledFavoriteButton({ title, className }: { title: string; className?: string }) {
  return <IconButton className={className} disabled label={`Добавить «${title}» в избранное — скоро`} icon={<Icon name="bookmark" />} />;
}
