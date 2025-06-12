
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Pump } from '@/types';
import { KanbanCard } from '@/components/kanban/KanbanCard';
import { cn } from '@/lib/utils';

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
      <DialogContent className={cn(
        "sm:max-w-2xl max-h-[90vh] flex flex-col p-0",
        "glass-dialog-theme" // Apply the master class for glass styling
      )}>
        <DialogHeader className="p-6 pb-4 border-b border-[var(--glass-border)]">
          <DialogTitle>Details for Model: {modelName}</DialogTitle>
          <DialogDescription>
            Showing {pumpsInGroup.length} pump(s) of model {modelName} in this group.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6 my-4">
          <div className="space-y-3 pl-6"> 
            {pumpsInGroup.map((pump) => (
              <KanbanCard
                key={pump.id}
                pump={pump}
                onDragStart={() => {}} 
                isDraggable={false}
                onOpenDetailsModal={() => onOpenIndividualPumpDetails(pump)}
                // KanbanCard will be styled by .glass-dialog-theme .glass-card in globals.css
              />
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t border-[var(--glass-border)]">
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onClose} className="dialog-footer-button-outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
