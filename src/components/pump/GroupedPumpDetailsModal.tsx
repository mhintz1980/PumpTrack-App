
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Pump } from '@/types';
import { KanbanCard } from '@/components/kanban/KanbanCard';

interface GroupedPumpDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string | null;
  pumpsInGroup: Pump[];
  onOpenIndividualPumpDetails: (pump: Pump) => void;
}

export function GroupedPumpDetailsModal({
  isOpen,
  onClose,
  modelName,
  pumpsInGroup,
  onOpenIndividualPumpDetails,
}: GroupedPumpDetailsModalProps) {
  if (!isOpen || !modelName) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Details for Model: {modelName}</DialogTitle>
          <DialogDescription>
            Showing {pumpsInGroup.length} pump(s) of model {modelName} in this group.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6 my-4">
          <div className="space-y-3">
            {pumpsInGroup.map((pump) => (
              <KanbanCard
                key={pump.id}
                pump={pump}
                onDragStart={() => {}} // No drag functionality needed or expected from here
                isDraggable={false}
                onOpenDetailsModal={() => onOpenIndividualPumpDetails(pump)}
                // onCardClick is not relevant in this modal's context for selection
              />
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
