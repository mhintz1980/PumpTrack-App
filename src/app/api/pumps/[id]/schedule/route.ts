import { NextRequest, NextResponse } from "next/server";
interface HandlerContext {
  params?: Promise<Record<string, string | string[] | undefined>>;
}
import { createOrUpdateCalendarBlock } from "@/services/scheduleService";

export async function POST(
  request: NextRequest,
  { params }: HandlerContext,
): Promise<NextResponse> {
  try {
    const { start, end } = await request.json();
    if (typeof start !== "string" || typeof end !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const resolvedParams = (await params) ?? {};
    const id = Array.isArray(resolvedParams.id)
      ? resolvedParams.id[0]
      : resolvedParams.id;
    if (typeof id !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    const block = await createOrUpdateCalendarBlock(id, start, end);
    return NextResponse.json(block, { status: 200 });
  } catch (err) {
    const msg = (err as Error).message;
    if (msg === "CONFLICT") {
      return NextResponse.json({ error: "Schedule conflict" }, { status: 409 });
    }
    if (msg === "INVALID_DATES") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
