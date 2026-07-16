import type { MouseEventHandler } from "react";
import { GlassIconButton } from "@/components/glass-icon-button";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";

// DEC-053: exact Konsta Navbar action composition — Glass wraps one 44px clear Button.
export function YoutubePlayButton({ title, onClick }: { title: string; onClick: MouseEventHandler<HTMLButtonElement> }) {
  return <GlassIconButton icon="play" glassClassName="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2" className={focusRing} aria-label={`Воспроизвести «${title}»`} onClick={onClick} />;
}
