"use client";

import { Badge, BlockTitle, Button, Card, Preloader, Segmented, SegmentedButton } from "konsta/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@flowly/ui";
import { IMAGE_BLUR_DATA_URL } from "@/lib/image";
import type { ProgramSummary } from "../model/programs";
import { DURATION_LABEL } from "../model/programs";
import { useProgramsQuery } from "../model/programs-queries";

const focusRing = "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent";
/**
 * Exclusive duration filter — same contract as onboarding preferences (BlockTitle + Segmented).
 * Short unit «дн» keeps full meaning without equal-width Segmented wrapping «30 дней».
 * Card badges still use full DURATION_LABEL («7 дней»).
 */
const FILTERS = [
  { value: "", label: "Все", aria: "Все программы" },
  { value: "7", label: "7 дн", aria: "7 дней" },
  { value: "14", label: "14 дн", aria: "14 дней" },
  { value: "30", label: "30 дн", aria: "30 дней" },
] as const;
const cover = (program: ProgramSummary) => (program.coverObjectKey ? `/media/${program.coverObjectKey}` : "/media/home-program.webp");
const countLabel = (count: number) => {
  const mod10 = count % 10, mod100 = count % 100;
  return `${count} ${mod10 === 1 && mod100 !== 11 ? "программа" : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? "программы" : "программ"}`;
};

function ProgramCard({ program, onOpen, eager }: { program: ProgramSummary; onOpen: () => void; eager?: boolean }) {
  return <Card component="article" contentWrap={false} outline className="relative m-0 overflow-hidden">
    <Button clear className={`absolute inset-0 z-10 !h-auto !w-auto rounded-3xl p-0 ${focusRing}`} onClick={onOpen} aria-label={`Открыть программу «${program.title}»`} />
    <div className="relative aspect-video bg-accent-soft">
      <Image src={cover(program)} alt="" fill sizes="(max-width: 430px) calc(100vw - 40px), 640px" loading={eager ? "eager" : "lazy"} decoding="sync" placeholder="blur" blurDataURL={IMAGE_BLUR_DATA_URL} className="object-cover" />
      <Badge className="pointer-events-none absolute bottom-3 right-3 z-20">{DURATION_LABEL[program.durationDays] ?? `${program.durationDays} дн.`}</Badge>
    </div>
    <div className="grid min-w-0 gap-1 p-4">
      <h2 className="m-0 text-lg font-semibold leading-tight">{program.title}</h2>
      <p className="m-0 truncate text-sm text-text-muted">{program.categoryLabel}</p>
      <p className="m-0 line-clamp-2 text-sm leading-relaxed text-text-muted">{program.description}</p>
    </div>
  </Card>;
}

export function ProgramsCatalogScreen() {
  const router = useRouter();
  const [duration, setDuration] = useState("");
  const query = useProgramsQuery(duration);
  const programs = query.data?.programs ?? [];
  const loading = query.isPending && !query.data;
  const error = query.isError && !query.data;

  return <div className="flow-screen">
    <h1 className="sr-only">Программы</h1>
    <section className="grid gap-2">
      <BlockTitle component="h2" className="!m-0 !p-0">Длительность</BlockTitle>
      <Segmented strong rounded role="radiogroup" aria-label="Длительность программы">
        {FILTERS.map(({ value, label, aria }) => <SegmentedButton key={value || "all"} active={duration === value} aria-pressed={duration === value} aria-label={aria} onClick={() => setDuration(value)}>{label}</SegmentedButton>)}
      </Segmented>
    </section>

    {loading ? <div className="grid min-h-48 place-items-center" role="status" aria-live="polite" aria-busy="true"><Preloader /><span className="sr-only">Загружаем программы</span></div>
      : error ? <Card component="section" outline className="m-0 text-center" role="alert" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="triangle-alert" /><h2 className="m-0 text-lg font-semibold">Не удалось загрузить</h2><p className="m-0 text-sm text-text-muted">Повторите запрос.</p><Button large rounded className={focusRing} onClick={() => query.refetch()}>Повторить</Button></Card>
        : programs.length === 0 ? <Card component="section" outline className="m-0 text-center" contentWrapPadding="p-6 grid justify-items-center gap-3"><Icon name="sparkles" /><h2 className="m-0 text-lg font-semibold">Программ пока нет</h2><p className="m-0 text-sm text-text-muted">Попробуйте другую длительность.</p><Button large rounded className={focusRing} onClick={() => setDuration("")}>Показать все</Button></Card>
          : <>
            <p className="m-0 text-sm font-semibold" aria-live="polite">{countLabel(query.data?.total ?? programs.length)}</p>
            <div className="grid gap-3">{programs.map((program, index) => <ProgramCard key={program.id} program={program} eager={index < 2} onOpen={() => router.push(`/programs/${encodeURIComponent(program.id)}` as never)} />)}</div>
          </>}
  </div>;
}
