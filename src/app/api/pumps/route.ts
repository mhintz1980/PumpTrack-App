import { NextResponse } from "next/server";
import { getAllPumps } from "@/services/pumpService";

export async function GET() {
  const pumps = await getAllPumps();
  return NextResponse.json(pumps);
}
