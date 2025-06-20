import { CalendarBlock } from "@/types";
import { randomUUID } from "crypto";

// In-memory store for demo/testing
const blocks: CalendarBlock[] = [];

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

export async function createOrUpdateCalendarBlock(
  pumpId: string,
  start: string,
  end: string,
): Promise<CalendarBlock> {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (
    isNaN(startDate.getTime()) ||
    isNaN(endDate.getTime()) ||
    startDate >= endDate
  ) {
    throw new Error("INVALID_DATES");
  }

  // Check conflicts with existing blocks for this pump
  for (const block of blocks) {
    if (
      block.pumpId === pumpId &&
      overlaps(startDate, endDate, new Date(block.start), new Date(block.end))
    ) {
      throw new Error("CONFLICT");
    }
  }

  const block: CalendarBlock = {
    id: randomUUID(),
    pumpId,
    start,
    end,
  };
  blocks.push(block);
  return block;
}

export function __reset() {
  blocks.length = 0;
}

export function getBlocks() {
  return blocks;
}
