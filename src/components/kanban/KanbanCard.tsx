
"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Pump, ViewMode } from '@/types';
import { GripVertical } from 'lucide-react';

interface KanbanCardProps {
  pump: Pump;
  viewMode: ViewMode;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, pumpId: string) => void;
  onClick: () => void;
}

export function KanbanCard({ pump, viewMode, onDragStart, onClick }: KanbanCardProps) {
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, pump.id)}
      onClick={onClick}
      className="mb-3 cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-150 ease-in-out bg-card"
      aria-label={`Pump: ${pump.serialNumber}, Customer: ${pump.customer}`}
    >
      <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex-grow">
          <CardTitle className="text-sm font-semibold leading-none">
            {pump.model} - {pump.serialNumber}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Customer: {pump.customer}
          </CardDescription>
        </div>
        <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
