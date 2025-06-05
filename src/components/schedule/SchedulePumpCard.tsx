
"use client";

import React from 'react'; // Imported React for React.memo
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Eye } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import type { Pump } from '@/types';

// PlannablePump extends Pump with daysPerUnit
interface PlannablePump extends Pump {
  daysPerUnit: number;
}

interface SchedulePumpCardProps {
  pump: PlannablePump;
  isSelected: boolean;
  onCardClick: (pump: PlannablePump, event: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent, pump: PlannablePump) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onOpenDetailsModal: (pump: PlannablePump) => void;
}

// Wrap the component definition with React.memo
export const SchedulePumpCard = React.memo(function SchedulePumpCard({
  pump,
  isSelected,
  onCardClick,
  onDragStart,
  onDragEnd,
  onOpenDetailsModal,
}: SchedulePumpCardProps) {
  const displaySerialNumber = pump.serialNumber || 'N/A';

  const handleEyeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    onOpenDetailsModal(pump);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click when dragging or if drag handle was clicked
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onCardClick(pump, e);
  };

  const handleDragStart = (e: React.DragEvent) => {
    console.log('🔥 SchedulePumpCard - handleDragStart called', {
      pumpId: pump.id,
      target: e.target,
      currentTarget: e.currentTarget,
      button: (e.nativeEvent as any).button, // Be cautious with 'any' in production
      buttons: (e.nativeEvent as any).buttons, // Be cautious with 'any' in production
      dataTransfer: e.dataTransfer, // This might be null or limited in console
      clientX: e.clientX,
      clientY: e.clientY
    });
    
    onDragStart(e, pump);
    
    console.log('🔥 After parent onDragStart (SchedulePumpCard) - dataTransfer types:', Array.from(e.dataTransfer.types));
    console.log('🔥 After parent onDragStart (SchedulePumpCard) - effectAllowed:', e.dataTransfer.effectAllowed);
  };

  const handleDragEndInternal = (e: React.DragEvent) => {
    console.log('🏁 SchedulePumpCard - handleDragEndInternal called', pump.id, 'dropEffect:', e.dataTransfer.dropEffect);
    const targetElement = e.currentTarget as HTMLElement;
    if (targetElement) {
        targetElement.style.opacity = '1'; // Ensure opacity is reset here too
    }
    
    if (onDragEnd) {
      onDragEnd(e);
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
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndInternal} // Use internal handler that calls parent
      onClick={handleCardClick}
      onDrag={(e) => {
        // console.log('🔄 SchedulePumpCard - onDrag event', pump.id, 'clientX:', e.clientX, 'clientY:', e.clientY);
      }}
      className={cn(
        "mb-3 shadow-md hover:shadow-lg transition-shadow duration-150 ease-in-out bg-card group cursor-grab active:cursor-grabbing select-none",
        priorityClass(),
        isSelected && "ring-2 ring-primary ring-offset-1"
      )}
      aria-label={`Pump Model: ${pump.model}, Customer: ${pump.customer}, S/N: ${displaySerialNumber}, Priority: ${pump.priority || 'normal'}`}
    >
      <CardHeader className="p-3 flex flex-row items-start justify-between space-y-0">
        <div className="flex-grow pr-2">
          <CardTitle className="text-sm font-semibold leading-none">
            {pump.model} - {pump.customer}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            S/N: {displaySerialNumber}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-1">
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="cursor-grab active:cursor-grabbing"
                  aria-label="Drag pump"
                  data-drag-handle="true" // This attribute can be used to distinguish drag handle clicks
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Drag pump</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
    </Card>
  );
});
