import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateCalendarBlock } from "@/services/scheduleService";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { start, end } = await request.json();
    const block = await createOrUpdateCalendarBlock(params.id, start, end);
    return NextResponse.json(block, { status: 200 });
  } catch (err) {
    if ((err as Error).message === "CONFLICT") {
      return NextResponse.json({ error: "Schedule conflict" }, { status: 409 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
