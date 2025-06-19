"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CalendarBlockProps {
  label: string;
  duration: number;
  colorClass?: string;
  style?: React.CSSProperties;
}

export const CalendarBlock: React.FC<CalendarBlockProps> = ({
  label,
  duration,
  colorClass,
  style,
}) => {
  return (
    <div
      className={cn(
        "text-xs rounded-sm p-1 border shadow-sm overflow-hidden",
        colorClass,
      )}
      style={{ gridColumn: `span ${duration}`, ...style }}
    >
      {label}
    </div>
  );
};
