import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session-user";
import { getDb } from "@/lib/cloudflare";
import { listJointMembers } from "@/lib/programs/joint";

/** GET joint members + progress for an enrollment. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId(request);
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await listJointMembers(getDb(), id, userId);
  if (result.kind === "not_found") return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    enrollment: {
      id: result.enrollment.id,
      programId: result.enrollment.programId,
      startLocalDate: result.enrollment.startLocalDate,
      status: result.enrollment.status,
    },
    myStatus: result.myStatus,
    members: result.members,
  });
}
