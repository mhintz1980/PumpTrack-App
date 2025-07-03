"use client";

import React from "react";
import { useDrop } from "react-dnd";
import { cn } from "@/lib/utils";
import type { PlannablePump } from "@/app/schedule/page";

interface ScheduleDayCellProps {
  date: Date;
  dayIndex: number;
  isToday: boolean;
  isDifferentMonth: boolean;
  onDropPump: (pump: PlannablePump, dayIndex: number) => void;
}

export const ScheduleDayCell: React.FC<ScheduleDayCellProps> = ({
  date,
  dayIndex,
  isToday,
  isDifferentMonth,
  onDropPump,
}) => {
  const [{ isOver }, drop] = useDrop<PlannablePump, void, { isOver: boolean }>(
    {
      accept: "pump",
      drop: (draggedItem) => onDropPump(draggedItem, dayIndex),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    },
  );

  return (
    <div
      ref={drop}
      className={cn(
        "border rounded-sm p-1 text-xs relative flex flex-col bg-background/40 hover:bg-background/60 transition-colors min-h-[8rem]",
        isDifferentMonth && "bg-muted/20 text-muted-foreground/60",
        isOver && "bg-primary/10 border-primary",
      )}
    >
      <div
        className={cn(
          "font-medium pb-0.5 text-right",
          isToday && "text-primary font-bold",
        )}
      >
        {date.getDate()}
      </div>
    </div>
  );
};