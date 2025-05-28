
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
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, stageId: Stage['id']) => void;
  onCardClick: (pump: Pump) => void;
}

export function KanbanColumn({
  stage,
  pumps,
  viewMode,
  onDragStartCard,
  onDragOver,
  onDrop,
  onCardClick,
}: KanbanColumnProps) {
  const Icon = stage.icon;

  const groupedPumpsByModel = React.useMemo(() => {
    if (viewMode === 'condensed') {
      return pumps.reduce((acc, pump) => {
        if (!acc[pump.model]) {
          acc[pump.model] = [];
        }
        acc[pump.model].push(pump);
        return acc;
      }, {} as Record<string, Pump[]>);
    }
    return {};
  }, [pumps, viewMode]);

  return (
    <div
      className="flex-shrink-0 w-80 bg-secondary/50 rounded-lg shadow-sm h-full flex flex-col"
      onDragOver={viewMode === 'default' ? onDragOver : undefined} // Only allow drag over for default view
      onDrop={viewMode === 'default' ? (e) => onDrop(e, stage.id) : undefined} // Only allow drop for default view
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
            />
          ))
        ) : ( // viewMode === 'condensed'
          Object.entries(groupedPumpsByModel).map(([model, pumpsInGroup]) => (
            <GroupedKanbanCard
              key={model}
              model={model}
              pumpsInGroup={pumpsInGroup}
              // onCardClick prop is not passed here as grouped card interaction is different
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
