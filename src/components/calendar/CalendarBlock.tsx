
"use client";

import React from "react";
import { useDrag } from "react-dnd";
import { cn } from "@/lib/utils";
import type { Pump } from "@/types";

// The pump object passed from the schedule page is a ScheduledPump
interface ScheduledPump extends Pump {
  daysPerUnit: number;
  instanceId: string;
  scheduledOnDayIndex: number;
}

export interface CalendarBlockProps {
  pump: ScheduledPump;
  colorClass?: string;
  style?: React.CSSProperties;
}

export const CalendarBlock: React.FC<CalendarBlockProps> = ({
  pump,
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
        "text-[10px] p-1 rounded mb-0.5 cursor-grab active:cursor-grabbing text-primary-foreground leading-tight border select-none",
        "overflow-hidden transition-transform hover:scale-105 hover:z-10 relative",
        colorClass,
        isDragging && "opacity-50"
      )}
      style={style}
      title={`${pump.model} - ${pump.serialNumber || "N/A"}\nCustomer: ${pump.customer}\nPO: ${pump.poNumber}\nSchedule Block: ${pump.daysPerUnit} days`}
    >
      <p className="font-semibold truncate">{pump.model}</p>
      <p className="truncate text-xs">{pump.serialNumber || "N/A"}</p>
      <p className="truncate text-[9px] opacity-80">{pump.customer}</p>
    </div>
  );
};
