"use client";

import React from "react";
import { SchedulePumpCard } from "@/components/schedule/SchedulePumpCard";
import type { Pump } from "@/types";

export interface BacklogPump extends Pump {
  daysPerUnit: number;
}

interface KanbanBacklogProps {
  pumps: BacklogPump[];
  selectedPumpIds: string[];
  onCardClick: (pump: BacklogPump, e: React.MouseEvent) => void;
  onOpenDetailsModal: (pump: BacklogPump) => void;
}

export const KanbanBacklog: React.FC<KanbanBacklogProps> = ({
  pumps,
  selectedPumpIds,
  onCardClick,
  onOpenDetailsModal,
}) => {
  if (pumps.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No unscheduled pumps.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-1">
      {pumps.map((pump) => (
        <SchedulePumpCard
          key={pump.id}
          pump={pump}
          isSelected={selectedPumpIds.includes(pump.id)}
          onCardClick={(p, e) => onCardClick(pump, e)}
          onOpenDetailsModal={() => onOpenDetailsModal(pump)}
        />
      ))}
    </div>
  );
};
