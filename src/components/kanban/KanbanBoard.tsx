
"use client";

import React from 'react';
import { STAGES } from '@/lib/constants';
import type { Pump, StageId, ViewMode } from '@/types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  pumps: Pump[];
  viewMode: ViewMode;
  onPumpMove: (pumpId: string, newStageId: StageId) => void;
  onMultiplePumpsMove: (pumpIds: string[], newStageId: StageId) => void;
  onCardClick: (pump: Pump) => void;
}

export function KanbanBoard({ pumps, viewMode, onPumpMove, onMultiplePumpsMove, onCardClick }: KanbanBoardProps) {
  const [draggedItemInfo, setDraggedItemInfo] = React.useState<{type: 'single'; id: string} | {type: 'group'; pumpIds: string[]} | null>(null);

  const handleDragStartSingle = (e: React.DragEvent<HTMLDivElement>, pumpId: string) => {
    setDraggedItemInfo({ type: 'single', id: pumpId });
    e.dataTransfer.setData('application/pump-id', pumpId); // More specific type
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragStartGroup = (e: React.DragEvent<HTMLButtonElement>, pumpsToDrag: Pump[]) => {
    const pumpIds = pumpsToDrag.map(p => p.id);
    setDraggedItemInfo({ type: 'group', pumpIds });
    e.dataTransfer.setData('application/pump-group-ids', JSON.stringify(pumpIds)); // Store as JSON
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStageId: StageId) => {
    e.preventDefault();
    if (!draggedItemInfo) return;

    if (draggedItemInfo.type === 'single') {
      const pumpIdFromDataTransfer = e.dataTransfer.getData('application/pump-id');
      if (pumpIdFromDataTransfer === draggedItemInfo.id) {
        onPumpMove(draggedItemInfo.id, newStageId);
      }
    } else if (draggedItemInfo.type === 'group') {
      const pumpGroupIdsFromDataTransfer = e.dataTransfer.getData('application/pump-group-ids');
      try {
        const parsedPumpIds = JSON.parse(pumpGroupIdsFromDataTransfer) as string[];
        // Verify if the parsed IDs match what's in our state to prevent mismatches
        if (Array.isArray(parsedPumpIds) && parsedPumpIds.every(id => typeof id === 'string') && 
            JSON.stringify(parsedPumpIds.sort()) === JSON.stringify(draggedItemInfo.pumpIds.sort())) {
          onMultiplePumpsMove(draggedItemInfo.pumpIds, newStageId);
        } else {
          console.warn("Mismatched group drag data.");
        }
      } catch (error) {
        console.error("Error parsing dragged group data:", error);
      }
    }
    setDraggedItemInfo(null);
  };

  return (
    <div className="flex gap-4 p-4 overflow-x-auto h-[calc(100vh-var(--header-height)-2rem)]" style={{'--header-height': '88px'} as React.CSSProperties}>
      {STAGES.map((stage) => (
        <KanbanColumn
          key={stage.id}
          stage={stage}
          pumps={pumps.filter((p) => p.currentStage === stage.id)}
          viewMode={viewMode}
          onDragStartCard={handleDragStartSingle}
          onDragStartGroupCard={handleDragStartGroup}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
