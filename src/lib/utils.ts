import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import type { Pump } from "@/types";

/**
 * Groups an array of pumps by their model.
 */
export function groupPumpsByModel(pumps: Pump[]): Record<string, Pump[]> {
  return pumps.reduce((acc, pump) => {
    if (!acc[pump.model]) {
      acc[pump.model] = [];
    }
    acc[pump.model].push(pump);
    return acc;
  }, {} as Record<string, Pump[]>);
}
