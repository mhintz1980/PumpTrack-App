
"use client";

import React from 'react';
import { STAGES } from '@/lib/constants';
import type { Pump, StageId, ViewMode } from '@/types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  pumps: Pump[];
  viewMode: ViewMode;
  onPumpMove: (pumpId: string, newStageId: StageId) => void;
  onCardClick: (pump: Pump) => void;
}

export function KanbanBoard({ pumps, viewMode, onPumpMove, onCardClick }: KanbanBoardProps) {
  const [draggedPumpId, setDraggedPumpId] = React.useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, pumpId: string) => {
    setDraggedPumpId(pumpId);
    e.dataTransfer.setData('text/plain', pumpId); // Required for Firefox
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStageId: StageId) => {
    e.preventDefault();
    if (draggedPumpId) {
      onPumpMove(draggedPumpId, newStageId);
      setDraggedPumpId(null);
    }
  };

  return (
    <div className="flex gap-4 p-4 overflow-x-auto h-[calc(100vh-var(--header-height)-2rem)]" style={{'--header-height': '88px'} as React.CSSProperties}> {/* Adjust header height as needed */}
      {STAGES.map((stage) => (
        <KanbanColumn
          key={stage.id}
          stage={stage}
          pumps={pumps.filter((p) => p.currentStage === stage.id)}
          viewMode={viewMode}
          onDragStartCard={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}
