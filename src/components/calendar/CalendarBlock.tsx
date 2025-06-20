"use client";

import React from "react";
import { useDrag } from "react-dnd";
import { cn } from "@/lib/utils";

export interface CalendarBlockProps {
  pump: {
    id: string;
    model: string;
    serialNumber?: string;
    customer: string;
    daysPerUnit: number;
  };
  duration: number;
  colorClass?: string;
  style?: React.CSSProperties;
}

export const CalendarBlock: React.FC<CalendarBlockProps> = ({
  pump,
  duration,
  colorClass,
  style,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "pump",
    item: pump,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [pump]);

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        "text-xs rounded-sm p-1 border shadow-sm overflow-hidden cursor-grab active:cursor-grabbing",
        colorClass,
      )}
      style={{ opacity: isDragging ? 0.5 : 1, gridColumn: `span ${duration}`, ...style }}
    >
      {pump.model}
    </div>
  );
};
