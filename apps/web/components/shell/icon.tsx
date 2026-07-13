type IconProps = { name: string; className?: string };

export function Icon({ name, className = "size-5" }: IconProps) {
  return <svg className={className} aria-hidden="true"><use href={`/icons/lucide.svg#icon-${name}`} /></svg>;
}
