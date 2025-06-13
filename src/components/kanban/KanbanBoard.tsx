
"use client";

import React from 'react';
import { STAGES } from '@/lib/constants';
import type { Pump, StageId, ViewMode } from '@/types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  pumps: Pump[];
  columnViewModes: Record<StageId, ViewMode>;
  onToggleColumnViewMode: (stageId: StageId) => void;
  onPumpMove: (pumpId: string, newStageId: StageId) => void;
  onMultiplePumpsMove: (pumpIds: string[], newStageId: StageId) => void;
  onOpenPumpDetailsModal: (pump: Pump) => void;
  onOpenGroupDetailsModal?: (model: string, pumpsInGroup: Pump[]) => void;
  selectedPumpIdsForDrag: string[];
  onPumpCardClick: (pump: Pump, event: React.MouseEvent<HTMLDivElement>) => void;
  explodedGroups: Record<StageId, Set<string>>;
  onToggleExplodeGroup: (stageId: StageId, model: string) => void;
}

export function KanbanBoard({
  pumps,
  columnViewModes,
  onToggleColumnViewMode,
  onPumpMove,
  onMultiplePumpsMove,
  onOpenPumpDetailsModal,
  onOpenGroupDetailsModal,
  selectedPumpIdsForDrag,
  onPumpCardClick,
  explodedGroups,
  onToggleExplodeGroup,
}: KanbanBoardProps) {
  const [draggedItemInfo, setDraggedItemInfo] = React.useState<{type: 'single'; id: string} | {type: 'group'; pumpIds: string[]} | null>(null);

  const handleDragStartSingle = (e: React.DragEvent<HTMLDivElement>, pumpId: string) => {
    if (selectedPumpIdsForDrag.includes(pumpId) && selectedPumpIdsForDrag.length > 1) {
      setDraggedItemInfo({ type: 'group', pumpIds: selectedPumpIdsForDrag });
      e.dataTransfer.setData('application/pump-group-ids', JSON.stringify(selectedPumpIdsForDrag));
    } else {
      setDraggedItemInfo({ type: 'single', id: pumpId });
      e.dataTransfer.setData('application/pump-id', pumpId);
    }
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragStartGroup = (e: React.DragEvent<HTMLButtonElement>, pumpsToDrag: Pump[]) => {
    const pumpIds = pumpsToDrag.map(p => p.id);
    setDraggedItemInfo({ type: 'group', pumpIds });
    e.dataTransfer.setData('application/pump-group-ids', JSON.stringify(pumpIds)); 
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
    <div className="glass-board-container px-6 overflow-x-auto h-full">
      {STAGES.map((stage) => (
        <KanbanColumn
          key={stage.id}
          stage={stage}
          pumps={pumps.filter((p) => p.currentStage === stage.id)}
          viewMode={columnViewModes[stage.id] || 'default'}
          onToggleViewMode={() => onToggleColumnViewMode(stage.id)}
          onDragStartCard={handleDragStartSingle}
          onDragStartGroupCard={handleDragStartGroup}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onOpenPumpDetailsModal={onOpenPumpDetailsModal}
          onOpenGroupDetailsModal={onOpenGroupDetailsModal}
          selectedPumpIdsForDrag={selectedPumpIdsForDrag}
          onPumpCardClick={onPumpCardClick}
          explodedModelsInStage={explodedGroups[stage.id] || new Set()}
          onToggleExplodeGroupForModel={(model) => onToggleExplodeGroup(stage.id, model)}
        />
      ))}
    </div>
  );
}
    
