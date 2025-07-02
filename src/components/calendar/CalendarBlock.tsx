
"use client";

import React from "react";
import { useDrag } from "react-dnd";
import { cn } from "@/lib/utils";
import type { Pump } from "@/types";

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
        "h-full w-full text-[10px] p-1 rounded-sm cursor-grab active:cursor-grabbing text-primary-foreground leading-tight border select-none",
        "overflow-hidden transition-opacity flex items-center gap-2",
        colorClass,
        isDragging && "opacity-50"
      )}
      style={style}
      title={`${pump.model} - ${pump.serialNumber || "N/A"}\nCustomer: ${pump.customer}\nPO: ${pump.poNumber}\nSchedule Block: ${pump.daysPerUnit} days`}
    >
      <p className="font-semibold truncate whitespace-nowrap">
        {pump.model} - {pump.serialNumber || 'N/A'}
      </p>
      <p className="truncate text-xs opacity-80 whitespace-nowrap">{pump.customer}</p>
    </div>
  );
};
