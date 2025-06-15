
'use client';

import React from 'react';
import type { Pump, Stage } from '@/types';
import { KanbanCard } from './KanbanCard';
import { GroupedKanbanCard } from './GroupedKanbanCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanColumnProps {
  stage: Stage;
  pumps: Pump[];
  onDragStartCard: (e: React.DragEvent<HTMLDivElement>, pumpId: string) => void;
  onDragStartGroupCard: (e: React.DragEvent<HTMLButtonElement>, pumpsToDrag: Pump[]) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, stageId: Stage['id']) => void;
  onOpenPumpDetailsModal: (pump: Pump) => void;
  onOpenGroupDetailsModal?: (model: string, pumpsInGroup: Pump[]) => void;
  selectedPumpIdsForDrag: string[];
  onPumpCardClick: (pump: Pump, event: React.MouseEvent<HTMLDivElement>) => void;
}

export function KanbanColumn({
  stage,
  pumps,
  onDragStartCard,
  onDragStartGroupCard,
  onDragOver,
  onDrop,
  onOpenPumpDetailsModal,
  onOpenGroupDetailsModal,
  selectedPumpIdsForDrag,
  onPumpCardClick,
}: KanbanColumnProps) {
  const Icon = stage.icon;

  return (
    <div
      className="glass-column"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage.id)}
      aria-labelledby={`stage-title-${stage.id}`}
    >
      <div className="glass-column-header">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 glass-column-icon" />
          <h2 id={`stage-title-${stage.id}`} className="text-md font-semibold glass-column-title">
            {stage.title}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium glass-column-count px-2 py-0.5 rounded-full">
            {pumps.length}
          </span>
        </div>
      </div>
      <ScrollArea className="flex-grow p-4 glass-scrollbar">
        {pumps.length === 0 ? (
          <div className="glass-empty-state">
            No pumps in this stage.
          </div>
        ) : ( // viewMode === 'condensed'
          pumps.map((pump) => (
            <KanbanCard
              key={pump.id}
              pump={pump}
              onDragStart={onDragStartCard}
              onCardClick={(event) => onPumpCardClick(pump, event)}
              onOpenDetailsModal={() => onOpenPumpDetailsModal(pump)}
              isDraggable={true}
              isSelected={selectedPumpIdsForDrag.includes(pump.id)}
            />
          ))
        )}
      </ScrollArea>
    </div>
  );
}
    
