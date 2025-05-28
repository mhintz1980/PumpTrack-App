
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Pump } from '@/types';
import { GripVertical, Eye } from 'lucide-react';

interface KanbanCardProps {
  pump: Pump;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, pumpId: string) => void;
  onClick: () => void;
}

export function KanbanCard({ pump, onDragStart, onClick }: KanbanCardProps) {
  const displaySerialNumber = pump.serialNumber || 'N/A';
  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, pump.id)}
      className="mb-3 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-150 ease-in-out bg-card group"
      aria-label={`Pump Model: ${pump.model}, Customer: ${pump.customer}, S/N: ${displaySerialNumber}`}
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
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation(); 
              onClick(); 
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
      {/* Removed detailed view section with image and extra fields. Details are in the modal. */}
    </Card>
  );
}
