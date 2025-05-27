
"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Pump, ViewMode } from '@/types';
import { GripVertical, Eye } from 'lucide-react';

interface KanbanCardProps {
  pump: Pump;
  viewMode: ViewMode;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, pumpId: string) => void;
  onClick: () => void; // This prop is now for opening the modal
}

export function KanbanCard({ pump, viewMode, onDragStart, onClick }: KanbanCardProps) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, pump.id)}
      // onClick is removed from the Card itself
      className="mb-3 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-150 ease-in-out bg-card group"
      aria-label={`Pump: ${pump.serialNumber}, Customer: ${pump.customer}`}
    >
      <CardHeader className="p-3 flex flex-row items-start justify-between space-y-0">
        <div className="flex-grow pr-2">
          <CardTitle className="text-sm font-semibold leading-none">
            {pump.model} - {pump.serialNumber}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Customer: {pump.customer}
          </CardDescription>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card drag or other unwanted interactions
              onClick(); // Open details modal
            }}
            aria-label="View pump details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <div className="cursor-grab" aria-label="Drag pump">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      {viewMode === 'detailed' && (
        <CardContent className="p-3 pt-0 text-xs space-y-1">
          <div className="flex justify-between">
            <span>PO Number:</span>
            <span className="font-medium">{pump.poNumber}</span>
          </div>
          {pump.powderCoater && (
            <div className="flex justify-between">
              <span>Coater:</span>
              <span className="font-medium">{pump.powderCoater}</span>
            </div>
          )}
          {pump.powderCoatColor && (
            <div className="flex justify-between">
              <span>Color:</span>
              <span className="font-medium">{pump.powderCoatColor}</span>
            </div>
          )}
           <div className="pt-2">
             <Image 
                src="https://placehold.co/300x200.png" 
                alt="Pump placeholder image" 
                width={300} 
                height={200} 
                className="rounded-sm object-cover w-full"
                data-ai-hint="industrial pump"
              />
           </div>
        </CardContent>
      )}
    </Card>
  );
}
