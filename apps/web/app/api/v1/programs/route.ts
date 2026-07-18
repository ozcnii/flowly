import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { schema } from "@flowly/database";
import { getDb } from "@/lib/cloudflare";

const CATEGORY: Record<string, string> = {
  beginner: "Старт",
  back: "Спина",
  evening: "Вечер",
  morning: "Утро",
  mobility: "Мобильность",
  full: "Полный ритм",
};

export async function GET(request: Request) {
  const duration = new URL(request.url).searchParams.get("duration")?.trim() ?? "";
  const daysFilter = duration === "7" || duration === "14" || duration === "30" ? Number(duration) : null;
  try {
    const db = getDb();
    let rows = await db.select().from(schema.programs).where(eq(schema.programs.isSystem, true)).orderBy(asc(schema.programs.durationDays), asc(schema.programs.title));
    if (daysFilter) rows = rows.filter((row) => row.durationDays === daysFilter);
    return NextResponse.json({
      filters: { duration: daysFilter ? String(daysFilter) : "" },
      total: rows.length,
      programs: rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        coverObjectKey: row.coverObjectKey,
        durationDays: row.durationDays,
        category: row.category,
        categoryLabel: CATEGORY[row.category] ?? row.category,
        isSystem: row.isSystem,
      })),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    return NextResponse.json({ filters: { duration: "" }, total: 0, programs: [], explanation: "Каталог программ недоступен в этом окружении." });
  }
}
