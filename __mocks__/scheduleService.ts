import type { CalendarBlock } from "@/types";

export const blocks: CalendarBlock[] = [];

export const createOrUpdateCalendarBlock = jest.fn(
  async (_pumpId: string, start: string, end: string) => {
    const block: CalendarBlock = {
      id: "mock-block",
      pumpId: _pumpId,
      start,
      end,
    };
    blocks.push(block);
    return block;
  },
);

export const __reset = () => {
  blocks.length = 0;
};

export const getBlocks = jest.fn(() => blocks);
