
"use client";

import React from 'react';
import type { Pump, Stage, ViewMode } from '@/types';
import { KanbanCard } from './KanbanCard';
import { GroupedKanbanCard } from './GroupedKanbanCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanColumnProps {
  stage: Stage;
  pumps: Pump[];
  viewMode: ViewMode;
  onDragStartCard: (e: React.DragEvent<HTMLDivElement>, pumpId: string) => void;
  onDragStartGroupCard: (e: React.DragEvent<HTMLButtonElement>, pumpsToDrag: Pump[]) => void; // Changed to pass full pump objects
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, stageId: Stage['id']) => void;
  onCardClick: (pump: Pump) => void;
}

export function KanbanColumn({
  stage,
  pumps,
  viewMode,
  onDragStartCard,
  onDragStartGroupCard,
  onDragOver,
  onDrop,
  onCardClick,
}: KanbanColumnProps) {
  const Icon = stage.icon;

  const groupedPumpsByModel = React.useMemo(() => {
    // Grouping is always needed for condensed view logic, even if some are rendered individually
    return pumps.reduce((acc, pump) => {
      if (!acc[pump.model]) {
        acc[pump.model] = [];
      }
      acc[pump.model].push(pump);
      return acc;
    }, {} as Record<string, Pump[]>);
  }, [pumps]);

  return (
    <div
      className="flex-shrink-0 w-80 bg-secondary/50 rounded-lg shadow-sm h-full flex flex-col"
      onDragOver={onDragOver} // Always active
      onDrop={(e) => onDrop(e, stage.id)} // Always active
      aria-labelledby={`stage-title-${stage.id}`}
    >
      <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-secondary/50 z-10 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 id={`stage-title-${stage.id}`} className="text-md font-semibold text-foreground">
            {stage.title}
          </h2>
        </div>
        <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {pumps.length}
        </span>
      </div>
      <ScrollArea className="flex-grow p-4 kanban-column-content">
        {pumps.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground italic">
            No pumps in this stage.
          </div>
        ) : viewMode === 'default' ? (
          pumps.map((pump) => (
            <KanbanCard
              key={pump.id}
              pump={pump}
              onDragStart={onDragStartCard}
              onClick={() => onCardClick(pump)}
              isDraggable={true}
            />
          ))
        ) : ( // viewMode === 'condensed'
          Object.entries(groupedPumpsByModel).map(([model, pumpsInGroup]) => {
            if (pumpsInGroup.length > 1) {
              return (
                <GroupedKanbanCard
                  key={model}
                  model={model}
                  pumpsInGroup={pumpsInGroup}
                  onDragStartCustomerGroup={onDragStartGroupCard}
                />
              );
            } else {
              // Render individual KanbanCard if only one pump in the group
              const singlePump = pumpsInGroup[0];
              return (
                <KanbanCard
                  key={singlePump.id}
                  pump={singlePump}
                  onDragStart={onDragStartCard}
                  onClick={() => onCardClick(singlePump)}
                  isDraggable={true} // Individual cards in condensed view are draggable
                />
              );
            }
          })
        )}
      </ScrollArea>
    </div>
  );
}
