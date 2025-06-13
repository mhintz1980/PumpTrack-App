
"use client";

import React from 'react';
import type { Pump, Stage, ViewMode } from '@/types';
import { KanbanCard } from './KanbanCard';
import { GroupedKanbanCard } from './GroupedKanbanCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { groupPumpsByModel } from "@/lib/utils";

interface KanbanColumnProps {
  stage: Stage;
  pumps: Pump[];
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  onDragStartCard: (e: React.DragEvent<HTMLDivElement>, pumpId: string) => void;
  onDragStartGroupCard: (e: React.DragEvent<HTMLButtonElement>, pumpsToDrag: Pump[]) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, stageId: Stage['id']) => void;
  onOpenPumpDetailsModal: (pump: Pump) => void;
  onOpenGroupDetailsModal?: (model: string, pumpsInGroup: Pump[]) => void;
  selectedPumpIdsForDrag: string[];
  onPumpCardClick: (pump: Pump, event: React.MouseEvent<HTMLDivElement>) => void;
  explodedModelsInStage: Set<string>;
  onToggleExplodeGroupForModel: (model: string) => void;
}

export function KanbanColumn({
  stage,
  pumps,
  viewMode,
  onToggleViewMode,
  onDragStartCard,
  onDragStartGroupCard,
  onDragOver,
  onDrop,
  onOpenPumpDetailsModal,
  onOpenGroupDetailsModal,
  selectedPumpIdsForDrag,
  onPumpCardClick,
  explodedModelsInStage,
  onToggleExplodeGroupForModel,
}: KanbanColumnProps) {
  const Icon = stage.icon;

  const groupedPumpsByModel = React.useMemo(() => groupPumpsByModel(pumps), [pumps]);

  const switchId = `view-mode-toggle-${stage.id}`;

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1">
                  <Switch
                    id={switchId}
                    checked={viewMode === 'condensed'}
                    onCheckedChange={onToggleViewMode}
                    className="glass-switch h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3 [&>span]:data-[state=unchecked]:translate-x-0.5"
                    aria-label={`Toggle grouped view for ${stage.title}`}
                  />
                   <Label htmlFor={switchId} className="text-xs cursor-pointer select-none" style={{color: 'var(--glass-text-secondary)'}}>
                    Group
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8} className="text-xs py-1 px-2 glass-tooltip">
                <p>Toggle Grouped View</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <ScrollArea className="flex-grow p-4 glass-scrollbar">
        {pumps.length === 0 ? (
          <div className="glass-empty-state">
            No pumps in this stage.
          </div>
        ) : viewMode === 'default' ? (
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
        ) : ( // viewMode === 'condensed'
          Object.entries(groupedPumpsByModel).map(([model, pumpsInGroup]) => {
            if (explodedModelsInStage.has(model)) {
              return pumpsInGroup.map((pump) => (
                <KanbanCard
                  key={pump.id}
                  pump={pump}
                  onDragStart={onDragStartCard}
                  onCardClick={(event) => onPumpCardClick(pump, event)}
                  onOpenDetailsModal={() => onOpenPumpDetailsModal(pump)}
                  isDraggable={true} 
                  isSelected={selectedPumpIdsForDrag.includes(pump.id)}
                />
              ));
            } else {
              if (pumpsInGroup.length > 1) {
                return (
                  <GroupedKanbanCard
                    key={model}
                    model={model}
                    pumpsInGroup={pumpsInGroup}
                    onDragStartCustomerGroup={onDragStartGroupCard}
                    onOpenGroupDetailsModal={onOpenGroupDetailsModal}
                    onToggleExplode={() => onToggleExplodeGroupForModel(model)}
                  />
                );
              } else { 
                const singlePump = pumpsInGroup[0];
                return (
                  <KanbanCard
                    key={singlePump.id}
                    pump={singlePump}
                    onDragStart={onDragStartCard}
                    onCardClick={(event) => onPumpCardClick(singlePump, event)}
                    onOpenDetailsModal={() => onOpenPumpDetailsModal(singlePump)}
                    isDraggable={true} 
                    isSelected={selectedPumpIdsForDrag.includes(singlePump.id)}
                  />
                );
              }
            }
          })
        )}
      </ScrollArea>
    </div>
  );
}
    
