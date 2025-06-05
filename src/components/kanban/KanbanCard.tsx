
"use client";

import React from 'react'; // Imported React for React.memo
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Pump } from '@/types';
import { GripVertical, Eye } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  pump: Pump;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, pumpId: string) => void;
  onCardClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onOpenDetailsModal?: () => void;
  isDraggable?: boolean;
  isSelected?: boolean;
}

// Wrap the component definition with React.memo
export const KanbanCard = React.memo(function KanbanCard({
  pump,
  onDragStart,
  onCardClick,
  onOpenDetailsModal,
  isDraggable = true,
  isSelected = false,
}: KanbanCardProps) {
  const displaySerialNumber = pump.serialNumber || 'N/A';

  const handleEyeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenDetailsModal) {
      onOpenDetailsModal();
    }
  };

  const priorityClass = () => {
    switch (pump.priority) {
      case 'high':
        return 'border-orange-500';
      case 'urgent':
        return 'border-red-600';
      default:
        return '';
    }
  };

  return (
    <Card
      draggable={isDraggable}
      onDragStart={isDraggable ? (e) => onDragStart(e, pump.id) : undefined}
      onClick={onCardClick}
      className={cn(
        "mb-3 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-150 ease-in-out bg-card group cursor-pointer",
        priorityClass(),
        isSelected && "ring-2 ring-primary ring-offset-1" // Selection ring, border controlled by priority or default
      )}
      aria-label={`Pump Model: ${pump.model}, Customer: ${pump.customer}, S/N: ${displaySerialNumber}, Priority: ${pump.priority || 'normal'}`}
    >
      <CardHeader className="p-3 flex flex-row items-start justify-between space-y-0 pb-1">
        <div className="flex-grow pr-2">
          <CardTitle className="text-sm font-semibold leading-none">
            {pump.model} - {pump.customer}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            S/N: {displaySerialNumber}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-1">
          {onOpenDetailsModal && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    onClick={handleEyeClick}
                    aria-label="View pump details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View pump details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {isDraggable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-grab" aria-label="Drag pump">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Drag pump</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {pump.durationDays !== undefined && (
          <p className="text-xs text-muted-foreground">
            Duration: {pump.durationDays} days
          </p>
        )}
      </CardContent>
    </Card>
  );
});
